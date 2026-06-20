"use client";

import { useState } from "react";
import {
  PRIVACY_NAV,
  PRIVACY_SECTIONS,
  type PrivacyBlock,
} from "@/lib/static-pages/privacy-content";

function renderBlock(block: PrivacyBlock, index: number) {
  switch (block.type) {
    case "paragraphs":
      return (
        <div key={index} className="privacy-page-block">
          {block.items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      );
    case "list":
      return (
        <div key={index} className="privacy-page-block">
          {block.intro ? <p className="privacy-page-subhead">{block.intro}</p> : null}
          <ul>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    case "subsection":
      return (
        <div key={index} className="privacy-page-block">
          <p className="privacy-page-subhead">{block.title}</p>
          <p>{block.body}</p>
        </div>
      );
    case "subsections":
      return (
        <div key={index} className="privacy-page-block">
          {block.items.map((item) => (
            <div key={item.title} className="privacy-page-subsection">
              <p className="privacy-page-subhead">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function PrivacyContentSection() {
  const [activeId, setActiveId] = useState(PRIVACY_NAV[0]?.id ?? "who-we-are");

  return (
    <section className="privacy-page-body">
      <div className="privacy-page-inner privacy-page-layout">
        <nav className="privacy-page-sidebar" aria-label="Policy sections">
          {PRIVACY_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`privacy-page-nav-item${activeId === item.id ? " is-active" : ""}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="privacy-page-nav-rail" aria-hidden />
              <span className="privacy-page-nav-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="privacy-page-main">
          {PRIVACY_SECTIONS.map((section, sectionIndex) => (
            <section key={section.id} id={section.id} className="privacy-page-section">
              <h2 className="privacy-page-section-title">
                {sectionIndex + 1}. {section.title}
              </h2>
              {section.blocks.map((block, index) => renderBlock(block, index))}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
