/* eslint-disable @next/next/no-img-element */
import { CheckItem } from "./check-item";
import { SectionLabel } from "./section-label";

const CARDS = [
  {
    title: "The property pays the loan. Not you.",
    body: "No DTI. No tax returns. No employment verification. The rental cash flow (DSCR) carries the file. LLC and entity borrowers are the default — not the exception.",
    checks: ["No DTI calculation", "No tax returns", "No employment check", "LLC/ entity by default"],
    icon: "/landing/icon-home.svg",
  },
  {
    title: "See your rate on screen. Right now.",
    body: "Consumer mortgages are bound by TRID — every quote is a 3-day wait. DSCR is a business-purpose loan, so we render real rate, points, and payment the moment you drop an address. No email gate.",
    checks: [
      "TRID / RESPA exempt",
      "Live rate, no email gate",
      "No 3-day waiting period",
      "AI reads rent comps instantly",
    ],
    icon: "/landing/icon-trade-up.svg",
  },
  {
    title: "Close in 14 days. Not 45.",
    body: "Our median is 14 calendar days. Light docs, parallel underwriting, and a dedicated funder mean you can compete with cash offers. No one else can say that.",
    checks: [
      "Median 14-day close",
      "VS. 45-day conventional",
      "Parallel underwriting",
      "Compete with cash buyers",
    ],
    icon: "/landing/icon-calendar.svg",
  },
];

export function WhyDscrSection() {
  return (
    <section id="why-dscr" className="landing-section" style={{ background: "#f4f2f1" }}>
      <div className="landing-section-inner">
        <div className="text-center">
          <SectionLabel>Why DSCR is Different</SectionLabel>
          <h2 className="landing-section-title">
            We fixed how you lend. <strong>Here&apos;s how.</strong>
          </h2>
          <p className="landing-section-lead">
            DSCR is a business-purpose loan to an entity borrower — TRID, RESPA, and DTI constraints
            don&apos;t apply. That changes everything.
          </p>
        </div>
        <div className="landing-card-grid">
          {CARDS.map((card) => (
            <article key={card.title} className="landing-feature-card">
              <div className="landing-feature-icon">
                <img src={card.icon} alt="" aria-hidden />
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <div className="landing-feature-divider" />
              <div className="landing-checks mt-auto">
                {card.checks.map((check) => (
                  <CheckItem key={check}>{check}</CheckItem>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
