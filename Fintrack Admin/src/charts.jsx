// ============ Chart primitives — pure SVG, no deps ============

const CHART_PALETTE = [
  'var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)',
];

// Build a smooth-ish path from points (x,y) using simple lines (data dashboards prefer crisp)
function linePath(pts) {
  if (!pts.length) return '';
  return pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
}

function areaPath(pts, baseY) {
  if (!pts.length) return '';
  const top = linePath(pts);
  return `${top} L ${pts[pts.length - 1][0]} ${baseY} L ${pts[0][0]} ${baseY} Z`;
}

// ====== LineChart (multi-series, optional area fill) ======
const LineChart = ({
  data, series, height = 260, padding = { t: 16, r: 16, b: 28, l: 44 },
  yFormat = (v) => fmt.numK(v),
  xKey = 'date',
  showArea = true,
  annotation = null,
  yLabel,
}) => {
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(800);
  const [hover, setHover] = React.useState(null);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const innerW = Math.max(0, width - padding.l - padding.r);
  const innerH = height - padding.t - padding.b;

  const allValues = data.flatMap(d => series.map(s => d[s.key]));
  const yMax = Math.max(...allValues) * 1.15;
  const yMin = 0;

  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;
  const xy = (i, v) => [
    padding.l + i * xStep,
    padding.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH,
  ];

  // y-axis ticks (4)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => yMin + (yMax - yMin) * t);
  // x ticks every ~6 entries
  const xTickInterval = Math.max(1, Math.floor(data.length / 6));

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i = Math.round((x - padding.l) / xStep);
    if (i >= 0 && i < data.length) setHover(i);
  };

  return (
    <div ref={wrapRef} className="chart-area" onMouseLeave={() => setHover(null)}>
      <svg className="chart-svg" width={width} height={height} onMouseMove={handleMove}>
        {/* y grid */}
        <g className="chart-grid">
          {yTicks.map((t, i) => (
            <line key={i} x1={padding.l} x2={padding.l + innerW}
              y1={padding.t + innerH - ((t - yMin) / (yMax - yMin)) * innerH}
              y2={padding.t + innerH - ((t - yMin) / (yMax - yMin)) * innerH}/>
          ))}
        </g>
        {/* y labels */}
        <g className="chart-axis">
          {yTicks.map((t, i) => (
            <text key={i} x={padding.l - 8} y={padding.t + innerH - ((t - yMin) / (yMax - yMin)) * innerH + 3}
              textAnchor="end">{yFormat(t)}</text>
          ))}
        </g>
        {/* x labels */}
        <g className="chart-axis">
          {data.map((d, i) => (i % xTickInterval === 0) ? (
            <text key={i} x={padding.l + i * xStep} y={height - 8} textAnchor="middle">{d[xKey]}</text>
          ) : null)}
        </g>
        {/* areas */}
        {showArea && series.map((s, si) => {
          const pts = data.map((d, i) => xy(i, d[s.key]));
          return (
            <path key={'a' + si} d={areaPath(pts, padding.t + innerH)}
              fill={s.color} opacity={s.areaOpacity ?? 0.12} />
          );
        })}
        {/* lines */}
        {series.map((s, si) => {
          const pts = data.map((d, i) => xy(i, d[s.key]));
          return (
            <path key={'l' + si} d={linePath(pts)}
              stroke={s.color} strokeWidth={2} fill="none"
              strokeDasharray={s.dash || undefined} />
          );
        })}
        {/* annotation */}
        {annotation && (() => {
          const [ax, ay] = xy(annotation.index, annotation.value);
          return (
            <g>
              <line x1={ax} y1={padding.t} x2={ax} y2={padding.t + innerH} className="chart-anno-line"/>
              <circle cx={ax} cy={ay} r={4} fill="var(--brand)"/>
              <text x={ax + 8} y={padding.t + 12} className="chart-anno">{annotation.label}</text>
            </g>
          );
        })()}
        {/* hover */}
        {hover != null && (
          <g>
            <line x1={padding.l + hover * xStep} y1={padding.t}
              x2={padding.l + hover * xStep} y2={padding.t + innerH}
              stroke="var(--text-tertiary)" strokeWidth={1} strokeDasharray="2 3"/>
            {series.map((s, si) => {
              const v = data[hover][s.key];
              const [, y] = xy(hover, v);
              return <circle key={si} cx={padding.l + hover * xStep} cy={y} r={4} fill={s.color}/>;
            })}
          </g>
        )}
      </svg>
      {hover != null && (() => {
        const left = Math.min(width - 180, Math.max(8, padding.l + hover * xStep + 8));
        return (
          <div className="chart-tooltip" style={{ left, top: padding.t + 8 }}>
            <div className="chart-tooltip-title">{data[hover][xKey]}</div>
            {series.map((s, si) => (
              <div className="chart-tooltip-row" key={si}>
                <span className="name"><span className="dot" style={{ background: s.color }}/>{s.label}</span>
                <span>{(s.format || yFormat)(data[hover][s.key])}</span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};
window.LineChart = LineChart;

// ====== Dual-axis line ======
const DualAxisLine = ({ data, leftKey, rightKey, leftLabel, rightLabel, target, height = 240 }) => {
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(800);
  const [hover, setHover] = React.useState(null);
  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const padding = { t: 16, r: 56, b: 28, l: 56 };
  const innerW = Math.max(0, width - padding.l - padding.r);
  const innerH = height - padding.t - padding.b;
  const lMax = Math.max(...data.map(d => d[leftKey])) * 1.15;
  const rMax = Math.max(...data.map(d => d[rightKey]), target || 0) * 1.15;
  const xStep = innerW / (data.length - 1);
  const xyL = (i, v) => [padding.l + i * xStep, padding.t + innerH - (v / lMax) * innerH];
  const xyR = (i, v) => [padding.l + i * xStep, padding.t + innerH - (v / rMax) * innerH];

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={wrapRef} className="chart-area" onMouseLeave={() => setHover(null)}>
      <svg className="chart-svg" width={width} height={height}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const i = Math.round((e.clientX - rect.left - padding.l) / xStep);
          if (i >= 0 && i < data.length) setHover(i);
        }}>
        <g className="chart-grid">
          {yTicks.map((t, i) => (
            <line key={i} x1={padding.l} x2={padding.l + innerW}
              y1={padding.t + innerH - t * innerH}
              y2={padding.t + innerH - t * innerH}/>
          ))}
        </g>
        <g className="chart-axis">
          {yTicks.map((t, i) => (
            <text key={i} x={padding.l - 8} y={padding.t + innerH - t * innerH + 3} textAnchor="end">
              {fmt.usd(lMax * t, 0)}
            </text>
          ))}
          {yTicks.map((t, i) => (
            <text key={i} x={width - padding.r + 8} y={padding.t + innerH - t * innerH + 3}>
              {'$' + (rMax * t).toFixed(5)}
            </text>
          ))}
          {data.map((d, i) => (i % 5 === 0) ? (
            <text key={i} x={padding.l + i * xStep} y={height - 8} textAnchor="middle">{d.date}</text>
          ) : null)}
        </g>
        {/* target line */}
        {target != null && (() => {
          const ty = padding.t + innerH - (target / rMax) * innerH;
          return (
            <g>
              <line x1={padding.l} x2={padding.l + innerW} y1={ty} y2={ty}
                stroke="var(--brand)" strokeDasharray="4 4" strokeWidth={1}/>
              <text x={padding.l + innerW - 4} y={ty - 4} className="chart-anno" textAnchor="end">
                target {'$' + target.toFixed(5)}
              </text>
            </g>
          );
        })()}
        {/* left line */}
        <path d={linePath(data.map((d, i) => xyL(i, d[leftKey])))}
          stroke="var(--c1)" strokeWidth={2} fill="none"/>
        {/* right line */}
        <path d={linePath(data.map((d, i) => xyR(i, d[rightKey])))}
          stroke="var(--c2)" strokeWidth={2} fill="none" strokeDasharray="3 3"/>
        {hover != null && (
          <g>
            <line x1={padding.l + hover * xStep} y1={padding.t}
              x2={padding.l + hover * xStep} y2={padding.t + innerH}
              stroke="var(--text-tertiary)" strokeWidth={1} strokeDasharray="2 3"/>
            <circle cx={padding.l + hover * xStep} cy={xyL(hover, data[hover][leftKey])[1]} r={3.5} fill="var(--c1)"/>
            <circle cx={padding.l + hover * xStep} cy={xyR(hover, data[hover][rightKey])[1]} r={3.5} fill="var(--c2)"/>
          </g>
        )}
      </svg>
      {hover != null && (() => {
        const left = Math.min(width - 180, Math.max(8, padding.l + hover * xStep + 8));
        return (
          <div className="chart-tooltip" style={{ left, top: 12 }}>
            <div className="chart-tooltip-title">{data[hover].date}</div>
            <div className="chart-tooltip-row"><span className="name"><span className="dot" style={{ background: 'var(--c1)' }}/>{leftLabel}</span><span>{fmt.usd(data[hover][leftKey])}</span></div>
            <div className="chart-tooltip-row"><span className="name"><span className="dot" style={{ background: 'var(--c2)' }}/>{rightLabel}</span><span>${data[hover][rightKey].toFixed(6)}</span></div>
          </div>
        );
      })()}
    </div>
  );
};
window.DualAxisLine = DualAxisLine;

// ====== Stacked bar chart (for ingestion timeline) ======
const StackedBarChart = ({ data, series, height = 240 }) => {
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(800);
  const [hover, setHover] = React.useState(null);
  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  const padding = { t: 16, r: 16, b: 28, l: 56 };
  const innerW = Math.max(0, width - padding.l - padding.r);
  const innerH = height - padding.t - padding.b;
  const totals = data.map(d => series.reduce((s, k) => s + d[k.key], 0));
  const yMax = Math.max(...totals) * 1.1;
  const barW = innerW / data.length * 0.7;
  const gap = innerW / data.length * 0.3;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={wrapRef} className="chart-area" onMouseLeave={() => setHover(null)}>
      <svg className="chart-svg" width={width} height={height}>
        <g className="chart-grid">
          {yTicks.map((t, i) => (
            <line key={i} x1={padding.l} x2={padding.l + innerW}
              y1={padding.t + innerH - t * innerH}
              y2={padding.t + innerH - t * innerH}/>
          ))}
        </g>
        <g className="chart-axis">
          {yTicks.map((t, i) => (
            <text key={i} x={padding.l - 8} y={padding.t + innerH - t * innerH + 3} textAnchor="end">
              {fmt.numK(yMax * t)}
            </text>
          ))}
          {data.map((d, i) => (i % 5 === 0) ? (
            <text key={i} x={padding.l + (i + 0.5) * (innerW / data.length)} y={height - 8} textAnchor="middle">{d.date}</text>
          ) : null)}
        </g>
        {data.map((d, i) => {
          let stackY = padding.t + innerH;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={padding.l + i * (innerW / data.length) + gap / 2}
                y={padding.t} width={barW} height={innerH}
                fill="transparent"/>
              {series.map((s, si) => {
                const h = (d[s.key] / yMax) * innerH;
                stackY -= h;
                return (
                  <rect key={si}
                    x={padding.l + i * (innerW / data.length) + gap / 2}
                    y={stackY} width={barW} height={h}
                    fill={s.color}
                    opacity={hover === null || hover === i ? 1 : 0.5}/>
                );
              })}
            </g>
          );
        })}
      </svg>
      {hover != null && (() => {
        const left = Math.min(width - 180, padding.l + hover * (innerW / data.length) + 12);
        return (
          <div className="chart-tooltip" style={{ left, top: 12 }}>
            <div className="chart-tooltip-title">{data[hover].date}</div>
            {series.map((s, i) => (
              <div className="chart-tooltip-row" key={i}>
                <span className="name"><span className="dot" style={{ background: s.color }}/>{s.label}</span>
                <span>{fmt.num(data[hover][s.key])}</span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};
window.StackedBarChart = StackedBarChart;

// ====== Donut chart ======
const Donut = ({ data, size = 200, thickness = 28, centerValue, centerLabel, palette = CHART_PALETTE }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = -Math.PI / 2;

  const arc = (start, end, r, big) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${big} 1 ${x2} ${y2}`;
  };

  return (
    <svg width={size} height={size} className="chart-svg">
      {data.map((d, i) => {
        const slice = (d.value / total) * Math.PI * 2;
        const start = angle;
        const end = angle + slice;
        angle = end;
        const big = slice > Math.PI ? 1 : 0;
        return (
          <path key={i}
            d={arc(start, end, r, big)}
            stroke={d.color || palette[i % palette.length]}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="butt"/>
        );
      })}
      {centerValue != null && (
        <g className="donut-center">
          <text x={cx} y={cy + 4} className="donut-center-value">{centerValue}</text>
          {centerLabel && <text x={cx} y={cy + 22} className="donut-center-label">{centerLabel}</text>}
        </g>
      )}
    </svg>
  );
};
window.Donut = Donut;

const DonutLegend = ({ data, palette = CHART_PALETTE, formatValue }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {data.map((d, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
        <span className="legend-swatch" style={{ background: d.color || palette[i % palette.length] }}/>
        <span style={{ flex: 1 }}>{d.name}</span>
        <span className="mono dim">{formatValue ? formatValue(d.value) : fmt.num(d.value)}</span>
      </div>
    ))}
  </div>
);
window.DonutLegend = DonutLegend;

// ====== Sparkline ======
const Spark = ({ values, color = 'var(--brand)', height = 32, fill = true }) => {
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(120);
  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);
  return (
    <div ref={wrapRef} style={{ width: '100%', height }}>
      <svg width={width} height={height} className="chart-svg">
        {fill && <path d={areaPath(pts, height)} fill={color} opacity={0.16}/>}
        <path d={linePath(pts)} stroke={color} strokeWidth={1.5} fill="none"/>
      </svg>
    </div>
  );
};
window.Spark = Spark;

// ====== Horizontal bar list (banks etc.) ======
const HorizontalBars = ({ data, total, color = 'var(--c1)', formatValue = fmt.num, max }) => {
  const realTotal = total || data.reduce((s, d) => s + d.value, 0);
  const realMax = max || Math.max(...data.map(d => d.value));
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} className="bank-row">
          <div className="bank-row-label">{d.name}</div>
          <div className="bank-bar-track">
            <div className="bank-bar-fill" style={{ width: `${(d.value / realMax) * 100}%`, background: d.color || color }}/>
          </div>
          <div className="bank-row-count mono">{formatValue(d.value)}</div>
          <div className="bank-row-pct mono">{((d.value / realTotal) * 100).toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
};
window.HorizontalBars = HorizontalBars;

// ====== Grouped bars (currency: debit vs credit) ======
const GroupedBars = ({ data, height = 220 }) => {
  const wrapRef = React.useRef(null);
  const [width, setWidth] = React.useState(400);
  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);
  const padding = { t: 16, r: 16, b: 32, l: 56 };
  const innerW = Math.max(0, width - padding.l - padding.r);
  const innerH = height - padding.t - padding.b;
  const yMax = Math.max(...data.flatMap(d => [d.debit, d.credit])) * 1.1;
  const groupW = innerW / data.length;
  const barW = (groupW - 12) / 2;
  const yTicks = [0, 0.5, 1];

  return (
    <div ref={wrapRef}>
      <svg className="chart-svg" width={width} height={height}>
        <g className="chart-grid">
          {yTicks.map((t, i) => (
            <line key={i} x1={padding.l} x2={padding.l + innerW}
              y1={padding.t + innerH - t * innerH}
              y2={padding.t + innerH - t * innerH}/>
          ))}
        </g>
        <g className="chart-axis">
          {yTicks.map((t, i) => (
            <text key={i} x={padding.l - 8} y={padding.t + innerH - t * innerH + 3} textAnchor="end">
              {fmt.numK(yMax * t)}
            </text>
          ))}
          {data.map((d, i) => (
            <text key={i} x={padding.l + (i + 0.5) * groupW} y={height - 14} textAnchor="middle">{d.ccy}</text>
          ))}
        </g>
        {data.map((d, i) => {
          const dh = (d.debit / yMax) * innerH;
          const ch = (d.credit / yMax) * innerH;
          const x0 = padding.l + i * groupW + 6;
          return (
            <g key={i}>
              <rect x={x0} y={padding.t + innerH - dh} width={barW} height={dh} fill="var(--c5)" opacity={0.85}/>
              <rect x={x0 + barW + 2} y={padding.t + innerH - ch} width={barW} height={ch} fill="var(--c1)" opacity={0.85}/>
            </g>
          );
        })}
      </svg>
      <div className="chart-legend" style={{ paddingLeft: 56, marginTop: -8 }}>
        <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c5)' }}/>Debit</div>
        <div className="legend-item"><span className="legend-swatch" style={{ background: 'var(--c1)' }}/>Credit</div>
      </div>
    </div>
  );
};
window.GroupedBars = GroupedBars;

window.CHART_PALETTE = CHART_PALETTE;
