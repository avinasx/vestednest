/* eslint-disable @next/next/no-img-element */
import { ABOUT_PRESS } from "@/lib/static-pages/about-content";

export function AboutPressSection() {
  return (
    <section className="about-page-section about-page-section--muted" aria-labelledby="about-press-title">
      <div className="about-page-inner about-page-section-head">
        <span className="about-page-label">{ABOUT_PRESS.label}</span>
        <h2 id="about-press-title" className="about-page-section-title">
          {ABOUT_PRESS.title}{" "}
          <span className="about-page-section-accent">{ABOUT_PRESS.titleAccent}</span>
        </h2>
      </div>
      <div className="about-page-inner about-page-press-row">
        {ABOUT_PRESS.logos.map((logo) => (
          <div key={logo.alt} className="about-page-press-logo">
            <img
              src={logo.src}
              alt={logo.alt}
              style={logo.width ? { width: logo.width, maxWidth: "100%" } : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
