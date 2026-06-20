"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { dscrLoansPage } from "@/lib/product-pages/content/dscr-loans";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const faqSection = getPageSection(dscrLoansPage, "faq");
if (!faqSection || faqSection.type !== "faq") {
  throw new Error("DSCR FAQ section missing");
}

export function DscrFaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="dscr-faq">
      <div className="dscr-inner dscr-faq-head">
        <div className="dscr-label">
          <span className="dscr-label-dot" aria-hidden />
          {faqSection.label}
        </div>
        <h2 className="dscr-section-title">
          DSCR loan <em>FAQ.</em>
        </h2>
      </div>
      <div className="dscr-inner dscr-faq-list">
        {faqSection.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="dscr-faq-item">
              <button
                type="button"
                className="dscr-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
                <img
                  src={
                    isOpen
                      ? "/static-pages/faq/icon-accordion-open.svg"
                      : "/static-pages/faq/icon-accordion-closed.svg"
                  }
                  alt=""
                  aria-hidden
                />
              </button>
              {isOpen ? <p className="dscr-faq-a">{item.a}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
