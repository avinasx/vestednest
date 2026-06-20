"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { imgFrame2147235633 } from "@/lib/figma/assets";
import { rentalLoansPage } from "@/lib/product-pages/content/rental-loans";
import { SectionHeader } from "../section-header";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(rentalLoansPage, "faq");
if (!section || section.type !== "faq") throw new Error("Rental FAQ missing");

export function RlFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="rl-section rl-section--white">
      <div className="rl-inner rl-faq-layout">
        <SectionHeader
          align="left"
          label={section.label}
          title={
            <>
              Rental loan <em>FAQ.</em>
            </>
          }
        />
        <div className="rl-faq-list">
          {section.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className={isOpen ? "rl-faq-item rl-faq-item--open" : "rl-faq-item"}>
                <button
                  type="button"
                  className="rl-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <img src={imgFrame2147235633} alt="" aria-hidden />
                </button>
                {isOpen ? <p className="rl-faq-a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
