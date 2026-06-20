type SectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  lead?: string;
  align?: "left" | "center";
};

export function SectionHeader({ label, title, lead, align = "center" }: SectionHeaderProps) {
  return (
    <header className={`fnl-section-header fnl-section-header--${align}`}>
      <div className="fnl-label">
        <span className="fnl-label-dot" aria-hidden />
        {label}
      </div>
      <h2 className="fnl-section-title">{title}</h2>
      {lead ? <p className="fnl-section-lead">{lead}</p> : null}
    </header>
  );
}
