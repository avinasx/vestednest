/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { PRODUCT_FOOTER_LINKS } from "@/lib/product-pages/routes";
import {
  COMPANY_FOOTER_LINKS,
  RESOURCES_FOOTER_LINKS,
} from "@/lib/static-pages/routes";
import { VestedNestLogo } from "@/components/vestednest/logo";

const columns = [
  {
    title: "Products",
    links: PRODUCT_FOOTER_LINKS.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  },
  {
    title: "Company",
    links: COMPANY_FOOTER_LINKS.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  },
  {
    title: "Resources",
    links: RESOURCES_FOOTER_LINKS.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  },
];

const contact = [
  { icon: "/landing/icon-mail.svg", text: "connect@vestednest.com" },
  { icon: "/landing/icon-phone.svg", text: "(833) 888-LOAN" },
  { icon: "/landing/icon-calendar-sm.svg", text: "Mon–Fri • 9AM–6PM EST" },
];

const socials = [
  {
    href: "https://in.linkedin.com/",
    icon: "/landing/icon-linkedin.svg",
    label: "LinkedIn",
  },
  {
    href: "https://x.com/Praha37v",
    icon: "/landing/icon-x.svg",
    label: "X",
  },
  {
    href: "https://www.instagram.com/",
    icon: "/landing/icon-instagram.svg",
    label: "Instagram",
  },
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
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="landing-footer-social"
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                >
                  <img src={social.icon} alt="" aria-hidden />
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
                    <li key={link.label}>
                      {link.href ? (
                        <Link href={link.href}>{link.label}</Link>
                      ) : (
                        <span className="landing-footer-link--disabled">{link.label}</span>
                      )}
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
