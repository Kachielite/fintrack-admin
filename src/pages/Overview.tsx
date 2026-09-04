import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useOverview } from '@/hooks/use-overview';
import { fmt } from '@/utils/fmt';
import { useState } from 'react';

export function OverviewPage() {
  const [range, setRange] = useState('30d');
  const { data, isLoading, isError, refetch, isRefetching } = useOverview();

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState />;

  const ov = data;

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`Platform health at a glance · ${new Date().toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'short',
        })}`}
        actions={
          <>
            <select className="input" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw size={14} style={isRefetching ? { animation: 'spin 0.7s linear infinite' } : undefined} /> Refresh
            </button>
          </>
        }
      />

      {/* Top metric row */}
      <div className="grid">
        <div className="col-3">
          <MetricCard
            label="Total transactions"
            value={fmt.numK(ov.transactions.total_count)}
            sub={
              <>
                <span className="mono">{fmt.numK(ov.transactions.handled_by_regex)}</span> regex
                <span style={{ color: 'var(--text-tertiary)' }}> · </span>
                <span className="mono">{fmt.numK(ov.transactions.handled_by_ai)}</span> AI
              </>
            }
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Regex rate"
            value={fmt.pct(ov.transactions.regex_rate_pct)}
            sub={
              <>
                30d: <span className="mono" style={{ color: 'var(--text-primary)' }}>
                  {fmt.pct(ov.transactions.regex_rate_30d_pct)}
                </span>
              </>
            }
            trend="+3.8pp"
            trendDir="up"
            trendGood
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Active users (30d)"
            value={fmt.numK(ov.users.active_30d)}
            trend="+12.4%"
            trendDir="up"
            trendGood
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="AI cost this month"
            value={fmt.usd(ov.ai_cost.estimated_cost_30d_usd)}
            sub={
              <>
                cost / tx:{' '}
                <span className="mono" style={{ color: 'var(--text-primary)' }}>
                  {fmt.cpt(ov.ai_cost.cost_per_transaction_30d)}
                </span>
              </>
            }
            trend="−18.2%"
            trendDir="down"
            trendGood
          />
        </div>
      </div>

      <div className="section-gap" />

      {/* Regex snapshot */}
      <SectionHeader title="Regex engine" subtitle="Production parsing coverage" />
      <div className="grid">
        <div className="col-4">
          <div className="card metric-card">
            <div className="metric-label">Templates in production</div>
            <div className="metric-value">
              <span style={{ color: 'var(--text-primary)' }}>{ov.regex_engine.production}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7em' }}>
                {' '}/ {ov.regex_engine.total_templates}
              </span>
            </div>
            <div className="metric-sub">
              <span style={{ flex: 1 }}>
                <Progress
                  value={(ov.regex_engine.production / Math.max(1, ov.regex_engine.total_templates)) * 100}
                  kind="healthy"
                  showLabel={false}
                />
              </span>
              <span className="mono dim">
                {((ov.regex_engine.production / Math.max(1, ov.regex_engine.total_templates)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        <div className="col-4">
          <MetricCard
            label="Average confidence"
            value={fmt.pct(ov.regex_engine.avg_confidence_score)}
            sub={<>across {ov.regex_engine.production} active templates</>}
            trend="+1.2pp"
            trendDir="up"
            trendGood
          />
        </div>
        <div className="col-4">
          <div className="card metric-card">
            <div className="metric-label">Bank coverage</div>
            <div className="metric-value">
              <span style={{ color: 'var(--healthy)' }}>{ov.regex_engine.banks_with_coverage}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7em' }}>
                {' '}/ {ov.regex_engine.banks_with_coverage + ov.regex_engine.banks_without_coverage}
              </span>
            </div>
            <div className="metric-sub">
              {ov.regex_engine.banks_without_coverage > 0 && (
                <Badge kind="no_coverage">
                  {ov.regex_engine.banks_without_coverage} banks no coverage
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="section-gap" />

      {/* Bottom three panels */}
      <div className="grid">
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Ingestion health" />
            <div className="col" style={{ gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="pulse-dot" />
                </span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>Active connections</span>
                <span className="mono" style={{ fontSize: 18 }}>{fmt.num(ov.ingestion.connections_active)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                  <AlertTriangle size={14} />
                </span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>Stale connections</span>
                <span className="mono" style={{ fontSize: 18, color: 'var(--warning)' }}>
                  {ov.ingestion.connections_stale}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--healthy)' }}>
                  <CheckCircle size={14} />
                </span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>30d email processed</span>
                <span className="mono" style={{ fontSize: 18, color: 'var(--healthy)' }}>
                  {fmt.numK(ov.ingestion.emails_processed_30d)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Audit queue" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
              <span className="dim">Unreviewed templates</span>
              <Badge kind={ov.regex_engine.candidate > 0 ? 'candidate' : 'healthy'}>
                {ov.regex_engine.candidate} pending
              </Badge>
            </div>
            {ov.regex_engine.candidate === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
                No templates waiting
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <span className="mono" style={{ color: 'var(--warning)', fontSize: 18, fontWeight: 700 }}>
                  {ov.regex_engine.candidate}
                </span>{' '}
                candidate templates awaiting audit
                {ov.regex_engine.failed_audit > 0 && (
                  <div style={{ marginTop: 8, color: 'var(--critical)' }}>
                    <span className="mono" style={{ fontWeight: 700 }}>{ov.regex_engine.failed_audit}</span> failed audit
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <SectionHeader title="User funnel" subtitle="All-time signup → activation" />
            <div className="col" style={{ gap: 8 }}>
              {[
                { step: 'Signed up', count: ov.users.total },
                { step: 'Email connected', count: ov.users.email_connected },
                { step: 'Onboarding complete', count: ov.users.onboarding_complete },
              ].map((step, i) => {
                const top = ov.users.total;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ flex: 1 }}>{step.step}</span>
                      <span className="mono dim">{fmt.num(step.count)}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-fill healthy"
                        style={{ width: `${(step.count / top) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
