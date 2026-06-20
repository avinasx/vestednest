/* eslint-disable @next/next/no-img-element */
import { NestChatLaunchButton } from "@/components/figma-pages/shared/nest-chat-launch-button";

import { BLOG_CTA } from "@/lib/static-pages/blog-content";

export function BlogCtaSection() {
  return (
    <section className="blog-page-cta" aria-labelledby="blog-cta-title">
      <div className="blog-page-inner blog-page-cta-inner">
        <h2 id="blog-cta-title" className="blog-page-cta-title">
          {BLOG_CTA.title}{" "}
          <span className="blog-page-cta-accent">{BLOG_CTA.titleAccent}</span>
        </h2>
        <p className="blog-page-cta-lead">{BLOG_CTA.lead}</p>
        <NestChatLaunchButton className="figma-cta-btn">
          Start with an address
          <img src="/figma-assets/imgSvg.svg" alt="" aria-hidden />
        </NestChatLaunchButton>
        {BLOG_CTA.perks?.length ? (
          <div className="blog-page-cta-perks">
            {BLOG_CTA.perks.map((perk) => (
              <span key={perk} className="blog-page-cta-perk">
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
