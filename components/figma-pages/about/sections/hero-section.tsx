import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { ABOUT_HERO } from "@/lib/static-pages/about-content";

export function AboutHeroSection() {
  return (
    <section className="about-page-hero" aria-labelledby="about-page-title">
      <FigmaHeroBackground variant="content" />
      <div className="about-page-inner about-page-hero-inner">
        <div className="about-page-badge">{ABOUT_HERO.badge}</div>
        <h1 id="about-page-title" className="about-page-hero-title">
          <span>{ABOUT_HERO.title} </span>
          <span className="about-page-hero-accent">{ABOUT_HERO.titleAccent}</span>
        </h1>
        <p className="about-page-hero-lead">{ABOUT_HERO.lead}</p>
        <div className="about-page-stats">
          {ABOUT_HERO.stats.map((stat, index) => (
            <div key={stat.label} className="about-page-stat">
              {index > 0 ? <span className="about-page-stat-divider" aria-hidden /> : null}
              <p className="about-page-stat-value">{stat.value}</p>
              <p className="about-page-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
