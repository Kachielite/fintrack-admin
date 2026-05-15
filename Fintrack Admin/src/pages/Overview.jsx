// ============ Overview ============
const OverviewPage = () => {
  const m = window.MOCK;
  const ov = m.overview;
  const sparkRegex = ov.handoff.map(d => d.regex);
  const sparkAi = ov.handoff.map(d => d.ai);
  const sparkUsers = ov.handoff.map((d, i) => 4000 + i * 12 + (i % 5) * 30);
  const sparkCost = ov.handoff.map((d, i) => 9 - i * 0.13 + Math.sin(i / 3) * 0.4);

  const annoIndex = ov.handoff.findIndex(d => d.regex / d.total >= 0.80);
  const annotation = annoIndex >= 0 ? {
    index: annoIndex,
    value: ov.handoff[annoIndex].regex,
    label: 'Crossed 80% regex rate',
  } : null;

  return (
    <div data-screen-label="Overview">
      <PageHeader
        title="Overview"
        subtitle={`Platform health at a glance · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}`}
        actions={
          <>
            <select className="input" defaultValue="30d">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn"><Icon name="refresh"/> Refresh</button>
          </>
        }/>

      {/* Top metric row */}
      <div className="grid">
        <div className="col-3"><MetricCard
          label="Total transactions"
          value={fmt.numK(ov.totalTx)}
          sub={<><span className="mono">{fmt.numK(ov.txRegex)}</span> regex<span style={{color:'var(--text-tertiary)'}}> · </span><span className="mono">{fmt.numK(ov.txAi)}</span> AI</>}/>
          <Spark values={sparkRegex.map((v,i)=>v+sparkAi[i])} color="var(--c3)"/>
        </div>
        <div className="col-3"><MetricCard
          label="Regex rate"
          value={fmt.pct(ov.regexRateLifetime)}
          sub={<>30d: <span className="mono" style={{color:'var(--text-primary)'}}>{fmt.pct(ov.regexRate30d)}</span></>}
          trend="+3.8pp"
          trendDir="up"
          trendGood/>
          <Spark values={ov.handoff.map(d => (d.regex / d.total) * 100)} color="var(--c1)"/>
        </div>
        <div className="col-3"><MetricCard
          label="Active users (30d)"
          value={fmt.numK(ov.activeUsers30d)}
          trend="+12.4%"
          trendDir="up"
          trendGood/>
          <Spark values={sparkUsers} color="var(--c4)"/>
        </div>
        <div className="col-3"><MetricCard
          label="AI cost this month"
          value={fmt.usd(ov.aiCostMonth)}
          sub={<>cost / tx: <span className="mono" style={{color:'var(--text-primary)'}}>{fmt.cpt(ov.costPerTx)}</span></>}
          trend="−18.2%"
          trendDir="down"
          trendGood/>
          <Spark values={sparkCost} color="var(--c2)"/>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Regex snapshot */}
      <SectionHeader title="Regex engine" subtitle="Production parsing coverage"/>
      <div className="grid">
        <div className="col-4">
          <div className="card metric-card">
            <div className="metric-label">Templates in production</div>
            <div className="metric-value">
              <span style={{ color: 'var(--text-primary)' }}>{m.regexSnapshot.production}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7em' }}> / {m.regexSnapshot.total}</span>
            </div>
            <div className="metric-sub">
              <span style={{ flex: 1 }}>
                <Progress value={(m.regexSnapshot.production / m.regexSnapshot.total) * 100} kind="healthy" showLabel={false}/>
              </span>
              <span className="mono dim">{((m.regexSnapshot.production / m.regexSnapshot.total) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <div className="col-4">
          <MetricCard
            label="Average confidence"
            value={fmt.pct(m.regexSnapshot.avgConfidence)}
            sub={<>across {m.regexSnapshot.production} active templates</>}
            trend="+1.2pp"
            trendDir="up"
            trendGood/>
        </div>
        <div className="col-4">
          <div className="card metric-card">
            <div className="metric-label">Bank coverage</div>
            <div className="metric-value">
              <span style={{ color: 'var(--healthy)' }}>{m.regexSnapshot.coveredBanks}</span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7em' }}> / {m.regexSnapshot.totalBanks}</span>
            </div>
            <div className="metric-sub">
              <Badge kind="no_coverage">2 banks no coverage</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Handoff trend */}
      <div className="card no-pad" style={{ padding: 24 }}>
        <SectionHeader
          title="AI → regex handoff"
          subtitle="Daily transactions handled by each engine, last 30 days"
          action={
            <div className="chart-legend">
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c1)' }}/>Regex</div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c2)' }}/>AI</div>
            </div>
          }/>
        <LineChart
          data={ov.handoff}
          height={240}
          series={[
            { key: 'regex', label: 'Regex', color: 'var(--c1)', areaOpacity: 0.18 },
            { key: 'ai', label: 'AI', color: 'var(--c2)', areaOpacity: 0.10 },
          ]}
          annotation={annotation}/>
      </div>

      <div className="section-gap"></div>

      {/* Bottom three panels */}
      <div className="grid">
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Ingestion health"/>
            <div className="col" style={{ gap: 14 }}>
              <Row icon={<span className="pulse-dot"/>} label="Active connections"
                value={<span className="mono" style={{fontSize: 18}}>{fmt.num(m.ingestion.activeConnections)}</span>}/>
              <Row icon={<Icon name="alert" size={14}/>} iconColor="var(--warning)" label="Stale connections"
                value={<span className="mono" style={{fontSize: 18, color: 'var(--warning)'}}>{m.ingestion.staleConnections}</span>}/>
              <Row icon={<Icon name="check" size={14}/>} iconColor="var(--healthy)" label="30d success rate"
                value={<span className="mono" style={{fontSize: 18, color: 'var(--healthy)'}}>{fmt.pct(m.ingestion.successRate30d)}</span>}/>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Audit queue" action={<Badge kind={m.audit.pending ? 'candidate' : 'healthy'}>{m.audit.pending} pending</Badge>}/>
            {m.audit.pending === 0 ? (
              <Empty title="No templates waiting" sub="The audit pipeline is caught up"/>
            ) : (
              <div className="col" style={{ gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span className="dim">Oldest waiting</span>
                  <span className="mono" style={{ color: 'var(--warning)' }}>{m.audit.oldestHours}h</span>
                </div>
                {m.audit.items.slice(0, 4).map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-hairline)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>{item.bank} <span className="dim mono" style={{fontSize: 11}}>v{item.version}</span></div>
                      <div className="dim mono" style={{ fontSize: 11 }}>{item.id}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 12, color: item.hours >= 24 ? 'var(--warning)' : 'var(--text-secondary)' }}>{item.hours}h</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <SectionHeader title="User funnel" subtitle="All-time signup → activation"/>
            <div className="col" style={{ gap: 8 }}>
              {m.funnel.map((step, i) => {
                const top = m.funnel[0].count;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ flex: 1 }}>{step.step}</span>
                      <span className="mono dim">{fmt.num(step.count)}</span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill healthy" style={{ width: `${(step.count / top) * 100}%` }}/>
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
};

const Row = ({ icon, iconColor, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor || 'var(--text-secondary)' }}>{icon}</span>
    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
    {value}
  </div>
);

window.OverviewPage = OverviewPage;
