"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { FAQ_CATEGORIES, FAQ_CTA } from "@/lib/static-pages/faq-content";
import { FAQ_NAV_ICONS } from "../faq-nav-icons";

const ALL_COUNT = FAQ_CATEGORIES.reduce((sum, category) => sum + category.count, 0);

export function FaqContentSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const visibleCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return activeCategory === "all"
        ? FAQ_CATEGORIES
        : FAQ_CATEGORIES.filter((category) => category.id === activeCategory);
    }

    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      questions: category.questions.filter((question) => question.toLowerCase().includes(query)),
    })).filter((category) => category.questions.length > 0);
  }, [activeCategory, search]);

  const navItems = [
    { id: "all", label: "All questions", count: `${ALL_COUNT}+`, icon: FAQ_NAV_ICONS.all },
    ...FAQ_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.label,
      count: String(category.count),
      icon: FAQ_NAV_ICONS[category.id],
    })),
  ];

  return (
    <section className="faq-page-body">
      <div className="faq-page-inner faq-page-layout">
        <aside className="faq-page-sidebar">
          <label className="faq-page-search">
            <img src="/static-pages/faq/icon-search.svg" alt="" aria-hidden />
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search FAQ"
            />
          </label>

          <div className="faq-page-nav-wrap">
            <nav className="faq-page-nav" aria-label="FAQ categories">
              {navItems.map((item) => {
                const isActive = activeCategory === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`faq-page-nav-item${isActive ? " is-active" : ""}`}
                    onClick={() => setActiveCategory(item.id)}
                  >
                    {isActive ? <span className="faq-page-nav-rail" aria-hidden /> : null}
                    <span className="faq-page-nav-content">
                      {item.icon ? (
                        <img src={item.icon} alt="" aria-hidden className="faq-page-nav-icon" />
                      ) : null}
                      <span className="faq-page-nav-label">{item.label}</span>
                      <span className="faq-page-nav-count">{item.count}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="faq-page-main">
          {visibleCategories.map((category) => (
            <section key={category.id} id={category.id} className="faq-page-category">
              <header className="faq-page-category-head">
                <h2 className="faq-page-category-title">{category.label}</h2>
                <p className="faq-page-category-desc">{category.description}</p>
              </header>

              <div className="faq-page-accordion">
                {category.questions.map((question) => {
                  const key = `${category.id}:${question}`;
                  const isOpen = openKey === key;

                  return (
                    <div key={key} className="faq-page-accordion-item">
                      <button
                        type="button"
                        className="faq-page-accordion-trigger"
                        aria-expanded={isOpen}
                        onClick={() => setOpenKey(isOpen ? null : key)}
                      >
                        <span>{question}</span>
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
                        <p className="faq-page-accordion-panel">
                          Email{" "}
                          <a href={`mailto:${FAQ_CTA.email}`}>{FAQ_CTA.email}</a> or call{" "}
                          <a href={`tel:${FAQ_CTA.phone.replace(/\D/g, "")}`}>{FAQ_CTA.phone}</a> —
                          we&apos;ll walk through your specific deal.
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
  );
}
