import type { ReactNode } from "react";

type SectionHeaderProps = {
  label: string;
  title: ReactNode;
  lead?: string;
  align?: "left" | "center";
};

export function SectionHeader({ label, title, lead, align = "center" }: SectionHeaderProps) {
  return (
    <header className={`bl-section-header bl-section-header--${align}`}>
      <div className="bl-label">
        <span className="bl-label-dot" aria-hidden />
        {label}
      </div>
      <h2 className="bl-section-title">{title}</h2>
      {lead ? <p className="bl-section-lead">{lead}</p> : null}
    </header>
  );
}
