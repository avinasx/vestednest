import { ApplyLink } from "@/components/vestednest/apply-link";
import { AuthNav } from "@/components/vestednest/auth-nav";
import { VestedNestLogo } from "@/components/vestednest/logo";
import Link from "next/link";

const links = ["What we do", "DSCR loans", "Resources", "About Us"];

export function AppHeader() {
  return (
    <header className="landing-nav secondary-header">
      <div className="landing-nav-inner">
        <Link href="/" className="secondary-logo-link" aria-label="Vested Nest home">
          <VestedNestLogo />
        </Link>
        <nav className="landing-nav-links" aria-label="Main">
          {links.map((label) => (
            <button key={label} type="button" className="landing-nav-link">
              {label}
            </button>
          ))}
        </nav>
        <div className="landing-nav-actions">
          <AuthNav />
          <ApplyLink className="landing-nav-cta">Get pre-qualified</ApplyLink>
        </div>
      </div>
    </header>
  );
}
