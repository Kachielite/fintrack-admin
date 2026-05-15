import { useState } from 'react';
import { RefreshCw, Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChartWidget } from '@/components/charts/BarChart';
import { useIngestionHealth } from '@/hooks/use-ingestion-health';
import { useIngestionTimeline } from '@/hooks/use-ingestion-timeline';
import { fmt } from '@/utils/fmt';

function formatLastSynced(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) return 'never';
  const diff = Date.now() - new Date(lastSyncedAt).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return '<1h ago';
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function IngestionPage() {
  const [range, setRange] = useState('30d');
  const { data: health, isLoading: hLoading, isError: hError } = useIngestionHealth();
  const { data: timeline, isLoading: tLoading, isError: tError } = useIngestionTimeline();

  if (hLoading || tLoading) return <Spinner />;
  if (hError || !health) return <ErrorState />;

  const conn = health.connections;
  const pipe = health.pipeline_30d;
  const outcomes = health.outcomes_30d;
  const total = outcomes.parsed + outcomes.non_transaction + outcomes.failed;
  const successRate = total > 0 ? ((outcomes.parsed / total) * 100) : 0;

  const donutData = [
    { name: 'Parsed', value: outcomes.parsed, color: 'var(--c1)' },
    { name: 'Non-transaction', value: outcomes.non_transaction, color: 'var(--neutral)' },
    { name: 'Failed', value: outcomes.failed, color: 'var(--c5)' },
  ];

  const timelineData = (timeline?.buckets ?? []).map((d) => ({
    date: d.date,
    parsed: d.parsed,
    failed: d.failed,
    regex: d.regex_handled,
    ai: d.ai_handled,
  }));

  return (
    <div>
      <PageHeader
        title="Ingestion Pipeline"
        subtitle="Gmail connections and email processing health"
        actions={
          <>
            <select className="input" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <button className="btn"><RefreshCw size={14} /> Refresh</button>
          </>
        }
      />

      <SectionHeader title="Connection health" />
      <div className="grid">
        <div className="col-3">
          <MetricCard
            label="Active connections"
            value={fmt.num(conn.active)}
            sub={<><span className="pulse-dot" /> syncing</>}
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Stale (>48h)"
            value={conn.stale}
            sub={<span style={{ color: 'var(--warning)' }}>needs reconnect</span>}
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Total connections"
            value={conn.total}
            sub={<span className="dim">{conn.total - conn.active - conn.stale} other</span>}
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="30d success rate"
            value={fmt.pct(successRate)}
            trend="+0.4pp"
            trendDir="up"
            trendGood
          />
        </div>
      </div>

      <div className="section-gap" />

      {/* Stale connections table */}
      {conn.stale_list.length > 0 && (
        <div className="card no-pad">
          <div style={{ padding: '20px 20px 12px' }}>
            <SectionHeader
              title="Stale connections"
              subtitle="Sync paused — flag rows >48h"
              action={
                <button className="btn sm">
                  <Mail size={12} /> Send reconnect email
                </button>
              }
            />
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Gmail address</th>
                  <th>Last synced</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {conn.stale_list.map((c) => (
                  <tr key={c.connection_id}>
                    <td className="code">{c.gmail_address}</td>
                    <td
                      className="num"
                      style={{ color: 'var(--warning)', textAlign: 'left' }}
                    >
                      {formatLastSynced(c.last_synced_at)}
                    </td>
                    <td>
                      <Badge kind={c.status === 'revoked' ? 'critical' : 'degrading'}>{c.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn sm ghost row-action">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section-gap" />

      <SectionHeader title="Pipeline metrics" subtitle="Last 30 days" />
      <div className="grid">
        <div className="col-3">
          <MetricCard label="Emails processed" value={fmt.numK(pipe.emails_processed)} />
        </div>
        <div className="col-3">
          <MetricCard label="Success rate" value={fmt.pct(100 - pipe.failure_rate_pct)} />
        </div>
        <div className="col-3">
          <MetricCard
            label="Failed"
            value={fmt.num(pipe.emails_failed)}
            sub={
              <span style={{ color: 'var(--warning)' }}>
                {pipe.failure_rate_pct.toFixed(2)}% of total
              </span>
            }
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Non-transaction"
            value={fmt.num(pipe.non_transaction_classified)}
            info="Emails classified as not containing a parseable transaction"
          />
        </div>
      </div>

      <div className="section-gap" />

      <div className="grid">
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Outcomes" subtitle="30-day breakdown" />
            <DonutChart
              data={donutData}
              centerValue={fmt.numK(total)}
              centerLabel="Emails"
              formatValue={(v) => `${fmt.num(v)} · ${((v / Math.max(1, total)) * 100).toFixed(1)}%`}
            />
          </div>
        </div>
        <div className="col-8">
          <div className="card">
            <SectionHeader
              title="Daily processing"
              subtitle="Stacked bars by outcome"
              action={
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: 'var(--c1)' }} /> Parsed
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: 'var(--c2)' }} /> Regex
                  </div>
                  <div className="legend-item">
                    <span className="legend-swatch" style={{ background: 'var(--c5)' }} /> Failed
                  </div>
                </div>
              }
            />
            {tError || !timeline ? (
              <ErrorState />
            ) : (
              <BarChartWidget
                data={timelineData}
                height={260}
                nameKey="date"
                series={[
                  { key: 'parsed', label: 'Parsed', color: 'var(--c1)', stackId: 'stack' },
                  { key: 'regex', label: 'Regex', color: 'var(--c2)', stackId: 'stack' },
                  { key: 'failed', label: 'Failed', color: 'var(--c5)', stackId: 'stack' },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
