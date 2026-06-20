"use client";

/* eslint-disable @next/next/no-img-element */
import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { ProductHeroAddressBar } from "@/components/figma-pages/shared/product-hero-address-bar";
import { imgTick3 } from "@/lib/figma/assets";
import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { getPageSection } from "@/lib/product-pages/get-section";

const hero = getPageSection(rentalLoansPage, "hero");
if (!hero || hero.type !== "hero") throw new Error("Rental loans hero missing");

export function RlHeroSection() {
  return (
    <section className="rl-hero">
      <FigmaHeroBackground variant="product" />
      <div className="rl-inner rl-hero-inner">
        {hero.badge ? <div className="rl-hero-badge">{hero.badge}</div> : null}
        <h1 className="rl-hero-title">
          {hero.title}
          <br />
          own through <em>{hero.titleAccent}</em>
        </h1>
        <p className="rl-hero-lead">{hero.lead}</p>

        <ProductHeroAddressBar
          variant="rental"
          tabLabel="Rental Loan Process"
          loanTypeLabel="Rental loan"
          placeholder="Drop a rental property address to get quoted..."
        />

        {hero.perks?.length ? (
          <div className="rl-hero-pills">
            {hero.perks.map((perk) => (
              <span key={perk} className="rl-hero-pill">
                <img src={imgTick3} alt="" aria-hidden />
                {perk}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
