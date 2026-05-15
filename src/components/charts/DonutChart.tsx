import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fmt } from '@/utils/fmt';

interface DonutDataItem {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  data: DonutDataItem[];
  size?: number;
  centerValue?: string;
  centerLabel?: string;
  formatValue?: (v: number) => string;
}

const PALETTE = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];

export function DonutChart({
  data,
  size = 200,
  centerValue,
  centerLabel,
  formatValue = fmt.num,
}: DonutChartProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.3}
              outerRadius={size * 0.46}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.color ?? PALETTE[i % PALETTE.length]}
                />
              ))}
            </Pie>
            {centerValue != null && (
              <text x="50%" y="50%" dy={4} className="donut-center-value">
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text x="50%" y="50%" dy={22} className="donut-center-label">
                {centerLabel}
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}
          >
            <span
              className="legend-swatch"
              style={{ background: d.color ?? PALETTE[i % PALETTE.length] }}
            />
            <span style={{ flex: 1 }}>{d.name}</span>
            <span className="mono dim">{formatValue(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
