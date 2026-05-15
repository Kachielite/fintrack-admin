// ============ Regex Engine ============
const RegexEnginePage = () => {
  const m = window.MOCK;
  const [bankFilter, setBankFilter] = React.useState('all');
  const [sortKey, setSortKey] = React.useState('regexRate');
  const [sortDir, setSortDir] = React.useState('asc');
  const [expanded, setExpanded] = React.useState(null);
  const [tplSort, setTplSort] = React.useState({ key: 'corr', dir: 'desc' });

  const handoff = window.MOCK.overview.handoff;
  // Pseudo-extend to 90d by repeating prefix downwards (just for visuals)
  const longHandoff = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < 90; i++) {
      const base = handoff[Math.min(handoff.length - 1, Math.floor(i / 3))];
      const t = i / 89;
      const total = Math.round(900 + t * 800);
      const regex = Math.round(total * (0.45 + t * 0.42 + (i % 7) * 0.005));
      out.push({
        date: new Date(2026, 1, 9 + i).toISOString().slice(5, 10),
        regex,
        ai: total - regex,
      });
    }
    return out;
  }, []);

  const status = (b) => b.status;

  const sortedBanks = [...m.banks].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const sortedTpls = [...m.templates].sort((a, b) => {
    const av = a[tplSort.key], bv = b[tplSort.key];
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return tplSort.dir === 'asc' ? cmp : -cmp;
  });

  const SortHead = ({ k, label, sortObj, setSort, align }) => (
    <th className="sortable" style={{ textAlign: align || 'left' }}
      onClick={() => setSort(p => ({ key: k, dir: p.key === k && p.dir === 'asc' ? 'desc' : 'asc' }))}>
      {label}
      {sortObj.key === k && <span className="sort-arrow">{sortObj.dir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );

  return (
    <div data-screen-label="Regex Engine">
      <PageHeader
        title="Regex Engine"
        subtitle="Self-improving parsing pipeline · monitoring & debug"
        actions={<>
          <button className="btn"><Icon name="download"/> Export</button>
          <button className="btn primary"><Icon name="plus"/> Trigger audit</button>
        </>}/>

      {/* Top stat chips */}
      <StatChips items={[
        { label: 'Production', value: 47, kind: 'healthy' },
        { label: 'Audited', value: 8 },
        { label: 'Candidate', value: 5 },
        { label: 'Failed audit', value: 2, kind: 'critical' },
        { label: 'Degrading', value: 3, kind: 'warning' },
        { label: 'Avg confidence', value: '88.4%' },
      ]}/>

      <div className="section-gap"></div>

      {/* Trend chart */}
      <div className="card no-pad" style={{ padding: 24 }}>
        <SectionHeader
          title="Regex rate over time"
          subtitle="Daily handoff between regex and AI parsing"
          action={
            <div className="filter-bar">
              <select className="input" value={bankFilter} onChange={(e) => setBankFilter(e.target.value)}>
                <option value="all">All banks</option>
                {m.banks.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
              </select>
              <Tabs current="90d" onChange={() => {}} tabs={[
                { value: '30d', label: '30d' },
                { value: '90d', label: '90d' },
                { value: '1y', label: '1y' },
              ]}/>
            </div>
          }/>
        <LineChart
          data={longHandoff}
          height={260}
          series={[
            { key: 'regex', label: 'Regex', color: 'var(--c1)', areaOpacity: 0.18 },
            { key: 'ai', label: 'AI', color: 'var(--c2)', areaOpacity: 0.08 },
          ]}/>
      </div>

      <div className="section-gap"></div>

      {/* By-bank health */}
      <div className="card no-pad">
        <div style={{ padding: '20px 20px 12px' }}>
          <SectionHeader title="By-bank health" subtitle="Sorted by regex rate (worst first)"/>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <SortHead k="name" label="Bank" sortObj={{key: sortKey, dir: sortDir}} setSort={(fn) => { const p = fn({key:sortKey,dir:sortDir}); setSortKey(p.key); setSortDir(p.dir); }}/>
                <SortHead k="prodTpl" label="Prod tpl" align="right" sortObj={{key: sortKey, dir: sortDir}} setSort={(fn) => { const p = fn({key:sortKey,dir:sortDir}); setSortKey(p.key); setSortDir(p.dir); }}/>
                <SortHead k="conf" label="Avg confidence" align="left" sortObj={{key: sortKey, dir: sortDir}} setSort={(fn) => { const p = fn({key:sortKey,dir:sortDir}); setSortKey(p.key); setSortDir(p.dir); }}/>
                <SortHead k="tx30" label="Tx (30d)" align="right" sortObj={{key: sortKey, dir: sortDir}} setSort={(fn) => { const p = fn({key:sortKey,dir:sortDir}); setSortKey(p.key); setSortDir(p.dir); }}/>
                <SortHead k="regexRate" label="Regex rate" align="right" sortObj={{key: sortKey, dir: sortDir}} setSort={(fn) => { const p = fn({key:sortKey,dir:sortDir}); setSortKey(p.key); setSortDir(p.dir); }}/>
                <SortHead k="corrRate" label="Correction" align="right" sortObj={{key: sortKey, dir: sortDir}} setSort={(fn) => { const p = fn({key:sortKey,dir:sortDir}); setSortKey(p.key); setSortDir(p.dir); }}/>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedBanks.map(b => (
                <tr key={b.name}>
                  <td style={{ fontWeight: 500 }}>{b.name}</td>
                  <td className="num">{b.prodTpl}</td>
                  <td style={{ minWidth: 180 }}>
                    {b.conf > 0 ? <Progress value={b.conf} dp={1}/> : <span className="dim mono">—</span>}
                  </td>
                  <td className="num">{fmt.num(b.tx30)}</td>
                  <td className="num" style={{ color: b.regexRate >= 80 ? 'var(--healthy)' : b.regexRate >= 65 ? 'var(--warning)' : b.regexRate > 0 ? 'var(--critical)' : 'var(--text-tertiary)' }}>
                    {b.regexRate > 0 ? fmt.pct(b.regexRate) : '—'}
                  </td>
                  <td className="num" style={{ color: b.corrRate >= 5 ? 'var(--warning)' : b.corrRate >= 15 ? 'var(--critical)' : 'var(--text-secondary)' }}>
                    {b.corrRate > 0 ? fmt.pct(b.corrRate) : '—'}
                  </td>
                  <td><Badge kind={status(b)}>{status(b).replace('_', ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Templates table */}
      <div className="card no-pad">
        <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionHeader title="Templates" subtitle="Click a row to inspect rules"/>
          <div className="filter-bar">
            <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px' }}>
              <Icon name="search" size={12}/>
              <input style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontFamily: 'var(--font-mono)', fontSize: 12, width: 140 }} placeholder="Search templates"/>
            </div>
            <select className="input"><option>All statuses</option></select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Template ID</th>
                <th>Bank</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{minWidth: 160}}>Confidence</th>
                <th style={{textAlign: 'right'}}>Match</th>
                <th style={{textAlign: 'right'}}>Fail</th>
                <SortHead k="corr" label="Corr" align="right" sortObj={tplSort} setSort={setTplSort}/>
                <th>Promoted</th>
              </tr>
            </thead>
            <tbody>
              {sortedTpls.map(t => (
                <React.Fragment key={t.id}>
                  <tr onClick={() => setExpanded(expanded === t.id ? null : t.id)} style={{ cursor: 'pointer' }} className={expanded === t.id ? 'expanded' : ''}>
                    <td className="code">{t.id} <span className="dim">v{t.version}</span></td>
                    <td>{t.bank}</td>
                    <td className="muted" style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{t.desc}</td>
                    <td><Badge kind={t.status}>{t.status.replace('_', ' ')}</Badge></td>
                    <td><Progress value={t.conf}/></td>
                    <td className="num">{fmt.num(t.match)}</td>
                    <td className="num" style={{ color: t.fail > 100 ? 'var(--warning)' : 'var(--text-secondary)' }}>{fmt.num(t.fail)}</td>
                    <td className="num" style={{ color: t.corr > 200 ? 'var(--warning)' : 'var(--text-secondary)' }}>{fmt.num(t.corr)}</td>
                    <td className="muted mono" style={{ fontSize: 12 }}>{t.promoted}</td>
                  </tr>
                  {expanded === t.id && (
                    <tr>
                      <td colSpan={9} style={{ padding: 0 }}>
                        <div className="rule-row">
                          <div className="rule-row-head">
                            <span>Field</span>
                            <span>Pattern</span>
                            <span style={{textAlign: 'right'}}>Match rate</span>
                          </div>
                          {(m.templateRules[t.id] || [
                            { field: 'amount',   regex: '\\b([0-9]+\\.[0-9]{2})\\s+(GBP|USD|EUR)\\b' },
                            { field: 'merchant', regex: '(?:to|at)\\s+([A-Z][A-Za-z0-9 \\.\\-&]{2,40})' },
                            { field: 'datetime', regex: '(\\d{2}/\\d{2}/\\d{4})\\s+(\\d{2}:\\d{2})' },
                          ]).map((r, i) => (
                            <div className="rule-item" key={i}>
                              <span className="rule-item-field">{r.field}</span>
                              <code>{r.regex}</code>
                              <span className="num mono">{(94 - i * 1.4).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-gap"></div>

      {/* Audit & gaps */}
      <div className="grid">
        <div className="col-6">
          <div className="card">
            <SectionHeader title="Audit queue" subtitle={`${m.audit.pending} candidate templates waiting`}/>
            <div className="col" style={{ gap: 0 }}>
              {m.audit.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-hairline)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5 }}>
                      {item.bank} <span className="dim mono" style={{fontSize: 11}}>v{item.version}</span>
                    </div>
                    <div className="dim mono" style={{ fontSize: 11.5 }}>{item.id}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 12.5, color: item.hours >= 24 ? 'var(--warning)' : 'var(--text-secondary)' }}>{item.hours}h waiting</span>
                  <button className="btn sm row-action"><Icon name="play" size={11}/> Audit</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <SectionHeader title="Coverage gaps" subtitle="Banks with unhandled transactions"/>
            {m.regexGaps.length === 0 ? (
              <Empty title="No gaps" sub="All active banks have a production template" icon="check"/>
            ) : (
              <div className="col" style={{ gap: 0 }}>
                {m.regexGaps.map(g => (
                  <div key={g.bank} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-hairline)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5 }}>{g.bank}</div>
                      <div className="dim" style={{ fontSize: 12 }}>
                        <span className="mono">{fmt.num(g.txCount)}</span> unhandled tx (30d)
                      </div>
                    </div>
                    {g.candidate ? <Badge kind="candidate">candidate exists</Badge> : <Badge kind="no_coverage">no candidate</Badge>}
                    <button className="btn sm">Generate</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
window.RegexEnginePage = RegexEnginePage;
