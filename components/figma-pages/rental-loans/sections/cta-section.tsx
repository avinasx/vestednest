/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";
import { imgCheckmarkCircle02, imgSvg } from "@/lib/figma/assets";
import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(rentalLoansPage, "cta");
if (!section || section.type !== "cta") throw new Error("Rental CTA missing");

export function RlCtaSection() {
  return (
    <section className="rl-section rl-section--cta">
      <div className="rl-inner rl-cta-inner">
        <h2 className="rl-cta-title">
          {section.title}{" "}
          {section.titleAccent ? <em>{section.titleAccent}</em> : null}
        </h2>
        {section.lead ? <p className="rl-cta-lead">{section.lead}</p> : null}
        <NestChatLaunchButton className="figma-cta-btn">
          Start with an address
          <img src={imgSvg} alt="" aria-hidden />
        </NestChatLaunchButton>
        {section.perks?.length ? (
          <ul className="rl-cta-perks">
            {section.perks.map((perk) => (
              <li key={perk}>
                <img src={imgCheckmarkCircle02} alt="" aria-hidden />
                {perk}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
