"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderNavLinks } from "@/components/landing/header-nav-links";
import { VestedNestLogo } from "@/components/vestednest/logo";

type LandingNavProps = {
  onGetPreQualified: () => void;
  onSectionNavigate?: (sectionId: string) => void;
  /** SPA home — e.g. goTo(0) when already on `/` */
  onHomeNavigate?: () => void;
};

export function LandingNav({
  onGetPreQualified,
  onSectionNavigate,
  onHomeNavigate,
}: LandingNavProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="landing-nav" aria-hidden>
        <div className="landing-nav-inner" />
      </header>
    );
  }

  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link
          href="/"
          className="secondary-logo-link"
          aria-label="Vested Nest home"
          onClick={(e) => {
            if (!onHomeNavigate) return;
            e.preventDefault();
            onHomeNavigate();
          }}
        >
          <VestedNestLogo />
        </Link>
        <nav className="landing-nav-links" aria-label="Main">
          <HeaderNavLinks onSectionNavigate={onSectionNavigate} />
        </nav>
        <div className="landing-nav-actions">
          <button type="button" onClick={onGetPreQualified} className="landing-nav-cta">
            Get pre-qualified
          </button>
        </div>
      </div>
    </header>
  );
}
