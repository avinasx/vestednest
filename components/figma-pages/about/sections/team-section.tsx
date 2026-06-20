/* eslint-disable @next/next/no-img-element */
import { ABOUT_TEAM } from "@/lib/static-pages/about-content";

export function AboutTeamSection() {
  return (
    <section className="about-page-section about-page-section--white" aria-labelledby="about-team-title">
      <div className="about-page-inner about-page-section-head">
        <span className="about-page-label">{ABOUT_TEAM.label}</span>
        <h2 id="about-team-title" className="about-page-section-title">
          {ABOUT_TEAM.title}{" "}
          <span className="about-page-section-accent">{ABOUT_TEAM.titleAccent}</span>
        </h2>
        <p className="about-page-section-lead">{ABOUT_TEAM.lead}</p>
      </div>
      <div className="about-page-inner about-page-team-grid">
        {ABOUT_TEAM.members.map((member) => (
          <article key={member.name} className="about-page-team-card">
            <div className="about-page-team-main">
              <div className="about-page-team-head">
                <img src={member.photo} alt={member.name} className="about-page-team-photo" />
                <div>
                  <h3>{member.name}</h3>
                  <p className="about-page-team-role">{member.role}</p>
                </div>
              </div>
              <p className="about-page-team-bio">{member.bio}</p>
            </div>
            <div className="about-page-team-social">
              <a href="https://in.linkedin.com/" target="_blank" rel="noreferrer">
                <img src="/figma-assets/imgEeUrJQfpXibXJa3MotZvgAm9TsYSvg.svg" alt="LinkedIn" />
              </a>
              <a href="https://x.com/Praha37v" target="_blank" rel="noreferrer">
                <img src="/figma-assets/imgFUwXkleZJbkDudDvw93ZVo3GnlsSvg.svg" alt="X" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
