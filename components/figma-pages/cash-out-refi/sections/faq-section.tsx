"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { imgFrame2147235633 } from "@/lib/figma/assets";
import { cashOutRefiPage } from "@/lib/product-pages/content/cash-out-refi";
import { SectionHeader } from "../section-header";
import { getPageSection } from "@/lib/product-pages/get-section";

const section = getPageSection(cashOutRefiPage, "faq");

export function CorFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="cor-section cor-section--white">
      <div className="cor-inner cor-faq-layout">
        <SectionHeader
          align="left"
          label={section.label}
          title={
            <>
              Cash-out refi <em>FAQ.</em>
            </>
          }
        />
        <div className="cor-faq-list">
          {section.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className={isOpen ? "cor-faq-item cor-faq-item--open" : "cor-faq-item"}>
                <button
                  type="button"
                  className="cor-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <img src={imgFrame2147235633} alt="" aria-hidden />
                </button>
                {isOpen ? <p className="cor-faq-a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
