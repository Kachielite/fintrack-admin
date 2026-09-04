import { useMemo, useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { HorizontalBars } from '@/components/charts/BarChart';
import { useTransactionVolume } from '@/hooks/use-transaction-volume';
import { fmt } from '@/utils/fmt';
import { downloadCsv } from '@/utils/csv-export';
import { resolveDateRange } from '@/utils/date-range';

export function TransactionsPage() {
  const [range, setRange] = useState('30d');
  // resolveDateRange calls new Date() internally, so calling it inline in the
  // render body produced a millisecond-different {from, to} on every render.
  // That object feeds useTransactionVolume's queryKey, so React Query saw a
  // "new" query every render, refetched, the state update triggered another
  // render, and so on - an infinite refetch loop hitting production
  // continuously. Memoized so it only recomputes when range actually
  // changes.
  const dateRange = useMemo(() => resolveDateRange(range), [range]);
  const { data, isLoading, isError } = useTransactionVolume(dateRange);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState />;

  const byBankData = data.by_bank.map((b) => ({ name: b.bank_name, value: b.count }));
  const byCurrencyData = data.by_currency.map((c) => ({ name: c.currency, value: c.count }));
  const byCatData = data.by_category.map((c, i) => ({
    name: c.category,
    value: c.count,
    color: `var(--c${(i % 6) + 1})`,
  }));

  function handleExport() {
    const rows = [
      ...data!.by_bank.map((b) => ({ breakdown: 'by_bank', name: b.bank_name, count: b.count })),
      ...data!.by_currency.map((c) => ({ breakdown: 'by_currency', name: c.currency, count: c.count })),
      ...data!.by_category.map((c) => ({ breakdown: 'by_category', name: c.category, count: c.count })),
    ];
    downloadCsv(`transactions-${range}.csv`, rows);
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Volume and value flowing through the platform"
        actions={
          <div className="filter-bar">
            <select className="input" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
            <button className="btn"><Filter size={14} /> Filter</button>
            <button className="btn" onClick={handleExport}><Download size={14} /> Export</button>
          </div>
        }
      />

      <div className="grid">
        <div className="col-3">
          <MetricCard
            label="Total transactions"
            value={fmt.numK(data.totals.count)}
            trend="+8.4%"
            trendDir="up"
            trendGood
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Total debit"
            value={fmt.numK(data.totals.total_debit_ref)}
            sub={<>across {data.by_currency.length} currencies</>}
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Total credit"
            value={fmt.numK(data.totals.total_credit_ref)}
            sub={
              <span style={{ color: 'var(--healthy)' }}>
                net {fmt.numK(data.totals.total_credit_ref - data.totals.total_debit_ref)}
              </span>
            }
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Unique banks"
            value={data.by_bank.length}
            sub={
              <>
                active:{' '}
                <span className="mono" style={{ color: 'var(--healthy)' }}>
                  {data.by_bank.filter((b) => b.count > 0).length}
                </span>
              </>
            }
          />
        </div>
      </div>

      <div className="section-gap" />

      <div className="card">
        <SectionHeader
          title="Transactions by bank"
          subtitle={`${fmt.numK(data.totals.count)} transactions, last 30 days`}
        />
        <HorizontalBars data={byBankData} />
      </div>

      <div className="section-gap" />

      <div className="grid">
        <div className="col-6">
          <div className="card">
            <SectionHeader title="By currency" subtitle="Transaction count per currency" />
            <HorizontalBars data={byCurrencyData} />
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <SectionHeader title="By category" subtitle="Top categories, 30 days" />
            <HorizontalBars data={byCatData} />
          </div>
        </div>
      </div>
    </div>
  );
}
