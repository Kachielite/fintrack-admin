interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <div className="section-subtitle">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
