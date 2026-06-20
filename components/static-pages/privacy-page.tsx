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
        <div key={index} className="privacy-block">
          {block.items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      );
    case "list":
      return (
        <div key={index} className="privacy-block">
          {block.intro ? <p className="privacy-subhead">{block.intro}</p> : null}
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case "subsection":
      return (
        <div key={index} className="privacy-block">
          <p className="privacy-subhead">{block.title}</p>
          <p>{block.body}</p>
        </div>
      );
    case "subsections":
      return (
        <div key={index} className="privacy-block">
          {block.items.map((item) => (
            <div key={item.title} className="privacy-subsection">
              <p className="privacy-subhead">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function PrivacyPage() {
  const [activeId, setActiveId] = useState(PRIVACY_NAV[0]?.id ?? "who-we-are");

  return (
    <div className="static-page privacy-page">
      <section className="static-hero static-hero--grid privacy-hero">
        <div className="static-hero-grid" aria-hidden />
        <div className="landing-section-inner static-hero-inner">
          <div className="landing-hero-badge">{PRIVACY_HERO.badge}</div>
          <h1 className="static-hero-title privacy-hero-title">
            {PRIVACY_HERO.title} <em>{PRIVACY_HERO.titleAccent}</em>
          </h1>
          <p className="static-hero-lead">{PRIVACY_HERO.lead}</p>
        </div>
      </section>

      <section className="static-section privacy-content-section">
        <div className="landing-section-inner privacy-layout">
          <nav className="privacy-sidebar" aria-label="Policy sections">
            {PRIVACY_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`privacy-nav-item${activeId === item.id ? " is-active" : ""}`}
                onClick={() => setActiveId(item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="privacy-body">
            {PRIVACY_SECTIONS.map((section, sectionIndex) => (
              <section key={section.id} id={section.id} className="privacy-section">
                <h2>
                  {sectionIndex + 1}. {section.title}
                </h2>
                {section.blocks.map((block, i) => renderBlock(block, i))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
