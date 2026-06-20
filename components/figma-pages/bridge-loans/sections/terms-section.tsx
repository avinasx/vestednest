/* eslint-disable @next/next/no-img-element */
import { BRIDGE_TERMS_ROWS } from "../content";
import { SectionHeader } from "../section-header";

export function BridgeTermsSection() {
  return (
    <section className="bl-section bl-section--page">
      <div className="bl-inner bl-text-center">
        <SectionHeader
          label="Bridge loan terms"
          title={
            <>
              Structure & <em>Pricing.</em>
            </>
          }
          lead="Interest-only. Short-term. Built to exit fast."
        />
      </div>
      <div className="bl-inner">
        <div className="bl-terms-table">
          <div className="bl-terms-head">
            <span>Parameter</span>
            <span>Range / Options</span>
            <span>Notes</span>
          </div>
          <div className="bl-terms-body">
            {BRIDGE_TERMS_ROWS.map((row, index) => (
              <div key={row.param} className={index % 2 === 1 ? "bl-terms-row bl-terms-row--alt" : "bl-terms-row"}>
                <span>{row.param}</span>
                <span>{row.range}</span>
                <span>{row.notes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
