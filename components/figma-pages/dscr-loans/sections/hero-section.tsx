"use client";

/* eslint-disable @next/next/no-img-element */
import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { ProductHeroAddressBar } from "@/components/figma-pages/shared/product-hero-address-bar";

export function DscrHeroSection() {
  return (
    <section className="dscr-hero">
      <FigmaHeroBackground variant="product" />
      <div className="dscr-inner dscr-hero-inner">
        <div className="dscr-hero-badge">NOW FUNDING IN 38 STATES</div>
        <h1 className="dscr-hero-title">
          The <strong>loan</strong> that reads
          <br />
          the rent roll, <em>not your W2.</em>
        </h1>
        <p className="dscr-hero-lead">
          DSCR loans let the property qualify itself. No income docs, no DTI, no employment check — just
          the cash flow. Drop an address and see your rate in 60 seconds.
        </p>

        <ProductHeroAddressBar
          variant="dscr"
          tabLabel="DSCR Loan Process"
          loanTypeLabel="DSCR Loan"
          placeholder="Drop an address, or ask — e.g. I want a DSCR quote on 142 Oak Ridge Dr"
        />

        <div className="dscr-hero-pills">
          {["No hard pull", "No W2", "No DTI", "60s to a term sheet"].map((pill) => (
            <span key={pill} className="dscr-hero-pill">
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
