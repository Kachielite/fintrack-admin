import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  sub?: string;
}

export function EmptyState({ title, sub }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Inbox size={36} />
      </div>
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  );
}
