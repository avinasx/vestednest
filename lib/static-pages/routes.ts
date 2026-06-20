export const SITE_ROUTES = {
  about: { href: "/about", label: "About Us", shortLabel: "About Us" },
  blog: { href: "/blog", label: "Blog / Insights", shortLabel: "Blog" },
  privacy: { href: "/privacy", label: "Privacy", shortLabel: "Privacy" },
  faq: { href: "/faq", label: "FAQ", shortLabel: "FAQ" },
} as const;

export const COMPANY_FOOTER_LINKS = [
  { label: "About", href: SITE_ROUTES.about.href },
  { label: "Careers", href: null },
  { label: "Contact", href: null },
  { label: SITE_ROUTES.blog.label, href: SITE_ROUTES.blog.href },
  { label: SITE_ROUTES.privacy.label, href: SITE_ROUTES.privacy.href },
] as const;

export const RESOURCES_FOOTER_LINKS = [
  { label: SITE_ROUTES.faq.label, href: SITE_ROUTES.faq.href },
  { label: "Loan Calculator", href: null },
  { label: "Rate Estimates", href: null },
  { label: "Guide for Investors", href: null },
] as const;
