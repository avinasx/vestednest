import { HeaderNavLinks } from "@/components/landing/header-nav-links";
import { ApplyLink } from "@/components/vestednest/apply-link";
import { VestedNestLogo } from "@/components/vestednest/logo";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="landing-nav secondary-header">
      <div className="landing-nav-inner">
        <Link href="/" className="secondary-logo-link" aria-label="Vested Nest home">
          <VestedNestLogo />
        </Link>
        <nav className="landing-nav-links" aria-label="Main">
          <HeaderNavLinks />
        </nav>
        <div className="landing-nav-actions">
          <ApplyLink className="landing-nav-cta">Get pre-qualified</ApplyLink>
        </div>
      </div>
    </header>
  );
}
