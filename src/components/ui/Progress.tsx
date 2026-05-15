interface ProgressProps {
  value: number;
  kind?: 'healthy' | 'warning' | 'critical' | 'neutral';
  showLabel?: boolean;
  dp?: number;
}

export function Progress({ value, kind, showLabel = true, dp = 0 }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  const k = kind ?? (pct >= 85 ? 'healthy' : pct >= 70 ? 'warning' : 'critical');
  return (
    <div className="progress-with-label">
      <div className="progress" style={{ flex: 1 }}>
        <div className={`progress-fill ${k}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="progress-label">{value.toFixed(dp)}%</span>
      )}
    </div>
  );
}
