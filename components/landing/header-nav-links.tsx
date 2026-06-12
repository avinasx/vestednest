import Link from "next/link";
import { PendingBadge } from "@/components/vestednest/pending-badge";

export const HEADER_SECTION_IDS = {
  process: "process",
  whyDscr: "why-dscr",
} as const;

type HeaderNavLinksProps = {
  onSectionNavigate?: (sectionId: string) => void;
};

const LINKS = [
  { label: "What we do", sectionId: HEADER_SECTION_IDS.process, href: "/#process" },
  { label: "DSCR loans", sectionId: HEADER_SECTION_IDS.whyDscr, href: "/#why-dscr" },
  { label: "Resources", disabled: true as const },
  { label: "About Us", disabled: true as const, pending: true as const },
];

export function HeaderNavLinks({ onSectionNavigate }: HeaderNavLinksProps) {
  return (
    <>
      {LINKS.map((link) => {
        if (link.disabled) {
          return (
            <span
              key={link.label}
              className={`landing-nav-link landing-nav-link--disabled${"pending" in link && link.pending ? " landing-nav-link--pending" : ""}`}
              aria-disabled="true"
            >
              {link.label}
              {"pending" in link && link.pending ? <PendingBadge compact className="ml-1" /> : null}
            </span>
          );
        }

        if (onSectionNavigate) {
          return (
            <button
              key={link.label}
              type="button"
              className="landing-nav-link"
              onClick={() => onSectionNavigate(link.sectionId)}
            >
              {link.label}
            </button>
          );
        }

        return (
          <Link key={link.label} href={link.href} className="landing-nav-link">
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
