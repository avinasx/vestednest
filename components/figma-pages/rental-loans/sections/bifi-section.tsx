/* eslint-disable @next/next/no-img-element */
import { imgIcComplete02HandoffsBg1, imgLine636, imgTick02 } from "@/lib/figma/assets";
import { SectionHeader } from "../section-header";

const BIFI_PERKS = [
  "Minimum 5 properties in the portfolio",
  "Blended DSCR across all assets",
  "Single servicing, single point of contact",
  "Release provisions to sell individual properties",
];

const PORTFOLIO_ROWS = [
  { label: "Loan range", value: "$1,200,000" },
  { label: "Blanket loan (70% LTV)", value: "$840,000" },
  { label: "Combined monthly rent", value: "$8,750" },
  { label: "Blended PITIA", value: "$6,210" },
  { label: "Blended DSCR", value: "1.41x ✓", highlight: true },
];

export function RlBifiSection() {
  return (
    <section className="rl-section rl-section--cream rl-bifi-section">
      <img src={imgIcComplete02HandoffsBg1} alt="" aria-hidden className="rl-bifi-bg" />
      <div className="rl-inner rl-bifi-layout">
        <div className="rl-bifi-copy">
          <SectionHeader
            align="left"
            label="Advanced product"
            title={
              <>
                BIFI add-on.
                <br />
                <em>Blanket Investor</em>
                <br />
                <em>Financing.</em>
              </>
            }
          />
          <p className="rl-bifi-lead">
            For operators with 5 or more properties, BIFI lets you finance them under a single blanket loan
            instead of managing individual mortgages on each asset.
          </p>
          <p className="rl-bifi-lead">
            One loan, one payment, one lender relationship. The blended DSCR across the portfolio typically
            qualifies more easily than individual properties, especially if some properties are in lease-up.
          </p>
          <ul className="rl-bifi-perks">
            {BIFI_PERKS.map((perk) => (
              <li key={perk}>
                <img src={imgTick02} alt="" aria-hidden />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <aside className="rl-bifi-card">
          <p className="rl-bifi-card-label">Portfolio math example</p>
          <h3 className="rl-bifi-card-title">5 SFRs in Memphis, TN</h3>
          <div className="rl-bifi-card-table">
            {PORTFOLIO_ROWS.map((row) => (
              <div key={row.label} className="rl-bifi-card-row">
                <span>{row.label}</span>
                <strong className={row.highlight ? "rl-bifi-card-row--highlight" : undefined}>{row.value}</strong>
                <img src={imgLine636} alt="" aria-hidden className="rl-bifi-card-divider" />
              </div>
            ))}
          </div>
          <p className="rl-bifi-card-foot">
            Individual properties ranged from 1.08x to 1.62x. Blended qualification allows weaker properties to
            ride on stronger ones.
          </p>
        </aside>
      </div>
    </section>
  );
}
