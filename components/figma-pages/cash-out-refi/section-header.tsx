type SectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  lead?: string;
  align?: "left" | "center";
};

export function SectionHeader({ label, title, lead, align = "center" }: SectionHeaderProps) {
  return (
    <header className={`cor-section-header cor-section-header--${align}`}>
      <div className="cor-label">
        <span className="cor-label-dot" aria-hidden />
        {label}
      </div>
      <h2 className="cor-section-title">{title}</h2>
      {lead ? <p className="cor-section-lead">{lead}</p> : null}
    </header>
  );
}
