"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FAQ_CATEGORIES } from "@/lib/static-pages/content/faq";

export function FaqPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0]?.id ?? "");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  const visibleCategories = query ? filtered : filtered.filter((c) => c.id === activeCategory);
  const sidebarCategories = query ? filtered : FAQ_CATEGORIES;

  return (
    <>
      <section className="static-hero static-hero--faq">
        <div className="product-hero-grid" aria-hidden />
        <div className="landing-section-inner static-hero-inner text-center">
          <div className="landing-hero-badge">Buy and refinance</div>
          <h1 className="static-hero-title">
            Frequently asked <em>questions</em>
          </h1>
          <p className="static-hero-lead static-hero-lead--center">
            Find clear, detailed answers to your questions about our loan programs, requirements,
            and process.
          </p>
        </div>
      </section>

      <section className="static-section static-faq-layout-wrap">
        <div className="landing-section-inner static-faq-layout">
          <aside className="static-faq-sidebar">
            <label className="static-faq-search">
              <span className="sr-only">Search FAQs</span>
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <nav aria-label="FAQ categories">
              <ul>
                {sidebarCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      className={`static-faq-cat${!query && activeCategory === cat.id ? " is-active" : ""}`}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setQuery("");
                      }}
                    >
                      <span>{cat.label}</span>
                      <span className="static-faq-count">{String(cat.count).padStart(2, "0")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="static-faq-content">
            {visibleCategories.map((cat) => (
              <div key={cat.id} className="static-faq-group">
                <div className="static-faq-group-head">
                  <SectionLabelInline>{cat.label}</SectionLabelInline>
                  <p>{cat.description}</p>
                </div>
                <div className="product-faq">
                  {cat.items.map((item) => {
                    const key = `${cat.id}:${item.q}`;
                    const isOpen = openKey === key;
                    return (
                      <div key={key} className={`product-faq-item${isOpen ? " is-open" : ""}`}>
                        <button
                          type="button"
                          className="product-faq-q"
                          aria-expanded={isOpen}
                          onClick={() => setOpenKey(isOpen ? null : key)}
                        >
                          {item.q}
                          <span className="product-faq-icon" aria-hidden>
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>
                        {isOpen ? <p className="product-faq-a">{item.a}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="static-section static-section--muted static-faq-cta">
        <div className="landing-section-inner text-center">
          <h2 className="product-section-title">
            Still have a question? <em>We pick up the phone.</em>
          </h2>
          <p className="landing-section-lead">
            Enjoy personalized service and direct access — no phone tags, just solutions.
          </p>
          <div className="static-faq-cta-actions">
            <Link href="/" className="landing-final-cta-btn">
              Start with an address
            </Link>
            <a href="tel:+15166619018" className="static-contact-card">
              +1 (516) 661-9018
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionLabelInline({ children }: { children: React.ReactNode }) {
  return (
    <p className="landing-section-label">
      <span className="landing-section-label-dot" aria-hidden />
      {children}
    </p>
  );
}
