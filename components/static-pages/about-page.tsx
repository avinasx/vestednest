/* eslint-disable @next/next/no-img-element */
import { SectionLabel } from "@/components/landing/section-label";
import { StaticCta } from "@/components/static-pages/static-cta";
import {
  ABOUT_CONTACT,
  ABOUT_CTA,
  ABOUT_DIFFERENTIATORS,
  ABOUT_HERO,
  ABOUT_MISSION,
  ABOUT_PRESS,
  ABOUT_TEAM,
} from "@/lib/static-pages/about-content";

export function AboutPage() {
  return (
    <div className="static-page about-page">
      <section className="static-hero static-hero--grid">
        <div className="static-hero-grid" aria-hidden />
        <div className="landing-section-inner static-hero-inner">
          <div className="landing-hero-badge">{ABOUT_HERO.badge}</div>
          <h1 className="static-hero-title">
            {ABOUT_HERO.title}
            <br />
            <em>{ABOUT_HERO.titleAccent}</em>
          </h1>
          <p className="static-hero-lead">{ABOUT_HERO.lead}</p>
          <div className="static-stats">
            {ABOUT_HERO.stats.map((stat, i) => (
              <div key={stat.label} className="static-stat">
                {i > 0 ? <span className="static-stat-divider" aria-hidden /> : null}
                <p className="static-stat-value">{stat.value}</p>
                <p className="static-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="static-section static-section--white">
        <div className="landing-section-inner static-mission-grid">
          <div className="static-mission-copy">
            <SectionLabel>{ABOUT_MISSION.label}</SectionLabel>
            <h2 className="static-section-title">
              {ABOUT_MISSION.title}
              <br />
              <em>{ABOUT_MISSION.titleAccent}</em>
            </h2>
            {ABOUT_MISSION.paragraphs.map((p) => (
              <p key={p} className="static-body">
                {p}
              </p>
            ))}
            <blockquote className="static-quote">
              <p>{ABOUT_MISSION.quote}</p>
              <cite>{ABOUT_MISSION.quoteAttribution}</cite>
            </blockquote>
          </div>
          <div className="static-beliefs-card">
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

      <section className="static-section">
        <div className="landing-section-inner text-center">
          <SectionLabel>{ABOUT_DIFFERENTIATORS.label}</SectionLabel>
          <h2 className="static-section-title">
            {ABOUT_DIFFERENTIATORS.title} <em>{ABOUT_DIFFERENTIATORS.titleAccent}</em>
          </h2>
        </div>
        <div className="landing-section-inner static-diff-grid">
          {ABOUT_DIFFERENTIATORS.items.map((item) => (
            <article key={item.title} className="static-diff-card">
              <img src={item.icon} alt="" aria-hidden className="static-diff-icon" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="static-section static-section--white">
        <div className="landing-section-inner text-center">
          <SectionLabel>{ABOUT_TEAM.label}</SectionLabel>
          <h2 className="static-section-title">
            {ABOUT_TEAM.title} <em>{ABOUT_TEAM.titleAccent}</em>
          </h2>
          <p className="static-section-lead">{ABOUT_TEAM.lead}</p>
        </div>
        <div className="landing-section-inner static-team-grid">
          {ABOUT_TEAM.members.map((member) => (
            <article key={member.name} className="static-team-card">
              <div className="static-team-head">
                <img src={member.photo} alt={member.name} className="static-team-photo" />
                <div>
                  <h3>{member.name}</h3>
                  <p className="static-team-role">{member.role}</p>
                </div>
              </div>
              <p className="static-team-bio">{member.bio}</p>
              <div className="static-team-social">
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

      <section className="static-section static-section--muted">
        <div className="landing-section-inner text-center">
          <SectionLabel>{ABOUT_PRESS.label}</SectionLabel>
          <h2 className="static-section-title">
            {ABOUT_PRESS.title} <em>{ABOUT_PRESS.titleAccent}</em>
          </h2>
        </div>
        <div className="landing-section-inner static-press-row">
          {ABOUT_PRESS.logos.map((logo) => (
            <div key={logo.alt} className="static-press-logo">
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="static-section static-section--white">
        <div className="landing-section-inner static-contact-grid">
          <div>
            <SectionLabel>{ABOUT_CONTACT.label}</SectionLabel>
            <h2 className="static-section-title">
              {ABOUT_CONTACT.title} <em>{ABOUT_CONTACT.titleAccent}</em>
            </h2>
            <p className="static-body">{ABOUT_CONTACT.lead}</p>
          </div>
          <div className="static-contact-cards">
            {ABOUT_CONTACT.items.map((item) => (
              <div key={item.title} className="static-contact-card">
                <img src={item.icon} alt="" aria-hidden />
                <div>
                  <p className="static-contact-title">{item.title}</p>
                  {item.subtitle ? <p className="static-contact-sub">{item.subtitle}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StaticCta
        title={ABOUT_CTA.title}
        titleAccent={ABOUT_CTA.titleAccent}
        lead={ABOUT_CTA.lead}
        perks={ABOUT_CTA.perks}
      />
    </div>
  );
}
