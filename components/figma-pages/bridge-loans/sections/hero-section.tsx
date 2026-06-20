"use client";

import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { ProductHeroAddressBar } from "@/components/figma-pages/shared/product-hero-address-bar";
import { BRIDGE_HERO } from "../content";

export function BridgeHeroSection() {
  return (
    <section className="bl-hero">
      <FigmaHeroBackground variant="product" />
      <div className="bl-inner bl-hero-inner">
        <div className="bl-hero-badge">{BRIDGE_HERO.badge}</div>
        <h1 className="bl-hero-title">
          {BRIDGE_HERO.title}
          <br />
          <strong>{BRIDGE_HERO.titleAccent}</strong>
        </h1>
        <p className="bl-hero-lead">{BRIDGE_HERO.lead}</p>

        <ProductHeroAddressBar
          variant="bridge"
          tabLabel="Bridge Loans"
          loanTypeLabel="Home loan"
          placeholder="Drop an address, or ask — e.g. 142 Oak Ridge Dr, Atlanta GA 30315"
        />

        <div className="bl-hero-pills">
          {(BRIDGE_HERO.perks ?? []).map((pill) => (
            <span key={pill} className="bl-hero-pill">
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
