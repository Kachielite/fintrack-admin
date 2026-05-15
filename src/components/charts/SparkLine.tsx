import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparkLineProps {
  values: number[];
  color?: string;
  height?: number;
}

export function SparkLine({ values, color = 'var(--brand)', height = 40 }: SparkLineProps) {
  const data = values.map((v) => ({ v }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
