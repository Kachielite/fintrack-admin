import { fmt } from '@/utils/fmt';

interface FunnelStep {
  step: string;
  count: number;
}

interface FunnelProps {
  steps: FunnelStep[];
  color?: string;
}

export function Funnel({ steps, color = 'var(--brand)' }: FunnelProps) {
  const top = steps[0]?.count ?? 1;
  return (
    <div className="funnel">
      {steps.map((s, i) => {
        const prev = i === 0 ? s.count : steps[i - 1].count;
        const dropPct = i === 0 ? 0 : ((prev - s.count) / prev) * 100;
        return (
          <div className="funnel-step" key={i}>
            <div className="funnel-step-label">{s.step}</div>
            <div className="funnel-bar-track">
              <div
                className="funnel-bar-fill"
                style={{ width: `${(s.count / top) * 100}%`, background: color }}
              />
            </div>
            <div className="funnel-step-count mono">{fmt.num(s.count)}</div>
            <div className={`funnel-step-drop${dropPct > 25 ? ' high' : ''}`}>
              {i === 0 ? '—' : `−${dropPct.toFixed(0)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
