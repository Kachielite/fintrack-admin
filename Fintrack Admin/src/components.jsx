// Reusable bits: sidebar, page header, metric card, badge, progress, table, etc.

const fmt = {
  num: (n) => n.toLocaleString('en-US'),
  numK: (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    if (n >= 1_000) return (n / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'k';
    return n.toLocaleString('en-US');
  },
  usd: (n, dp = 2) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  pct: (n, dp = 1) => n.toFixed(dp) + '%',
  cpt: (n) => '$' + n.toFixed(6),
};
window.fmt = fmt;

// ============ Sidebar ============
const NAV = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'regex',    label: 'Regex Engine', icon: 'code' },
  { id: 'ingestion',label: 'Ingestion', icon: 'mail' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt' },
  { id: 'users',    label: 'Users', icon: 'users' },
  { id: 'ai',       label: 'AI Usage', icon: 'sparkle' },
];

const Sidebar = ({ current, onNavigate, onSignOut, email }) => (
  <aside className="sidebar" data-screen-label="Sidebar">
    <div className="sidebar-brand">
      <div className="sidebar-logo">F</div>
      <div className="sidebar-wordmark">FinTrack</div>
      <div className="sidebar-chip">ADMIN</div>
    </div>
    <div className="sidebar-divider"></div>
    <nav className="sidebar-nav">
      {NAV.map(item => (
        <div
          key={item.id}
          className={'nav-item' + (current === item.id ? ' active' : '')}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon"><Icon name={item.icon}/></span>
          {item.label}
        </div>
      ))}
    </nav>
    <div className="sidebar-spacer"></div>
    <div className="sidebar-divider"></div>
    <div className="sidebar-footer">
      <div className="sidebar-account">{email}</div>
      <button className="signout-btn" onClick={onSignOut}>
        <Icon name="logout"/> Sign out
      </button>
    </div>
  </aside>
);
window.Sidebar = Sidebar;

// ============ Page header ============
const PageHeader = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <div className="page-subtitle">{subtitle}</div>}
    </div>
    {actions && <div className="page-header-actions">{actions}</div>}
  </div>
);
window.PageHeader = PageHeader;

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="section-header">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <div className="section-subtitle">{subtitle}</div>}
    </div>
    {action}
  </div>
);
window.SectionHeader = SectionHeader;

// ============ Metric card ============
const MetricCard = ({ label, value, unit, sub, trend, trendDir, trendGood, children, info }) => (
  <div className="card metric-card">
    <div className="metric-label">
      {label}
      {info && <span className="has-tooltip" data-tooltip={info}><Icon name="info" size={12}/></span>}
    </div>
    <div className="metric-value">
      {value}{unit && <span className="unit">{unit}</span>}
    </div>
    {(sub || trend) && (
      <div className="metric-sub">
        {sub}
        {trend && (
          <span className={`metric-trend ${trendDir} ${trendGood ? 'good' : ''}`}>
            <Icon name={trendDir === 'up' ? 'arrow_up' : 'arrow_down'} size={10}/>
            {trend}
          </span>
        )}
      </div>
    )}
    {children}
  </div>
);
window.MetricCard = MetricCard;

// ============ Badge ============
const Badge = ({ kind, children }) => (
  <span className={`badge ${kind}`}>{children || kind.replace('_', ' ')}</span>
);
window.Badge = Badge;

// ============ Progress ============
const Progress = ({ value, max = 100, kind, showLabel = true, dp = 0 }) => {
  const pct = (value / max) * 100;
  const k = kind || (pct >= 85 ? 'healthy' : pct >= 70 ? 'warning' : 'critical');
  return (
    <div className="progress-with-label">
      <div className="progress" style={{ flex: 1 }}>
        <div className={`progress-fill ${k}`} style={{ width: `${pct}%` }}/>
      </div>
      {showLabel && <span className="progress-label">{value.toFixed(dp)}%</span>}
    </div>
  );
};
window.Progress = Progress;

// ============ Empty state ============
const Empty = ({ title, sub, icon = 'inbox' }) => (
  <div className="empty">
    <div className="empty-icon"><Icon name={icon} size={36}/></div>
    <div className="empty-title">{title}</div>
    {sub && <div className="empty-sub">{sub}</div>}
  </div>
);
window.Empty = Empty;

// ============ Tab selector ============
const Tabs = ({ tabs, current, onChange }) => (
  <div className="tab-row">
    {tabs.map(t => (
      <button
        key={t.value}
        className={'tab' + (current === t.value ? ' active' : '')}
        onClick={() => onChange(t.value)}
      >{t.label}</button>
    ))}
  </div>
);
window.Tabs = Tabs;

// ============ Stat chips bar ============
const StatChips = ({ items }) => (
  <div className="stat-chips">
    {items.map((it, i) => (
      <div className="stat-chip" key={i}>
        <div className="stat-chip-label">{it.label}</div>
        <div className={'stat-chip-value ' + (it.kind || '')}>{it.value}</div>
      </div>
    ))}
  </div>
);
window.StatChips = StatChips;

// ============ Funnel ============
const Funnel = ({ steps, color = 'var(--brand)' }) => {
  const top = steps[0].count;
  return (
    <div className="funnel">
      {steps.map((s, i) => {
        const prev = i === 0 ? s.count : steps[i - 1].count;
        const dropPct = i === 0 ? 0 : ((prev - s.count) / prev) * 100;
        return (
          <div className="funnel-step" key={i}>
            <div className="funnel-step-label">{s.step}</div>
            <div className="funnel-bar-track">
              <div className="funnel-bar-fill" style={{ width: `${(s.count / top) * 100}%`, background: color }}/>
            </div>
            <div className="funnel-step-count mono">{fmt.num(s.count)}</div>
            <div className={'funnel-step-drop' + (dropPct > 25 ? ' high' : '')}>
              {i === 0 ? '—' : `−${dropPct.toFixed(0)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
};
window.Funnel = Funnel;
