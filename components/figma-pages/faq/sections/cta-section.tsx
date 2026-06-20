/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { FAQ_CTA } from "@/lib/static-pages/faq-content";

export function FaqCtaSection() {
  const phoneHref = `tel:${FAQ_CTA.phone.replace(/\D/g, "")}`;

  return (
    <section className="faq-page-cta" aria-labelledby="faq-page-cta-title">
      <div className="faq-page-inner faq-page-cta-inner">
        <h2 id="faq-page-cta-title" className="faq-page-cta-title">
          {FAQ_CTA.title}{" "}
          <span className="faq-page-cta-accent">{FAQ_CTA.titleAccent}</span>
        </h2>
        <p className="faq-page-cta-lead">{FAQ_CTA.lead}</p>
        <div className="faq-page-cta-actions">
          <Link href={`mailto:${FAQ_CTA.email}`} className="faq-page-cta-btn">
            <img src="/figma-assets/imgMail01.svg" alt="" aria-hidden />
            Email Us
          </Link>
          <Link href={phoneHref} className="faq-page-cta-btn">
            <img src="/figma-assets/imgCall.svg" alt="" aria-hidden />
            {FAQ_CTA.phone}
          </Link>
        </div>
      </div>
    </section>
  );
}
