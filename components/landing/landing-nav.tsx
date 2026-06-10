"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VestedNestLogo } from "@/components/vestednest/logo";

const links = ["What we do", "DSCR loans", "Resources", "About Us"];

type LandingNavProps = {
  onGetPreQualified: () => void;
};

export function LandingNav({ onGetPreQualified }: LandingNavProps) {
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
        <VestedNestLogo />
        <nav className="landing-nav-links" aria-label="Main">
          {links.map((label) => (
            <button key={label} type="button" className="landing-nav-link">
              {label}
            </button>
          ))}
        </nav>
        <div className="landing-nav-actions">
          <Link href="/login" className="landing-nav-signin">
            Sign in
          </Link>
          <button type="button" onClick={onGetPreQualified} className="landing-nav-cta">
            Get pre-qualified
          </button>
        </div>
      </div>
    </header>
  );
}
