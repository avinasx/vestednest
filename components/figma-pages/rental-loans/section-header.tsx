type SectionHeaderProps = {
  label: string;
  title: React.ReactNode;
  lead?: string;
  align?: "left" | "center";
};

export function SectionHeader({ label, title, lead, align = "center" }: SectionHeaderProps) {
  return (
    <header className={`rl-section-header rl-section-header--${align}`}>
      <div className="rl-label">
        <span className="rl-label-dot" aria-hidden />
        {label}
      </div>
      <h2 className="rl-section-title">{title}</h2>
      {lead ? <p className="rl-section-lead">{lead}</p> : null}
    </header>
  );
}
