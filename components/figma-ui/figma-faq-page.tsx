"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FAQ_CATEGORIES,
  FAQ_CTA,
  FAQ_HERO,
} from "@/lib/static-pages/faq-content";

const ALL_COUNT = FAQ_CATEGORIES.reduce((s, c) => s + c.count, 0);

export function FigmaFaqPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const visible = useMemo(() => {
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
    <>
      <section className="fn-hero">
        <div className="fn-hero-grid" aria-hidden />
        <div className="fn-inner fn-hero-inner">
          <div className="fn-badge">{FAQ_HERO.badge}</div>
          <h1 className="fn-hero-title">
            {FAQ_HERO.title} <em>{FAQ_HERO.titleAccent}</em>
          </h1>
          <p className="fn-hero-lead">{FAQ_HERO.lead}</p>
        </div>
      </section>

      <section className="fn-section">
        <div className="fn-inner faq-layout">
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
                <span className="faq-nav-count">{ALL_COUNT}+</span>
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
            {visible.map((category) => (
              <section key={category.id} id={category.id} className="faq-category">
                <div className="faq-category-head">
                  <span className="fn-label">{category.label}</span>
                  <p>{category.description}</p>
                </div>
                <div>
                  {category.questions.map((question) => {
                    const key = `${category.id}:${question}`;
                    const isOpen = openKey === key;
                    return (
                      <div key={key} className="fn-faq-item">
                        <button
                          type="button"
                          className="fn-faq-q"
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
                          <p className="fn-faq-a">
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

      <section className="fn-final-cta">
        <div className="fn-inner">
          <h2>
            {FAQ_CTA.title} <em>{FAQ_CTA.titleAccent}</em>
          </h2>
          <p className="fn-section-lead">{FAQ_CTA.lead}</p>
          <div className="faq-cta-actions">
            <Link href={`mailto:${FAQ_CTA.email}`} className="fn-cta-btn">
              Email Us
            </Link>
            <Link href={`tel:${FAQ_CTA.phone.replace(/\D/g, "")}`} className="fn-cta-btn">
              {FAQ_CTA.phone}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
