import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { fmt } from '@/utils/fmt';

interface Series {
  key: string;
  label: string;
  color: string;
  areaOpacity?: number;
  dash?: string;
  format?: (v: number) => string;
}

interface Annotation {
  value: string | number;
  label: string;
  axis?: 'x' | 'y';
  dataKey?: string;
}

interface LineChartProps {
  data: Record<string, unknown>[];
  series: Series[];
  height?: number;
  xKey?: string;
  yFormatter?: (v: number) => string;
  annotation?: Annotation;
  rightAxis?: {
    key: string;
    formatter?: (v: number) => string;
    target?: number;
    targetLabel?: string;
    color?: string;
  };
}

function CustomTooltip({ active, payload, label, series }: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
  series: Series[];
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
            <span>{s?.format ? s.format(p.value) : fmt.numK(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChartWidget({
  data,
  series,
  height = 260,
  xKey = 'date',
  yFormatter = fmt.numK,
  annotation,
  rightAxis,
}: LineChartProps) {
  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 16, right: rightAxis ? 56 : 16, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="0"
            stroke="var(--border-hairline)"
            vertical={false}
          />
          <XAxis
            dataKey={xKey}
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={yFormatter}
            tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          {rightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={rightAxis.formatter ?? ((v) => '$' + v.toFixed(5))}
              tick={{ fill: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
          )}
          <Tooltip
            content={<CustomTooltip series={series} />}
            cursor={{ stroke: 'var(--text-tertiary)', strokeWidth: 1, strokeDasharray: '2 3' }}
          />
          {annotation && (
            <ReferenceLine
              yAxisId="left"
              x={annotation.value}
              stroke="var(--brand-line)"
              strokeDasharray="3 3"
              label={{
                value: annotation.label,
                position: 'insideTopRight',
                fill: 'var(--brand)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}
          {rightAxis?.target != null && (
            <ReferenceLine
              yAxisId="right"
              y={rightAxis.target}
              stroke="var(--brand)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: rightAxis.targetLabel ?? `target $${rightAxis.target?.toFixed(5)}`,
                position: 'insideTopRight',
                fill: 'var(--brand)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
            />
          )}
          {series.map((s) => (
            s.areaOpacity != null ? (
              <Area
                key={s.key}
                yAxisId={rightAxis && s.key === rightAxis.key ? 'right' : 'left'}
                type="linear"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={s.color}
                fillOpacity={s.areaOpacity}
                dot={false}
                strokeDasharray={s.dash}
                isAnimationActive={false}
              />
            ) : (
              <Line
                key={s.key}
                yAxisId={rightAxis && s.key === rightAxis.key ? 'right' : 'left'}
                type="linear"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                strokeDasharray={s.dash}
                isAnimationActive={false}
              />
            )
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
