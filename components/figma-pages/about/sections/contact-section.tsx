/* eslint-disable @next/next/no-img-element */
import { ABOUT_CONTACT } from "@/lib/static-pages/about-content";

const CONTACT_ICONS: Record<string, string> = {
  "/landing/icon-mail.svg": "/figma-assets/imgMail01.svg",
  "/landing/icon-phone.svg": "/figma-assets/imgCall02.svg",
  "/landing/icon-location.svg": "/figma-assets/imgLocation01.svg",
};

export function AboutContactSection() {
  return (
    <section className="about-page-section about-page-section--white" aria-labelledby="about-contact-title">
      <div className="about-page-inner about-page-contact-layout">
        <div>
          <span className="about-page-label">{ABOUT_CONTACT.label}</span>
          <h2 id="about-contact-title" className="about-page-section-title">
            {ABOUT_CONTACT.title}{" "}
            <span className="about-page-section-accent">{ABOUT_CONTACT.titleAccent}</span>
          </h2>
          <p className="about-page-body">{ABOUT_CONTACT.lead}</p>
        </div>
        <div className="about-page-contact-cards">
          {ABOUT_CONTACT.items.map((item) => (
            <div key={item.title} className="about-page-contact-card">
              <img src={CONTACT_ICONS[item.icon] ?? item.icon} alt="" aria-hidden />
              <div>
                <p className="about-page-contact-title">{item.title}</p>
                {item.subtitle ? <p className="about-page-contact-sub">{item.subtitle}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
