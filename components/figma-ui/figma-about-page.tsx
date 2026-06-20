/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ABOUT_CONTACT,
  ABOUT_CTA,
  ABOUT_DIFFERENTIATORS,
  ABOUT_HERO,
  ABOUT_MISSION,
  ABOUT_PRESS,
  ABOUT_TEAM,
} from "@/lib/static-pages/about-content";

export function FigmaAboutPage() {
  return (
    <>
      <section className="fn-hero">
        <div className="fn-hero-grid" aria-hidden />
        <div className="fn-inner fn-hero-inner">
          <div className="fn-badge">{ABOUT_HERO.badge}</div>
          <h1 className="fn-hero-title">
            {ABOUT_HERO.title}
            <br />
            <em>{ABOUT_HERO.titleAccent}</em>
          </h1>
          <p className="fn-hero-lead">{ABOUT_HERO.lead}</p>
          <div className="fn-stats">
            {ABOUT_HERO.stats.map((stat, i) => (
              <div key={stat.label} className="fn-stat">
                {i > 0 ? <span className="fn-stat-divider" aria-hidden /> : null}
                <p className="fn-stat-value">{stat.value}</p>
                <p className="fn-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fn-section fn-section--white">
        <div className="fn-inner fn-mission-grid">
          <div>
            <span className="fn-label">{ABOUT_MISSION.label}</span>
            <h2 className="fn-section-title">
              {ABOUT_MISSION.title}
              <br />
              <em>{ABOUT_MISSION.titleAccent}</em>
            </h2>
            {ABOUT_MISSION.paragraphs.map((p) => (
              <p key={p} className="fn-body">
                {p}
              </p>
            ))}
            <blockquote className="fn-quote">
              <p>{ABOUT_MISSION.quote}</p>
              <cite>{ABOUT_MISSION.quoteAttribution}</cite>
            </blockquote>
          </div>
          <div className="fn-beliefs-card">
            <h3>What we believe</h3>
            <ul>
              {ABOUT_MISSION.beliefs.map((item) => (
                <li key={item.title}>
                  <img src="/landing/icon-check-circle.svg" alt="" aria-hidden />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="fn-section fn-section--muted">
        <div className="fn-inner fn-text-center">
          <span className="fn-label">{ABOUT_DIFFERENTIATORS.label}</span>
          <h2 className="fn-section-title">
            {ABOUT_DIFFERENTIATORS.title} <em>{ABOUT_DIFFERENTIATORS.titleAccent}</em>
          </h2>
        </div>
        <div className="fn-inner fn-diff-grid">
          {ABOUT_DIFFERENTIATORS.items.map((item) => (
            <article key={item.title} className="fn-diff-card">
              <img src={item.icon} alt="" aria-hidden className="fn-diff-icon" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="fn-section fn-section--white">
        <div className="fn-inner fn-text-center">
          <span className="fn-label">{ABOUT_TEAM.label}</span>
          <h2 className="fn-section-title">
            {ABOUT_TEAM.title} <em>{ABOUT_TEAM.titleAccent}</em>
          </h2>
          <p className="fn-section-lead">{ABOUT_TEAM.lead}</p>
        </div>
        <div className="fn-inner fn-team-grid">
          {ABOUT_TEAM.members.map((member) => (
            <article key={member.name} className="fn-team-card">
              <div className="fn-team-head">
                <img src={member.photo} alt={member.name} className="fn-team-photo" />
                <div>
                  <h3>{member.name}</h3>
                  <p className="fn-team-role">{member.role}</p>
                </div>
              </div>
              <p className="fn-team-bio">{member.bio}</p>
              <div className="fn-team-social">
                <a href="https://in.linkedin.com/" target="_blank" rel="noreferrer">
                  <img src="/landing/icon-linkedin.svg" alt="LinkedIn" />
                </a>
                <a href="https://x.com/Praha37v" target="_blank" rel="noreferrer">
                  <img src="/landing/icon-x.svg" alt="X" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fn-section fn-section--muted">
        <div className="fn-inner fn-text-center">
          <span className="fn-label">{ABOUT_PRESS.label}</span>
          <h2 className="fn-section-title">
            {ABOUT_PRESS.title} <em>{ABOUT_PRESS.titleAccent}</em>
          </h2>
        </div>
        <div className="fn-inner fn-press-row">
          {ABOUT_PRESS.logos.map((logo) => (
            <div key={logo.alt} className="fn-press-logo">
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="fn-section fn-section--white">
        <div className="fn-inner fn-contact-grid">
          <div>
            <span className="fn-label">{ABOUT_CONTACT.label}</span>
            <h2 className="fn-section-title">
              {ABOUT_CONTACT.title} <em>{ABOUT_CONTACT.titleAccent}</em>
            </h2>
            <p className="fn-body">{ABOUT_CONTACT.lead}</p>
          </div>
          <div className="fn-contact-cards">
            {ABOUT_CONTACT.items.map((item) => (
              <div key={item.title} className="fn-contact-card">
                <img src={item.icon} alt="" aria-hidden />
                <div>
                  <p className="fn-contact-title">{item.title}</p>
                  {item.subtitle ? <p className="fn-contact-sub">{item.subtitle}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fn-final-cta">
        <div className="fn-inner">
          <h2>
            {ABOUT_CTA.title} <em>{ABOUT_CTA.titleAccent}</em>
          </h2>
          <p className="fn-section-lead">{ABOUT_CTA.lead}</p>
          <Link href="/" className="fn-cta-btn">
            Start with an address →
          </Link>
          {ABOUT_CTA.perks?.length ? (
            <div className="fn-perks mt-6">
              {ABOUT_CTA.perks.map((perk) => (
                <span key={perk} className="fn-perk">
                  <img src="/figma-assets/imgCheckmarkCircle02.svg" alt="" aria-hidden />
                  {perk}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
