type BadgeKind =
  | 'production'
  | 'audited'
  | 'candidate'
  | 'failed_audit'
  | 'degrading'
  | 'healthy'
  | 'warning'
  | 'no_coverage'
  | 'critical'
  | 'neutral'
  | 'stale'
  | 'revoked';

interface BadgeProps {
  kind: BadgeKind;
  children?: React.ReactNode;
}

export function Badge({ kind, children }: BadgeProps) {
  return (
    <span className={`badge ${kind}`}>
      {children ?? kind.replace(/_/g, ' ')}
    </span>
  );
}
