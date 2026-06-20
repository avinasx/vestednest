import { PRIVACY_SECTIONS } from "@/lib/static-pages/content/privacy";

export function PrivacyPage() {
  return (
    <>
      <section className="static-hero static-hero--privacy">
        <div className="landing-section-inner static-hero-inner">
          <p className="static-privacy-updated">Last updated: June 2026</p>
          <h1 className="static-hero-title">Vested Nest Privacy Policy</h1>
          <p className="static-hero-lead">
            How Vested Nest collects, uses, and protects your information. We keep it plain English
            — no 40-page legal maze.
          </p>
        </div>
      </section>

      <section className="static-section">
        <div className="landing-section-inner static-privacy-content">
          {PRIVACY_SECTIONS.map((section) => (
            <article key={section.title} className="static-privacy-block">
              <h2>{section.title}</h2>
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="static-privacy-sub">
                  <h3>{sub.title}</h3>
                  <p>{sub.body}</p>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
