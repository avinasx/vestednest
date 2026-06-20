"use client";

import { useState } from "react";
import {
  PRIVACY_HERO,
  PRIVACY_NAV,
  PRIVACY_SECTIONS,
  type PrivacyBlock,
} from "@/lib/static-pages/privacy-content";

function renderBlock(block: PrivacyBlock, index: number) {
  switch (block.type) {
    case "paragraphs":
      return (
        <div key={index} className="fn-privacy-block">
          {block.items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      );
    case "list":
      return (
        <div key={index} className="fn-privacy-block">
          {block.intro ? <p className="fn-privacy-subhead">{block.intro}</p> : null}
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case "subsection":
      return (
        <div key={index} className="fn-privacy-block">
          <p className="fn-privacy-subhead">{block.title}</p>
          <p>{block.body}</p>
        </div>
      );
    case "subsections":
      return (
        <div key={index} className="fn-privacy-block">
          {block.items.map((item) => (
            <div key={item.title} className="fn-privacy-subsection">
              <p className="fn-privacy-subhead">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function FigmaPrivacyPage() {
  const [activeId, setActiveId] = useState(PRIVACY_NAV[0]?.id ?? "who-we-are");

  return (
    <>
      <section className="fn-hero">
        <div className="fn-hero-grid" aria-hidden />
        <div className="fn-inner fn-hero-inner">
          <div className="fn-badge">{PRIVACY_HERO.badge}</div>
          <h1 className="fn-hero-title">
            {PRIVACY_HERO.title} <em>{PRIVACY_HERO.titleAccent}</em>
          </h1>
          <p className="fn-hero-lead">{PRIVACY_HERO.lead}</p>
        </div>
      </section>

      <section className="fn-section">
        <div className="fn-inner fn-privacy-layout">
          <nav className="fn-privacy-sidebar" aria-label="Policy sections">
            {PRIVACY_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`fn-privacy-nav-item${activeId === item.id ? " is-active" : ""}`}
                onClick={() => setActiveId(item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="fn-privacy-body">
            {PRIVACY_SECTIONS.map((section, sectionIndex) => (
              <section key={section.id} id={section.id} className="fn-privacy-section">
                <h2>
                  {sectionIndex + 1}. {section.title}
                </h2>
                {section.blocks.map((block, i) => renderBlock(block, i))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
