import { VestedNestLogo } from "./logo";
import { PendingBadge } from "./pending-badge";
import { SectionWide } from "./section";

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
    links: ["About", "Careers", "Contact", "Blog / Insights", "Press"],
  },
  {
    title: "Resources",
    links: [
      "FAQ",
      "Loan Calculator",
      "Rate Estimates",
      "How It Works",
      "Guides for Investors",
    ],
  },
];

export function Footer() {
  return (
    <SectionWide surface className="border-t border-black/5 pb-8 pt-16">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <VestedNestLogo />
          <p className="mt-6 max-w-sm text-lg font-light leading-8 text-black/80">
            DSCR and bridge loans for serious operators. Real terms. Transparent
            pricing. Closings in as little as 14 days.
          </p>
          <p className="mt-6 whitespace-pre-line text-base font-light leading-7 text-black/80">
            {`concierge@vestednest.com\n(833) 888-LOAN\nMon–Fri · 9AM–6PM EST`}
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-base text-black">{col.title}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1.5 text-[17px] font-light text-black/80 hover:text-black"
                    >
                      {link}
                      <PendingBadge compact label="page not yet built" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-16 border-t border-black/10 pt-8 text-center text-[17px] font-light text-black/70">
        © 2026 Vested Nest. All rights reserved.
      </p>
    </SectionWide>
  );
}
