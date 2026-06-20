"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRODUCT_ROUTES } from "@/lib/product-pages/routes";
import { SITE_ROUTES } from "@/lib/static-pages/routes";

export const HEADER_SECTION_IDS = {
  process: "process",
  whyDscr: "why-dscr",
} as const;

type HeaderNavLinksProps = {
  onSectionNavigate?: (sectionId: string) => void;
};

type NavLink =
  | { label: string; sectionId: string; href: string }
  | { label: string; href: string }
  | { label: string; disabled: true };

const LINKS: NavLink[] = [
  { label: "What we do", sectionId: HEADER_SECTION_IDS.process, href: "/#process" },
  { label: PRODUCT_ROUTES.dscrLoans.shortLabel, href: PRODUCT_ROUTES.dscrLoans.href },
  { label: PRODUCT_ROUTES.bridgeLoans.shortLabel, href: PRODUCT_ROUTES.bridgeLoans.href },
  { label: SITE_ROUTES.about.shortLabel, href: SITE_ROUTES.about.href },
  { label: SITE_ROUTES.blog.shortLabel, href: SITE_ROUTES.blog.href },
  { label: SITE_ROUTES.privacy.shortLabel, href: SITE_ROUTES.privacy.href },
  { label: SITE_ROUTES.faq.shortLabel, href: SITE_ROUTES.faq.href },
];

function isNavLinkActive(pathname: string, link: NavLink): boolean {
  if ("disabled" in link) return false;
  if ("sectionId" in link) return pathname === "/";
  if (link.href === "/") return pathname === "/";
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

function navLinkClassName(active: boolean) {
  return `landing-nav-link${active ? " landing-nav-link--active" : ""}`;
}

export function HeaderNavLinks({ onSectionNavigate }: HeaderNavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map((link) => {
        if ("disabled" in link) {
          return (
            <span
              key={link.label}
              className="landing-nav-link landing-nav-link--disabled"
              aria-disabled="true"
            >
              {link.label}
            </span>
          );
        }

        const active = isNavLinkActive(pathname, link);

        if ("sectionId" in link && onSectionNavigate) {
          return (
            <button
              key={link.label}
              type="button"
              className={navLinkClassName(active)}
              aria-current={active ? "page" : undefined}
              onClick={() => onSectionNavigate(link.sectionId)}
            >
              {link.label}
            </button>
          );
        }

        return (
          <Link
            key={link.label}
            href={link.href}
            className={navLinkClassName(active)}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
