/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";
import { imgCheckmarkCircle02, imgSvg } from "@/lib/figma/assets";
import { BRIDGE_CTA } from "../content";

export function BridgeCtaSection() {
  return (
    <section className="bl-section bl-section--cta">
      <div className="bl-inner bl-cta-inner">
        <h2 className="bl-cta-title">
          Get your bridge quote. <em>Same day.</em>
        </h2>
        <p className="bl-cta-lead">
          {BRIDGE_CTA.lead.split("\n").map((line, i) => (
            <span key={line}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </p>
        <NestChatLaunchButton className="figma-cta-btn">
          Start with an address
          <img src={imgSvg} alt="" aria-hidden />
        </NestChatLaunchButton>
        <ul className="bl-cta-perks">
          {BRIDGE_CTA.perks?.map((perk) => (
            <li key={perk}>
              <img src={imgCheckmarkCircle02} alt="" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
