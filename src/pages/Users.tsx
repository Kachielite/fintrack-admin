import { PageHeader } from '@/components/layout/PageHeader';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Progress } from '@/components/ui/Progress';
import { Funnel } from '@/components/ui/Funnel';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useUserStats } from '@/hooks/use-user-stats';
import { fmt } from '@/utils/fmt';

const PLAN_COLORS = ['var(--c4)', 'var(--c1)', 'var(--c2)'];

function RetentionRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = (value / Math.max(1, total)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span>
          <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{fmt.num(value)}</span>
          {' '}
          <span className="dim mono">/ {fmt.num(total)}</span>
        </span>
      </div>
      <Progress value={pct} kind="healthy" showLabel={false} />
    </div>
  );
}

export function UsersPage() {
  const { data, isLoading, isError } = useUserStats();

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState />;

  const u = data;
  const planDistribution = [
    { name: 'Free', count: u.by_plan.free },
    { name: 'Pro', count: u.by_plan.pro },
    { name: 'Premium', count: u.by_plan.premium },
  ];
  const planTotal = planDistribution.reduce((s, p) => s + p.count, 0);
  const onboardingPct = u.total_users > 0
    ? (u.onboarding_funnel.onboarding_complete / u.total_users) * 100
    : 0;

  const funnelSteps = [
    { step: 'Signed up', count: u.onboarding_funnel.signed_up },
    { step: 'Email connected', count: u.onboarding_funnel.email_connected },
    { step: 'Onboarding complete', count: u.onboarding_funnel.onboarding_complete },
    { step: 'First transaction', count: u.onboarding_funnel.first_transaction_parsed },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="Activation, plans, and retention" />

      <div className="grid">
        <div className="col-3">
          <MetricCard label="Total users" value={fmt.numK(u.total_users)} trend="+8.5%" trendDir="up" trendGood />
        </div>
        <div className="col-3">
          <MetricCard
            label="New this month"
            value={fmt.num(u.new_users_30d)}
            sub={<>{(u.new_users_30d / 30).toFixed(0)}/day avg</>}
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Active (30d)"
            value={fmt.numK(u.active_30d)}
            sub={<>{((u.active_30d / Math.max(1, u.total_users)) * 100).toFixed(0)}% of base</>}
          />
        </div>
        <div className="col-3">
          <MetricCard
            label="Onboarding"
            value={fmt.pct(onboardingPct)}
            sub={<>completes activation</>}
          />
        </div>
      </div>

      <div className="section-gap" />

      <div className="grid">
        <div className="col-7">
          <div className="card">
            <SectionHeader
              title="Plan distribution"
              subtitle={`${fmt.num(planTotal)} users across ${planDistribution.length} tiers`}
            />
            <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              {planDistribution.map((p, i) => (
                <div
                  key={p.name}
                  style={{
                    width: `${(p.count / Math.max(1, planTotal)) * 100}%`,
                    background: PLAN_COLORS[i % PLAN_COLORS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0d0c',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {((p.count / Math.max(1, planTotal)) * 100).toFixed(0)}%
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {planDistribution.map((p, i) => (
                <div
                  key={p.name}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: 12,
                    background: 'var(--bg-page)',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                  }}
                >
                  <span
                    className="legend-swatch"
                    style={{ background: PLAN_COLORS[i % PLAN_COLORS.length], width: 12, height: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.name}</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{fmt.num(p.count)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-5">
          <div className="card">
            <SectionHeader title="Retention" subtitle="Users with a transaction" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              <RetentionRow label="Last 7 days" value={u.retention.users_with_tx_last_7d} total={u.total_users} />
              <RetentionRow label="Last 30 days" value={u.retention.users_with_tx_last_30d} total={u.total_users} />
            </div>
          </div>
        </div>
      </div>

      <div className="section-gap" />

      <div className="card">
        <SectionHeader
          title="Onboarding funnel"
          subtitle="Drop-offs > 25% are flagged · gaps between email-connected → first-tx are the key friction points"
        />
        <Funnel steps={funnelSteps} />
      </div>
    </div>
  );
}
