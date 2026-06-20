/* eslint-disable @next/next/no-img-element */
import { ABOUT_MISSION } from "@/lib/static-pages/about-content";

export function AboutMissionSection() {
  return (
    <section className="about-page-section about-page-section--white" aria-labelledby="about-mission-title">
      <div className="about-page-inner about-page-mission-layout">
        <div className="about-page-mission-copy">
          <span className="about-page-label">{ABOUT_MISSION.label}</span>
          <h2 id="about-mission-title" className="about-page-section-title">
            {ABOUT_MISSION.title}{" "}
            <span className="about-page-section-accent">{ABOUT_MISSION.titleAccent}</span>
          </h2>
          {ABOUT_MISSION.paragraphs.map((paragraph) => (
            <p key={paragraph} className="about-page-body">
              {paragraph}
            </p>
          ))}
          <blockquote className="about-page-quote">
            <p>{ABOUT_MISSION.quote}</p>
            <cite>{ABOUT_MISSION.quoteAttribution}</cite>
          </blockquote>
        </div>
        <aside className="about-page-beliefs-card">
          <h3>What we believe</h3>
          <ul>
            {ABOUT_MISSION.beliefs.map((belief) => (
              <li key={belief.title}>
                <img src="/figma-assets/imgCheckmarkCircle02.svg" alt="" aria-hidden />
                <div>
                  <strong>{belief.title}</strong>
                  <p>{belief.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
