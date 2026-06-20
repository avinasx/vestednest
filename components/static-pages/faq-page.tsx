"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionLabel } from "@/components/landing/section-label";
import {
  FAQ_CATEGORIES,
  FAQ_CTA,
  FAQ_HERO,
} from "@/lib/static-pages/faq-content";

const ALL_QUESTIONS_COUNT = FAQ_CATEGORIES.reduce((sum, c) => sum + c.count, 0);

export function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const visibleCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return activeCategory === "all"
        ? FAQ_CATEGORIES
        : FAQ_CATEGORIES.filter((c) => c.id === activeCategory);
    }
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      questions: cat.questions.filter((question) => question.toLowerCase().includes(q)),
    })).filter((cat) => cat.questions.length > 0);
  }, [activeCategory, search]);

  return (
    <div className="static-page faq-page">
      <section className="static-hero static-hero--grid">
        <div className="static-hero-grid" aria-hidden />
        <div className="landing-section-inner static-hero-inner">
          <div className="landing-hero-badge">{FAQ_HERO.badge}</div>
          <h1 className="static-hero-title">
            {FAQ_HERO.title} <em>{FAQ_HERO.titleAccent}</em>
          </h1>
          <p className="static-hero-lead">{FAQ_HERO.lead}</p>
        </div>
      </section>

      <section className="static-section faq-content-section">
        <div className="landing-section-inner faq-layout">
          <aside className="faq-sidebar">
            <label className="faq-search">
              <img src="/static-pages/faq/icon-search.svg" alt="" aria-hidden />
              <input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search FAQ"
              />
            </label>
            <nav className="faq-nav" aria-label="FAQ categories">
              <button
                type="button"
                className={`faq-nav-item${activeCategory === "all" ? " is-active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                <span>All questions</span>
                <span className="faq-nav-count">{ALL_QUESTIONS_COUNT}+</span>
              </button>
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`faq-nav-item${activeCategory === cat.id ? " is-active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.label}</span>
                  <span className="faq-nav-count">{cat.count}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="faq-main">
            {visibleCategories.map((category) => (
              <section key={category.id} id={category.id} className="faq-category">
                <div className="faq-category-head">
                  <SectionLabel>{category.label}</SectionLabel>
                  <p>{category.description}</p>
                </div>
                <div className="faq-accordion">
                  {category.questions.map((question) => {
                    const key = `${category.id}:${question}`;
                    const isOpen = openKey === key;
                    return (
                      <div key={key} className={`faq-item${isOpen ? " is-open" : ""}`}>
                        <button
                          type="button"
                          className="faq-question"
                          aria-expanded={isOpen}
                          onClick={() => setOpenKey(isOpen ? null : key)}
                        >
                          {question}
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
                        {isOpen ? (
                          <p className="faq-answer">
                            Email{" "}
                            <a href={`mailto:${FAQ_CTA.email}`}>{FAQ_CTA.email}</a> or call{" "}
                            <a href={`tel:${FAQ_CTA.phone.replace(/\D/g, "")}`}>{FAQ_CTA.phone}</a>{" "}
                            — we&apos;ll walk through your specific deal.
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="static-cta faq-cta">
        <div className="landing-section-inner static-cta-inner">
          <h2>
            {FAQ_CTA.title} <em>{FAQ_CTA.titleAccent}</em>
          </h2>
          <p className="static-cta-lead">{FAQ_CTA.lead}</p>
          <div className="faq-cta-actions">
            <a href={`mailto:${FAQ_CTA.email}`} className="landing-final-cta-btn">
              Email Us
            </a>
            <a href={`tel:${FAQ_CTA.phone.replace(/\D/g, "")}`} className="landing-final-cta-btn">
              {FAQ_CTA.phone}
            </a>
            <Link href="/" className="faq-cta-link">
              Start with an address →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
