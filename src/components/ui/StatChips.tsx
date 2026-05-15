interface StatChipItem {
  label: string;
  value: string | number;
  kind?: 'healthy' | 'warning' | 'critical' | '';
}

interface StatChipsProps {
  items: StatChipItem[];
}

export function StatChips({ items }: StatChipsProps) {
  return (
    <div className="stat-chips">
      {items.map((it, i) => (
        <div className="stat-chip" key={i}>
          <div className="stat-chip-label">{it.label}</div>
          <div className={`stat-chip-value ${it.kind ?? ''}`}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}
