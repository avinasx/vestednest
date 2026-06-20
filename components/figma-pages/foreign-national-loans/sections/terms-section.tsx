/* eslint-disable @next/next/no-img-element */
import { imgIcComplete02HandoffsBg1, imgLine636 } from "@/lib/figma/assets";
import { SectionHeader } from "../section-header";

const TERMS_ROWS = [
  { label: "Max LTV", value: "Up to 70%", note: "(vs. 80% domestic)" },
  { label: "Rate premium", value: "+0.5% to +1.0% vs. domestic" },
  { label: "DSCR minimum", value: "1.0x" },
  { label: "Loan amounts", value: "$150K – $3M" },
  { label: "Loan terms", value: "30yr fixed | 5/1 ARM | 7/1 ARM" },
  { label: "Entity required", value: "U.S.-registered LLC" },
  { label: "Credit check", value: "No U.S. credit required" },
  { label: "Close remotely", value: "Yes — wire + e-sign" },
];

const TIMELINE_STEPS = [
  {
    time: "Day 1–3",
    body: "Form LLC online (Delaware or Wyoming). Receive Articles of Organization.",
  },
  {
    time: "Day 3–10",
    body: "Apply for EIN online via IRS. International applicants: ~7 days. Can call in if urgent.",
  },
  {
    time: "Day 1–21",
    body: "Apply for ITIN if you don't have one. This takes longer — start early.",
  },
  {
    time: "Ready",
    body: "Drop an address, get quoted, and start the process.",
  },
];

export function FnlTermsSection() {
  return (
    <section className="fnl-section fnl-section--cream fnl-llc-section">
      <img src={imgIcComplete02HandoffsBg1} alt="" aria-hidden className="fnl-llc-bg" />
      <div className="fnl-inner fnl-text-center fnl-llc-header">
        <SectionHeader
          label="The LLC requirement"
          title={
            <>
              Why we lend to the LLC, not <em>the person.</em>
            </>
          }
        />
        <div className="fnl-llc-intro">
          <p>
            DSCR is a business-purpose loan. The borrower is your U.S. entity — not you personally. This is good
            for you: it means your personal foreign credit profile is irrelevant to the underwrite.
          </p>
          <p>
            The LLC also provides asset protection: a lawsuit against the property can&apos;t pierce the entity wall
            to reach your personal assets or assets in other entities.
          </p>
        </div>
      </div>

      <div className="fnl-inner fnl-llc-layout">
        <div className="fnl-llc-timeline-wrap">
          <h3 className="fnl-llc-timeline-title">Timeline to get set up</h3>
          <div className="fnl-llc-timeline-box">
            {TIMELINE_STEPS.map((step) => (
              <div key={step.time} className="fnl-llc-timeline-step">
                <strong>{step.time}</strong>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
          <div className="fnl-llc-rate-note">
            <strong>On the rate premium:</strong> Foreign national DSCR carries a slightly higher rate because the
            investor risk profile is different — no U.S. recourse credit, LLC-only structure, international wire
            exposure. We&apos;re honest about this in the quote rather than burying it in the footnotes.
          </div>
        </div>

        <div className="fnl-llc-terms-wrap">
          <h3 className="fnl-llc-terms-title">Rates &amp; terms for foreign nationals</h3>
          <div className="fnl-llc-terms-card">
            <div className="fnl-llc-terms-head">
              <span>Parameter</span>
              <span>Foreign National DSCR</span>
            </div>
            <div className="fnl-llc-terms-body">
              {TERMS_ROWS.map((row) => (
                <div key={row.label} className="fnl-llc-terms-row">
                  <span>{row.label}</span>
                  <strong>
                    {row.value}
                    {row.note ? <small>{row.note}</small> : null}
                  </strong>
                  <img src={imgLine636} alt="" aria-hidden className="fnl-llc-terms-divider" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
