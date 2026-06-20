/* eslint-disable @next/next/no-img-element */
import { ABOUT_DIFFERENTIATORS } from "@/lib/static-pages/about-content";

export function AboutDifferentiatorsSection() {
  return (
    <section
      className="about-page-section about-page-section--muted"
      aria-labelledby="about-diff-title"
    >
      <div className="about-page-inner about-page-section-head">
        <span className="about-page-label">{ABOUT_DIFFERENTIATORS.label}</span>
        <h2 id="about-diff-title" className="about-page-section-title">
          {ABOUT_DIFFERENTIATORS.title}{" "}
          <span className="about-page-section-accent">{ABOUT_DIFFERENTIATORS.titleAccent}</span>
        </h2>
      </div>
      <div className="about-page-inner about-page-diff-grid">
        {ABOUT_DIFFERENTIATORS.items.map((item) => (
          <article key={item.title} className="about-page-diff-card">
            <img src={item.icon} alt="" aria-hidden className="about-page-diff-icon" />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
