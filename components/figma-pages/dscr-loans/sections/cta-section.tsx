/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";
import { dscrLoansPage } from "@/lib/product-pages/content/dscr-loans";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const ctaSection = getPageSection(dscrLoansPage, "cta");
if (!ctaSection || ctaSection.type !== "cta") {
  throw new Error("DSCR CTA section missing");
}

export function DscrCtaSection() {
  return (
    <section className="dscr-cta">
      <div className="dscr-inner dscr-cta-inner">
        <h2>{ctaSection.title}</h2>
        {ctaSection.lead ? <p>{ctaSection.lead}</p> : null}
        <NestChatLaunchButton className="figma-cta-btn">Start with an address →</NestChatLaunchButton>
        {ctaSection.perks?.length ? (
          <div className="dscr-cta-perks">
            {ctaSection.perks.map((perk) => (
              <span key={perk}>
                <img src="/figma-assets/imgCheckmarkCircle02.svg" alt="" aria-hidden />
                {perk}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
