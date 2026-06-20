"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { imgFrame2147235633 } from "@/lib/figma/assets";
import { BRIDGE_FAQ } from "../content";
import { SectionHeader } from "../section-header";

export function BridgeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bl-section bl-section--white">
      <div className="bl-inner bl-faq-layout">
        <SectionHeader
          align="left"
          label="Common questions"
          title={
            <>
              Bridge loan <em>FAQ.</em>
            </>
          }
        />
        <div className="bl-faq-list">
          {BRIDGE_FAQ.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.q} className={isOpen ? "bl-faq-item bl-faq-item--open" : "bl-faq-item"}>
                <button
                  type="button"
                  className="bl-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <img src={imgFrame2147235633} alt="" aria-hidden />
                </button>
                {isOpen ? <p className="bl-faq-a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
