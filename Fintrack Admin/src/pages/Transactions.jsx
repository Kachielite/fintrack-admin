// ============ Transactions ============
const TransactionsPage = () => {
  const m = window.MOCK;
  const totalTx = m.txByBank.reduce((s, b) => s + b.count, 0);
  const totalDebit = m.txByCurrency.reduce((s, c) => s + c.debit, 0);
  const totalCredit = m.txByCurrency.reduce((s, c) => s + c.credit, 0);

  return (
    <div data-screen-label="Transactions">
      <PageHeader
        title="Transactions"
        subtitle="Volume and value flowing through the platform"
        actions={<>
          <div className="filter-bar">
            <select className="input" defaultValue="30d">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
            <button className="btn"><Icon name="filter"/> Filter</button>
            <button className="btn"><Icon name="download"/> Export</button>
          </div>
        </>}/>

      <div className="grid">
        <div className="col-3"><MetricCard
          label="Total transactions"
          value={fmt.numK(totalTx)}
          trend="+8.4%" trendDir="up" trendGood/>
        </div>
        <div className="col-3"><MetricCard
          label="Total debit"
          value={'£' + fmt.numK(totalDebit)}
          sub={<>across {m.txByCurrency.length} currencies</>}/>
        </div>
        <div className="col-3"><MetricCard
          label="Total credit"
          value={'£' + fmt.numK(totalCredit)}
          sub={<span style={{color:'var(--healthy)'}}>net +{fmt.usd(totalCredit - totalDebit, 0).replace('$','£')}</span>}/>
        </div>
        <div className="col-3"><MetricCard
          label="Unique banks"
          value={m.txByBank.length}
          sub={<>covered: <span className="mono" style={{color:'var(--healthy)'}}>{m.txByBank.filter(b => b.count > 5000).length}</span></>}/>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* By bank */}
      <div className="card">
        <SectionHeader title="Transactions by bank" subtitle={`${fmt.numK(totalTx)} transactions, last 30 days`}/>
        <HorizontalBars
          data={m.txByBank.map(b => ({ name: b.name, value: b.count }))}
          total={totalTx}/>
      </div>

      <div className="section-gap"></div>

      <div className="grid">
        <div className="col-6">
          <div className="card">
            <SectionHeader title="By currency" subtitle="Debit vs credit per currency"/>
            <GroupedBars data={m.txByCurrency}/>
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <SectionHeader title="By category" subtitle="Top categories, 30 days"/>
            <HorizontalBars
              data={m.txByCategory.map((c, i) => ({ name: c.name, value: c.count, color: `var(--c${(i % 6) + 1})` }))}
              total={m.txByCategory.reduce((s, c) => s + c.count, 0)}/>
          </div>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Corrections panel */}
      <div className="card no-pad">
        <div style={{ padding: '20px 20px 12px' }}>
          <SectionHeader
            title="Top correction rates"
            subtitle="The most honest accuracy signal — flag >5% amber, >15% red"/>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Template</th>
                <th>Bank</th>
                <th style={{textAlign: 'right'}}>Match count</th>
                <th style={{textAlign: 'right'}}>Corrections</th>
                <th style={{textAlign: 'right'}}>Rate</th>
                <th>Most-corrected field</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {m.topCorrections.sort((a, b) => b.rate - a.rate).map(c => {
                const color = c.rate >= 15 ? 'var(--critical)' : c.rate >= 5 ? 'var(--warning)' : 'var(--text-secondary)';
                return (
                  <tr key={c.tpl}>
                    <td className="code">{c.tpl}</td>
                    <td>{c.bank}</td>
                    <td className="num">{fmt.num(c.match)}</td>
                    <td className="num">{fmt.num(c.corr)}</td>
                    <td className="num" style={{ color, fontWeight: 500 }}>
                      {c.rate >= 15 && <Icon name="alert" size={11}/>} {fmt.pct(c.rate)}
                    </td>
                    <td className="code">{c.field}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn sm ghost row-action">Inspect</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
window.TransactionsPage = TransactionsPage;
