import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = 'Failed to load data. Is the backend running?' }: ErrorStateProps) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <AlertTriangle size={36} style={{ color: 'var(--critical)' }} />
      </div>
      <div className="empty-title" style={{ color: 'var(--critical)' }}>Something went wrong</div>
      <div className="empty-sub">{message}</div>
    </div>
  );
}
