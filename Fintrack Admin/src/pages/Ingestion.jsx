// ============ Ingestion Pipeline ============
const IngestionPage = () => {
  const m = window.MOCK;
  const ing = m.ingestion;

  const donutData = [
    { name: 'Parsed', value: ing.parsed, color: 'var(--c1)' },
    { name: 'Non-transaction', value: ing.nonTransaction, color: 'var(--neutral)' },
    { name: 'Failed', value: ing.failed, color: 'var(--c5)' },
  ];

  return (
    <div data-screen-label="Ingestion">
      <PageHeader
        title="Ingestion Pipeline"
        subtitle="Gmail connections and email processing health"
        actions={<>
          <select className="input" defaultValue="30d">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button className="btn"><Icon name="refresh"/> Refresh</button>
        </>}/>

      {/* Connection cards */}
      <SectionHeader title="Connection health"/>
      <div className="grid">
        <div className="col-3"><MetricCard
          label="Active connections"
          value={fmt.num(ing.activeConnections)}
          sub={<><span className="pulse-dot"/> syncing</>}/>
        </div>
        <div className="col-3"><MetricCard
          label="Stale (>48h)"
          value={ing.staleConnections}
          sub={<span style={{color:'var(--warning)'}}>needs reconnect</span>}/>
        </div>
        <div className="col-3"><MetricCard
          label="Revoked"
          value={ing.revoked}
          sub={<span className="dim">user-disconnected</span>}/>
        </div>
        <div className="col-3"><MetricCard
          label="30d success rate"
          value={fmt.pct(ing.successRate30d)}
          trend="+0.4pp"
          trendDir="up"
          trendGood/>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Stale connections table */}
      <div className="card no-pad">
        <div style={{ padding: '20px 20px 12px' }}>
          <SectionHeader title="Stale & revoked connections"
            subtitle="Sync paused — flag rows >48h"
            action={<button className="btn sm"><Icon name="mail" size={12}/> Send reconnect email</button>}/>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Gmail address</th>
                <th>Last synced</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {m.staleConnections.map(c => {
                const hours = parseInt(c.lastSync) * 24;
                const flagged = c.status === 'stale' && parseInt(c.lastSync) >= 2;
                return (
                  <tr key={c.email}>
                    <td className="code">{c.email}</td>
                    <td className="num" style={{ color: flagged ? 'var(--warning)' : 'var(--text-secondary)', textAlign: 'left' }}>
                      {c.lastSync} ago
                    </td>
                    <td><Badge kind={c.status === 'revoked' ? 'critical' : 'degrading'}>{c.status}</Badge></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn sm ghost row-action">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Pipeline metrics */}
      <SectionHeader title="Pipeline metrics" subtitle="Last 30 days"/>
      <div className="grid">
        <div className="col-3"><MetricCard
          label="Emails processed"
          value={fmt.numK(ing.emailsProcessed30d)}/>
        </div>
        <div className="col-3"><MetricCard
          label="Success rate"
          value={fmt.pct(ing.successRate30d)}/>
        </div>
        <div className="col-3"><MetricCard
          label="Failed"
          value={fmt.num(ing.failed)}
          sub={<span style={{ color: 'var(--warning)' }}>{((ing.failed / ing.emailsProcessed30d) * 100).toFixed(2)}% of total</span>}/>
        </div>
        <div className="col-3"><MetricCard
          label="Non-transaction"
          value={fmt.num(ing.nonTransaction)}
          info="Emails that were classified as not containing a parseable transaction (newsletters, statements, etc.)"/>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Donut + Timeline */}
      <div className="grid">
        <div className="col-4">
          <div className="card">
            <SectionHeader title="Outcomes" subtitle="30-day breakdown"/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
              <Donut
                data={donutData}
                size={200}
                centerValue={fmt.numK(ing.emailsProcessed30d)}
                centerLabel="Emails"/>
            </div>
            <div style={{ marginTop: 12 }}>
              <DonutLegend data={donutData} formatValue={(v) => `${fmt.num(v)} · ${((v / ing.emailsProcessed30d) * 100).toFixed(1)}%`}/>
            </div>
          </div>
        </div>
        <div className="col-8">
          <div className="card">
            <SectionHeader title="Daily processing"
              subtitle="Stacked bars by outcome"
              action={
                <div className="chart-legend">
                  <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c1)' }}/>Parsed</div>
                  <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--neutral)' }}/>Non-tx</div>
                  <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c5)' }}/>Failed</div>
                </div>
              }/>
            <StackedBarChart
              data={m.ingestionTimeline}
              height={260}
              series={[
                { key: 'parsed', label: 'Parsed', color: 'var(--c1)' },
                { key: 'nonTx', label: 'Non-tx', color: 'var(--neutral)' },
                { key: 'failed', label: 'Failed', color: 'var(--c5)' },
              ]}/>
          </div>
        </div>
      </div>
    </div>
  );
};
window.IngestionPage = IngestionPage;
