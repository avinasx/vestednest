/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";
import { imgCheckmarkCircle02, imgSvg1 } from "@/lib/figma/assets";
import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(foreignNationalLoansPage, "cta");
if (!section || section.type !== "cta") throw new Error("Foreign national CTA missing");

export function FnlCtaSection() {
  return (
    <section className="fnl-section fnl-section--cta">
      <div className="fnl-inner fnl-cta-inner">
        <h2 className="fnl-cta-title">
          {section.title}{" "}
          {section.titleAccent ? <em>{section.titleAccent}</em> : null}
        </h2>
        {section.lead ? <p className="fnl-cta-lead">{section.lead}</p> : null}
        <NestChatLaunchButton className="figma-cta-btn">
          Start with an address
          <img src={imgSvg1} alt="" aria-hidden />
        </NestChatLaunchButton>
        {section.perks?.length ? (
          <ul className="fnl-cta-perks">
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
