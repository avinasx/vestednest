/* eslint-disable @next/next/no-img-element */
import { VestedNestLogo } from "@/components/vestednest/logo";

const columns = [
  {
    title: "Products",
    links: [
      "DSCR Loans",
      "Bridge Loans",
      "Cash-Out Refinance",
      "Rental Property Loans",
      "Foreign National Loans",
    ],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact", "Blog / Insights", "Privacy"],
  },
  {
    title: "Resources",
    links: ["FAQ", "Loan Calculator", "Rate Estimates", "Guides for Investors"],
  },
];

const socials = [
  { label: "LinkedIn", href: "https://in.linkedin.com/", icon: "/landing/icon-linkedin.svg" },
  { label: "X", href: "https://x.com/", icon: "/landing/icon-x.svg" },
  { label: "Instagram", href: "https://www.instagram.com/", icon: "/landing/icon-instagram.svg" },
];

const contact = [
  { icon: "/landing/icon-mail.svg", text: "connect@vestednest.com" },
  { icon: "/landing/icon-phone.svg", text: "(833) 888-LOAN" },
  { icon: "/landing/icon-calendar-sm.svg", text: "Mon–Fri • 9AM–6PM EST" },
];

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-grid">
          <div>
            <VestedNestLogo />
            <p className="landing-footer-tagline">
              DSCR and bridge loans for serious operators. Transparent pricing. Closings in as
              little as 14 days.
            </p>
            <div className="landing-footer-contact">
              {contact.map((c) => (
                <p key={c.text}>
                  <img src={c.icon} alt="" aria-hidden />
                  {c.text}
                </p>
              ))}
            </div>
            <div className="landing-footer-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="landing-footer-social"
                >
                  <img src={s.icon} alt="" aria-hidden />
                </a>
              ))}
            </div>
          </div>
          <div className="landing-footer-cols">
            {columns.map((col) => (
              <div key={col.title} className="landing-footer-col">
                <h3>{col.title}</h3>
                <ul>
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="landing-footer-copy">© 2026 Vested Nest. All rights reserved.</p>
      </div>
    </footer>
  );
}
