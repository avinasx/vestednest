/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";
import { ABOUT_CTA } from "@/lib/static-pages/about-content";

export function AboutCtaSection() {
  return (
    <section className="about-page-cta" aria-labelledby="about-cta-title">
      <div className="about-page-inner about-page-cta-inner">
        <h2 id="about-cta-title" className="about-page-cta-title">
          {ABOUT_CTA.title}{" "}
          <span className="about-page-cta-accent">{ABOUT_CTA.titleAccent}</span>
        </h2>
        <p className="about-page-cta-lead">{ABOUT_CTA.lead}</p>
        <NestChatLaunchButton className="figma-cta-btn">
          Start with an address →
        </NestChatLaunchButton>
        {ABOUT_CTA.perks?.length ? (
          <div className="about-page-cta-perks">
            {ABOUT_CTA.perks.map((perk) => (
              <span key={perk} className="about-page-cta-perk">
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
