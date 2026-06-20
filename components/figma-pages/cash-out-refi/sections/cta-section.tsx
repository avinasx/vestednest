/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";
import { imgCheckmarkCircle02, imgSvg } from "@/lib/figma/assets";
import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(cashOutRefiPage, "cta");

export function CorCtaSection() {
  return (
    <section className="cor-section cor-section--cta">
      <div className="cor-inner cor-cta-inner">
        <h2 className="cor-cta-title">{section.title}</h2>
        {section.lead ? <p className="cor-cta-lead">{section.lead}</p> : null}
        <NestChatLaunchButton className="figma-cta-btn">
          Start with an address
          <img src={imgSvg} alt="" aria-hidden />
        </NestChatLaunchButton>
        {section.perks?.length ? (
          <ul className="cor-cta-perks">
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
