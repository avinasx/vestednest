/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CheckItem } from "@/components/landing/check-item";

type StaticCtaProps = {
  title: string;
  titleAccent?: string;
  lead: string;
  perks?: string[];
  buttonLabel?: string;
  buttonHref?: string;
};

export function StaticCta({
  title,
  titleAccent,
  lead,
  perks = [],
  buttonLabel = "Start with an address",
  buttonHref = "/",
}: StaticCtaProps) {
  return (
    <section className="static-cta">
      <div className="landing-section-inner static-cta-inner">
        <h2>
          {title}
          {titleAccent ? (
            <>
              {" "}
              <em>{titleAccent}</em>
            </>
          ) : null}
        </h2>
        <p className="static-cta-lead">{lead}</p>
        <Link href={buttonHref} className="landing-final-cta-btn">
          {buttonLabel}
          <img src="/landing/icon-arrow-right.svg" alt="" aria-hidden />
        </Link>
        {perks.length ? (
          <div className="landing-final-cta-perks">
            {perks.map((perk) => (
              <CheckItem key={perk} light>
                {perk}
              </CheckItem>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
