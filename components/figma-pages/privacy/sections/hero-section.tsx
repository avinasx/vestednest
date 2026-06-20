import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { PRIVACY_HERO } from "@/lib/static-pages/privacy-content";

export function PrivacyHeroSection() {
  return (
    <section className="privacy-page-hero" aria-labelledby="privacy-page-title">
      <FigmaHeroBackground variant="content" />
      <div className="privacy-page-inner privacy-page-hero-inner">
        <div className="privacy-page-hero-copy">
          <div className="privacy-page-badge">{PRIVACY_HERO.badge}</div>
          <h1 id="privacy-page-title" className="privacy-page-hero-title">
            <span>{PRIVACY_HERO.title} </span>
            <span className="privacy-page-hero-accent">{PRIVACY_HERO.titleAccent}</span>
          </h1>
        </div>
        <p className="privacy-page-hero-lead">{PRIVACY_HERO.lead}</p>
      </div>
    </section>
  );
}
