// ============ AI Usage & Cost ============
const AIUsagePage = () => {
  const m = window.MOCK;
  const ai = m.ai;

  const opDonut = ai.operations.map((o, i) => ({
    name: o.name,
    value: o.cost,
    color: `var(--c${(i % 6) + 1})`,
  }));

  return (
    <div data-screen-label="AI Usage">
      <PageHeader
        title="AI Usage & Cost"
        subtitle="Token consumption and operating cost — should fall as regex coverage grows"
        actions={<>
          <select className="input" defaultValue="30d">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="btn"><Icon name="download"/> Export</button>
        </>}/>

      {/* Top metrics */}
      <div className="grid">
        <div className="col-3"><MetricCard
          label="Total tokens (30d)"
          value={fmt.numK(ai.totalTokens30d)}
          sub={<>
            <span className="mono dim">prompt</span> <span className="mono">{fmt.numK(ai.promptTokens)}</span>
            <span className="dim"> · </span>
            <span className="mono dim">completion</span> <span className="mono">{fmt.numK(ai.completionTokens)}</span>
          </>}/>
        </div>
        <div className="col-3"><MetricCard
          label="Estimated cost (30d)"
          value={fmt.usd(ai.costUsd30d)}
          trend="−18.2%" trendDir="down" trendGood/>
          <Spark values={ai.costTrend.map(d => d.cost)} color="var(--c1)"/>
        </div>
        <div className="col-3"><MetricCard
          label="Cost per transaction"
          value={fmt.cpt(ai.costPerTx)}
          info="Total AI cost ÷ total transactions parsed (regex + AI). The number that should fall."
          trend="−24%" trendDir="down" trendGood/>
          <Spark values={ai.costTrend.map(d => d.cpt)} color="var(--c2)"/>
        </div>
        <div className="col-3"><MetricCard
          label="AI calls (30d)"
          value={fmt.numK(ai.calls30d)}
          sub={<>{(ai.calls30d / 30).toFixed(0)}/day avg</>}/>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Cost trend chart */}
      <div className="card">
        <SectionHeader
          title="Cost trend"
          subtitle="Daily cost (left) and cost-per-transaction (right). Target: $0.0001/tx"
          action={
            <div className="chart-legend">
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c1)' }}/>Cost / day</div>
              <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c2)' }}/>Cost / tx</div>
              <div className="legend-item"><span style={{ display: 'inline-block', width: 16, borderTop: '1px dashed var(--brand)' }}/>Target</div>
            </div>
          }/>
        <DualAxisLine
          data={ai.costTrend}
          leftKey="cost"
          rightKey="cpt"
          leftLabel="Daily cost"
          rightLabel="Cost / tx"
          target={ai.targetCpt}
          height={280}/>
      </div>

      <div className="section-gap"></div>

      {/* Operations: table + donut */}
      <div className="grid">
        <div className="col-8">
          <div className="card no-pad">
            <div style={{ padding: '20px 20px 12px' }}>
              <SectionHeader title="By operation" subtitle="Most expensive operations are candidates for regex replacement"/>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Operation</th>
                    <th style={{textAlign: 'right'}}>Calls</th>
                    <th style={{textAlign: 'right'}}>Tokens</th>
                    <th style={{textAlign: 'right'}}>Cost</th>
                    <th style={{minWidth: 160}}>% of total</th>
                  </tr>
                </thead>
                <tbody>
                  {ai.operations.map((o, i) => (
                    <tr key={o.name}>
                      <td className="code" style={{ color: 'var(--text-primary)' }}>
                        <span className="legend-swatch" style={{ background: `var(--c${(i % 6) + 1})`, display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}/>
                        {o.name}
                      </td>
                      <td className="num">{fmt.num(o.calls)}</td>
                      <td className="num">{fmt.numK(o.tokens)}</td>
                      <td className="num" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fmt.usd(o.cost)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${o.pct}%`, background: `var(--c${(i % 6) + 1})` }}/>
                          </div>
                          <span className="mono" style={{ fontSize: 12, minWidth: 38, textAlign: 'right' }}>{o.pct.toFixed(1)}%</span>
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
            <SectionHeader title="Cost distribution"/>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
              <Donut
                data={opDonut}
                size={200}
                centerValue={fmt.usd(ai.costUsd30d, 0)}
                centerLabel="30d total"/>
            </div>
            <div style={{ marginTop: 12 }}>
              <DonutLegend
                data={opDonut.map(d => ({ ...d, name: d.name }))}
                formatValue={(v) => fmt.usd(v)}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
window.AIUsagePage = AIUsagePage;
