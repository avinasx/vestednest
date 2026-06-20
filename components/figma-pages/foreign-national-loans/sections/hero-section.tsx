"use client";

import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { ProductHeroAddressBar } from "@/components/figma-pages/shared/product-hero-address-bar";
import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { getPageSection } from "@/lib/product-pages/get-section";

const hero = getPageSection(foreignNationalLoansPage, "hero");
if (!hero || hero.type !== "hero") throw new Error("Foreign national hero missing");

export function FnlHeroSection() {
  return (
    <section className="fnl-hero">
      <FigmaHeroBackground variant="product" />
      <div className="fnl-inner fnl-hero-inner">
        {hero.badge ? <div className="fnl-hero-badge">{hero.badge}</div> : null}
        <h1 className="fnl-hero-title">
          No U.S. <strong>credit</strong>. No <strong>SSN</strong>.
          <br />
          <em>{hero.titleAccent}</em>
        </h1>
        <p className="fnl-hero-lead">{hero.lead}</p>

        <ProductHeroAddressBar
          variant="fnl"
          tabLabel="Foreign national loans"
          loanTypeLabel="Foreign national loans"
          placeholder="Drop a U.S. property address — no SSN required..."
        />

        {hero.perks?.length ? (
          <div className="fnl-hero-pills">
            {hero.perks.map((pill) => (
              <span key={pill} className="fnl-hero-pill">
                {pill}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
