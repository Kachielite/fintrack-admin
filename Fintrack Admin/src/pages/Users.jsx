// ============ Users ============
const UsersPage = () => {
  const m = window.MOCK;
  const u = m.users;
  const planTotal = u.plans.reduce((s, p) => s + p.count, 0);

  return (
    <div data-screen-label="Users">
      <PageHeader title="Users" subtitle="Activation, plans, and retention"/>

      <div className="grid">
        <div className="col-3"><MetricCard label="Total users" value={fmt.numK(u.total)} trend="+8.5%" trendDir="up" trendGood/></div>
        <div className="col-3"><MetricCard label="New this month" value={fmt.num(u.newThisMonth)} sub={<>{(u.newThisMonth / 30).toFixed(0)}/day avg</>}/></div>
        <div className="col-3"><MetricCard label="Active (30d)" value={fmt.numK(u.active30d)} sub={<>{((u.active30d / u.total) * 100).toFixed(0)}% of base</>}/></div>
        <div className="col-3"><MetricCard label="Onboarding" value={fmt.pct(u.onboardingPct)} sub={<>completes activation</>}/></div>
      </div>

      <div className="section-gap"></div>

      {/* Plans + retention */}
      <div className="grid">
        <div className="col-7">
          <div className="card">
            <SectionHeader title="Plan distribution" subtitle={`${fmt.num(planTotal)} users across 3 tiers`}/>
            <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              {u.plans.map(p => (
                <div key={p.name} style={{
                  width: `${(p.count / planTotal) * 100}%`,
                  background: p.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0a0d0c', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                }}>{((p.count / planTotal) * 100).toFixed(0)}%</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {u.plans.map(p => (
                <div key={p.name} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--bg-page)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <span className="legend-swatch" style={{ background: p.color, width: 12, height: 12 }}/>
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
            <SectionHeader title="Retention" subtitle="Users with a transaction"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              <RetentionRow label="Last 7 days" value={u.retention7d} total={u.total}/>
              <RetentionRow label="Last 30 days" value={u.retention30d} total={u.total}/>
            </div>
          </div>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Funnel */}
      <div className="card">
        <SectionHeader title="Onboarding funnel"
          subtitle="Drop-offs > 25% are flagged · gaps between email-connected → first-tx are the key friction points"/>
        <Funnel steps={m.funnel}/>
      </div>
    </div>
  );
};

const RetentionRow = ({ label, value, total }) => {
  const pct = (value / total) * 100;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span><span className="mono" style={{fontSize: 22, fontWeight: 700}}>{fmt.num(value)}</span> <span className="dim mono">/ {fmt.num(total)}</span></span>
      </div>
      <Progress value={pct} kind="healthy" showLabel={false}/>
    </div>
  );
};
window.UsersPage = UsersPage;
