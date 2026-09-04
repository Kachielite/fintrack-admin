import { useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { SparkLine } from '@/components/charts/SparkLine';
import { LineChartWidget } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { useAiUsage } from '@/hooks/use-ai-usage';
import { fmt } from '@/utils/fmt';
import { downloadCsv } from '@/utils/csv-export';

const PALETTE = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
const TARGET_CPT = 0.0001;

export function AIUsagePage() {
  const [range, setRange] = useState('30d');
  const { data, isLoading, isError } = useAiUsage();

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState />;

  const ai = data;

  // Merge trend and cost_per_transaction_trend by date for the chart
  const cptMap = new Map(ai.cost_per_transaction_trend.map((d) => [d.date, d.cost_per_tx]));
  const costTrend = ai.trend.map((d) => ({
    date: d.date,
    cost: d.estimated_cost_usd,
    calls: d.call_count,
    cpt: cptMap.get(d.date) ?? 0,
  }));

  const opDonut = ai.by_operation.map((o, i) => ({
    name: o.operation,
    value: o.estimated_cost_usd,
    color: PALETTE[i % PALETTE.length],
  }));

  function handleExport() {
    downloadCsv(`ai-usage-${range}.csv`, ai.by_operation);
  }

  return (
    <div>
      <PageHeader
        title="AI Usage & Cost"
        subtitle="Token consumption and operating cost — should fall as regex coverage grows"
        actions={
          <>
            <select className="input" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn" onClick={handleExport}><Download size={14} /> Export</button>
          </>
        }
      />

      <div className="grid">
        <div className="col-3">
          <MetricCard
            label="Total tokens (30d)"
            value={fmt.numK(ai.totals.total_tokens)}
            sub={
              <>
                <span className="mono dim">prompt</span>{' '}
                <span className="mono">{fmt.numK(ai.totals.prompt_tokens)}</span>
                <span className="dim"> · </span>
                <span className="mono dim">completion</span>{' '}
                <span className="mono">{fmt.numK(ai.totals.completion_tokens)}</span>
              </>
            }
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Estimated cost (30d)"
            value={fmt.usd(ai.totals.estimated_cost_usd)}
            trend="−18.2%"
            trendDir="down"
            trendGood
          >
            {costTrend.length > 1 && (
              <SparkLine values={costTrend.map((d) => d.cost)} color="var(--c1)" />
            )}
          </MetricCard>
        </div>
        <div className="col-3">
          <MetricCard
            label="Cost per transaction"
            value={fmt.cpt(ai.cost_per_transaction_30d)}
            info="Total AI cost ÷ total transactions parsed (regex + AI). The number that should fall."
            trend="−24%"
            trendDir="down"
            trendGood
          >
            {costTrend.length > 1 && (
              <SparkLine values={costTrend.map((d) => d.cpt)} color="var(--c2)" />
            )}
          </MetricCard>
        </div>
        <div className="col-3">
          <MetricCard
            label="AI calls (30d)"
            value={fmt.numK(ai.totals.call_count)}
            sub={<>{(ai.totals.call_count / 30).toFixed(0)}/day avg</>}
          />
        </div>
      </div>

      <div className="section-gap" />

      <div className="card">
        <SectionHeader
          title="Cost trend"
          subtitle={`Daily cost (left) and cost-per-transaction (right). Target: $${TARGET_CPT.toFixed(4)}/tx`}
          action={
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-swatch" style={{ background: 'var(--c1)' }} /> Cost / day
              </div>
              <div className="legend-item">
                <span className="legend-swatch" style={{ background: 'var(--c2)' }} /> Cost / tx
              </div>
              <div className="legend-item">
                <span style={{ display: 'inline-block', width: 16, borderTop: '1px dashed var(--brand)' }} /> Target
              </div>
            </div>
          }
        />
        <LineChartWidget
          data={costTrend}
          height={280}
          xKey="date"
          yFormatter={(v) => fmt.usd(v, 0)}
          series={[
            { key: 'cost', label: 'Daily cost', color: 'var(--c1)', areaOpacity: 0.12, format: (v) => fmt.usd(v) },
            { key: 'cpt', label: 'Cost / tx', color: 'var(--c2)', dash: '3 3', format: (v) => '$' + v.toFixed(6) },
          ]}
          rightAxis={{
            key: 'cpt',
            formatter: (v) => '$' + v.toFixed(5),
            target: TARGET_CPT,
            targetLabel: `target $${TARGET_CPT.toFixed(5)}`,
            color: 'var(--c2)',
          }}
        />
      </div>

      <div className="section-gap" />

      <div className="grid">
        <div className="col-8">
          <div className="card no-pad">
            <div style={{ padding: '20px 20px 12px' }}>
              <SectionHeader
                title="By operation"
                subtitle="Most expensive operations are candidates for regex replacement"
              />
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th style={{ textAlign: 'right' }}>Calls</th>
                    <th style={{ textAlign: 'right' }}>Tokens</th>
                    <th style={{ textAlign: 'right' }}>Cost</th>
                    <th style={{ minWidth: 160 }}>% of total</th>
                  </tr>
                </thead>
                <tbody>
                  {ai.by_operation.map((o, i) => (
                    <tr key={o.operation}>
                      <td className="code" style={{ color: 'var(--text-primary)' }}>
                        <span
                          className="legend-swatch"
                          style={{
                            background: PALETTE[i % PALETTE.length],
                            display: 'inline-block',
                            marginRight: 8,
                            verticalAlign: 'middle',
                          }}
                        />
                        {o.operation}
                      </td>
                      <td className="num">{fmt.num(o.call_count)}</td>
                      <td className="num">{fmt.numK(o.total_tokens)}</td>
                      <td className="num" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {fmt.usd(o.estimated_cost_usd)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress" style={{ flex: 1 }}>
                            <div
                              className="progress-fill"
                              style={{ width: `${o.pct_of_total_cost}%`, background: PALETTE[i % PALETTE.length] }}
                            />
                          </div>
                          <span className="mono" style={{ fontSize: 12, minWidth: 38, textAlign: 'right' }}>
                            {o.pct_of_total_cost.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Cost distribution" />
            <DonutChart
              data={opDonut}
              centerValue={fmt.usd(ai.totals.estimated_cost_usd, 0)}
              centerLabel="30d total"
              formatValue={fmt.usd}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
