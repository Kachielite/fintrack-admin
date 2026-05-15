interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  current: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, current, onChange }: TabsProps) {
  return (
    <div className="tab-row">
      {tabs.map((t) => (
        <button
          key={t.value}
          className={`tab${current === t.value ? ' active' : ''}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
