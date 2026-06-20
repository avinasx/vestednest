"use client";

import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { ProductHeroAddressBar } from "@/components/figma-pages/shared/product-hero-address-bar";
import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { getPageSection } from "@/lib/product-pages/get-section";

const hero = getPageSection(cashOutRefiPage, "hero");
if (!hero || hero.type !== "hero") {
  throw new Error("Cash-out refi hero section missing");
}

export function CorHeroSection() {
  return (
    <section className="cor-hero">
      <FigmaHeroBackground variant="product" />
      <div className="cor-inner cor-hero-inner">
        {hero.badge ? <div className="cor-hero-badge">{hero.badge}</div> : null}
        <h1 className="cor-hero-title">
          {hero.title}
          {hero.titleAccent ? (
            <>
              <br />
              <em>{hero.titleAccent}</em>
            </>
          ) : null}
        </h1>
        <p className="cor-hero-lead">{hero.lead}</p>

        <ProductHeroAddressBar
          variant="cor"
          tabLabel="Cash-Out Refi"
          loanTypeLabel="Home loan"
          placeholder="Drop an address, or ask — e.g. 142 Oak Ridge Dr, Atlanta GA 30315"
        />

        {hero.perks?.length ? (
          <div className="cor-hero-pills">
            {hero.perks.map((pill) => (
              <span key={pill} className="cor-hero-pill">
                {pill}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
