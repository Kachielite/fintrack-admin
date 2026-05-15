import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { fmt } from '@/utils/fmt';

interface BarDataItem {
  [key: string]: unknown;
}

interface BarSeries {
  key: string;
  label: string;
  color: string;
  stackId?: string;
}

interface BarChartWidgetProps {
  data: BarDataItem[];
  series: BarSeries[];
  height?: number;
  direction?: 'vertical' | 'horizontal';
  nameKey?: string;
  yFormatter?: (v: number) => string;
  colors?: string[];
}

function CustomTooltip({ active, payload, label, series }: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
  series: BarSeries[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip-box">
      <div className="chart-tooltip-title">{label}</div>
      {payload.map((p) => {
        const s = series.find((s) => s.key === p.dataKey);
        return (
          <div className="chart-tooltip-row" key={p.dataKey}>
            <span className="name">
              <span className="dot" style={{ background: p.color }} />
              {s?.label ?? p.dataKey}
            </span>
            <span>{fmt.numK(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function BarChartWidget({
  data,
  series,
  height = 240,
  direction = 'vertical',
  nameKey = 'name',
  yFormatter = fmt.numK,
}: BarChartWidgetProps) {
  if (direction === 'horizontal') {
    return (
      <div className="chart-area">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 80 }}
          >
            <CartesianGrid strokeDasharray="0" stroke="var(--border-hairline)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={yFormatter}
              tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey={nameKey}
              type="category"
              tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={76}
            />
            <Tooltip
              content={<CustomTooltip series={series} />}
              cursor={{ fill: 'var(--bg-hover)' }}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color}
                radius={[0, 3, 3, 0]}
                isAnimationActive={false}
                stackId={s.stackId}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="0" stroke="var(--border-hairline)" vertical={false} />
          <XAxis
            dataKey={nameKey}
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={yFormatter}
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={<CustomTooltip series={series} />}
            cursor={{ fill: 'var(--bg-hover)' }}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
              stackId={s.stackId}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal bar list (custom, no recharts — matches HorizontalBars from designs)
interface HBarItem {
  name: string;
  value: number;
  color?: string;
}

interface HorizontalBarsProps {
  data: HBarItem[];
  total?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function HorizontalBars({ data, total, color = 'var(--c1)', formatValue = fmt.num }: HorizontalBarsProps) {
  const realTotal = total ?? data.reduce((s, d) => s + d.value, 0);
  const realMax = Math.max(...data.map((d) => d.value));
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} className="bank-row">
          <div className="bank-row-label">{d.name}</div>
          <div className="bank-bar-track">
            <div
              className="bank-bar-fill"
              style={{
                width: `${(d.value / realMax) * 100}%`,
                background: d.color ?? color,
              }}
            />
          </div>
          <div className="bank-row-count mono">{formatValue(d.value)}</div>
          <div className="bank-row-pct mono">{((d.value / realTotal) * 100).toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

// Grouped bars (currency debit vs credit)
interface GroupedBarItem {
  [key: string]: unknown;
}

interface GroupedBarsProps {
  data: GroupedBarItem[];
  series: Array<{ key: string; label: string; color: string }>;
  height?: number;
}

export function GroupedBars({ data, series, height = 220 }: GroupedBarsProps) {
  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="0" stroke="var(--border-hairline)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={fmt.numK}
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            content={<CustomTooltip series={series} />}
            cursor={{ fill: 'var(--bg-hover)' }}
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              radius={[3, 3, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-legend" style={{ marginTop: 8 }}>
        {series.map((s) => (
          <div className="legend-item" key={s.key}>
            <span className="legend-swatch" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Single-series colored bar list (for category charts)
interface SingleBarProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  height?: number;
  nameKey?: string;
}

export function ColoredBarChart({ data, colors, height = 220 }: SingleBarProps) {
  const PALETTE = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 0, left: 80 }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border-hairline)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={fmt.numK}
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={76}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="chart-tooltip-box">
                  <div className="chart-tooltip-title">{label}</div>
                  <div className="chart-tooltip-row">
                    <span className="name">{label}</span>
                    <span>{fmt.numK(payload[0].value as number)}</span>
                  </div>
                </div>
              );
            }}
            cursor={{ fill: 'var(--bg-hover)' }}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={(colors ?? PALETTE)[i % (colors ?? PALETTE).length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
