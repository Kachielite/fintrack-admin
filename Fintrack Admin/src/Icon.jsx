/* Icons (16px stroke) — single source of truth */
const Icon = ({ name, size = 16 }) => {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M2.5 7L8 2.5L13.5 7V13a1 1 0 01-1 1H3.5a1 1 0 01-1-1V7z"/><path d="M6.5 14V9.5h3V14"/></>,
    code: <><path d="M5.5 5L2.5 8l3 3"/><path d="M10.5 5l3 3-3 3"/><path d="M9 3.5L7 12.5"/></>,
    mail: <><rect x="2" y="3.5" width="12" height="9" rx="1"/><path d="M2.5 4.5L8 9l5.5-4.5"/></>,
    receipt: <><path d="M3.5 2.5h9v11l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1z"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3"/></>,
    users: <><circle cx="6" cy="6" r="2.2"/><path d="M2.5 13c0-2 1.5-3.5 3.5-3.5S9.5 11 9.5 13"/><circle cx="11" cy="5" r="1.8"/><path d="M10 9c1.8 0 3.5 1.4 3.5 3.5"/></>,
    sparkle: <><path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2L12 12M4 12l1.8-1.8M10.2 5.8L12 4"/></>,
    logout: <><path d="M9 13H3.5a1 1 0 01-1-1V4a1 1 0 011-1H9"/><path d="M11 5.5L13.5 8 11 10.5M6.5 8h7"/></>,
    chevron_down: <><path d="M3.5 6L8 10.5L12.5 6"/></>,
    arrow_up: <><path d="M8 12V4M4 7.5L8 3.5L12 7.5"/></>,
    arrow_down: <><path d="M8 4v8M4 8.5L8 12.5L12 8.5"/></>,
    info: <><circle cx="8" cy="8" r="5.5"/><path d="M8 7v3.5M8 5.4v.1"/></>,
    check: <><path d="M3 8.5L6.5 12L13 5"/></>,
    alert: <><path d="M8 2.5L14 13H2L8 2.5z"/><path d="M8 6.5v3M8 11v.1"/></>,
    lock: <><rect x="3" y="7" width="10" height="6.5" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2"/></>,
    search: <><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13.5 13.5"/></>,
    refresh: <><path d="M3 8a5 5 0 019-3M13 8a5 5 0 01-9 3"/><path d="M11.5 2v3.5H8M4.5 14v-3.5H8"/></>,
    play: <><path d="M5 3.5L12 8L5 12.5z"/></>,
    eye: <><path d="M2 8s2-4.5 6-4.5S14 8 14 8s-2 4.5-6 4.5S2 8 2 8z"/><circle cx="8" cy="8" r="1.8"/></>,
    chart: <><path d="M2.5 13.5h11"/><rect x="3.5" y="9" width="2" height="3.5"/><rect x="7" y="6" width="2" height="6.5"/><rect x="10.5" y="3" width="2" height="9.5"/></>,
    ellipsis: <><circle cx="3.5" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="12.5" cy="8" r="1"/></>,
    download: <><path d="M8 2v8.5M5 7.5L8 10.5L11 7.5M3 13.5h10"/></>,
    filter: <><path d="M2.5 3.5h11l-4 5v4l-3 1.5v-5.5z"/></>,
    inbox: <><path d="M2.5 9.5L4 4h8l1.5 5.5V13a.5.5 0 01-.5.5h-10a.5.5 0 01-.5-.5z"/><path d="M2.5 9.5h3l1 2h3l1-2h3"/></>,
    plus: <><path d="M8 3v10M3 8h10"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
};

window.Icon = Icon;
