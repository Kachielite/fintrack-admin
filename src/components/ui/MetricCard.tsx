import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: React.ReactNode;
  trend?: string;
  trendDir?: 'up' | 'down';
  trendGood?: boolean;
  info?: string;
  children?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  unit,
  sub,
  trend,
  trendDir,
  trendGood,
  info,
  children,
}: MetricCardProps) {
  return (
    <div className="card metric-card">
      <div className="metric-label">
        {label}
        {info && (
          <span className="has-tooltip" data-tooltip={info}>
            <Info size={12} />
          </span>
        )}
      </div>
      <div className="metric-value">
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      {(sub || trend) && (
        <div className="metric-sub">
          {sub}
          {trend && (
            <span
              className={`metric-trend ${trendDir ?? ''}${trendGood ? ' good' : ''}`}
            >
              {trendDir === 'up' ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
