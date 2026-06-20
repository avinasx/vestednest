import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { FAQ_HERO } from "@/lib/static-pages/faq-content";

export function FaqHeroSection() {
  return (
    <section className="faq-page-hero" aria-labelledby="faq-page-title">
      <FigmaHeroBackground variant="content" />
      <div className="faq-page-inner faq-page-hero-inner">
        <div className="faq-page-hero-copy">
          <div className="faq-page-badge">{FAQ_HERO.badge}</div>
          <h1 id="faq-page-title" className="faq-page-hero-title">
            <span>{FAQ_HERO.title} </span>
            <span className="faq-page-hero-accent">{FAQ_HERO.titleAccent}</span>
          </h1>
        </div>
        <p className="faq-page-hero-lead">{FAQ_HERO.lead}</p>
      </div>
    </section>
  );
}
