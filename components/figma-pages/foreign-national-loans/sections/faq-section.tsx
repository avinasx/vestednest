"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { imgFrame2147235633 } from "@/lib/figma/assets";
import { foreignNationalLoansPage } from "@/lib/product-pages/content/foreign-national-loans";
import { SectionHeader } from "../section-header";
import { getPageSection, findPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(foreignNationalLoansPage, "faq");
if (!section || section.type !== "faq") throw new Error("Foreign national FAQ missing");

export function FnlFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="fnl-section fnl-section--white">
      <div className="fnl-inner fnl-faq-layout">
        <SectionHeader
          align="left"
          label={section.label}
          title={
            <>
              Foreign national <em>FAQ.</em>
            </>
          }
        />
        <div className="fnl-faq-list">
          {section.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className={isOpen ? "fnl-faq-item fnl-faq-item--open" : "fnl-faq-item"}>
                <button
                  type="button"
                  className="fnl-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <img src={imgFrame2147235633} alt="" aria-hidden />
                </button>
                {isOpen ? <p className="fnl-faq-a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
