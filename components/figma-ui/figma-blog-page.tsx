"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  BLOG_CTA,
  BLOG_FEATURED,
  BLOG_NEWSLETTER,
} from "@/lib/static-pages/blog-content";

export function FigmaBlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <>
      <section className="fn-blog-featured">
        <div className="fn-inner fn-blog-featured-grid">
          <div>
            <span className="fn-label">{BLOG_FEATURED.tag}</span>
            <h1 className="fn-hero-title" style={{ marginTop: 16 }}>
              {BLOG_FEATURED.title} <em>{BLOG_FEATURED.titleAccent}</em>
            </h1>
            <p className="fn-hero-lead" style={{ textAlign: "left", margin: "16px 0 24px" }}>
              {BLOG_FEATURED.excerpt}
            </p>
            <div className="fn-blog-meta">
              <span className="fn-blog-meta-author">By {BLOG_FEATURED.author}</span>
              <span className="fn-blog-meta-dot" aria-hidden />
              <span>{BLOG_FEATURED.date}</span>
              <span className="fn-blog-meta-dot" aria-hidden />
              <span>{BLOG_FEATURED.readTime}</span>
            </div>
          </div>
          <div className="fn-blog-featured-image-wrap">
            <img src={BLOG_FEATURED.image} alt="" className="fn-blog-featured-image" />
          </div>
        </div>
      </section>

      <section className="fn-section fn-section--muted">
        <div className="fn-inner">
          <div className="fn-blog-filters" role="tablist" aria-label="Blog categories">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`fn-blog-filter${activeCategory === cat ? " is-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="fn-blog-grid">
            {filtered.map((article) => (
              <article key={article.title} className="fn-blog-card">
                <div className="fn-blog-card-image-wrap">
                  <img src={article.image} alt="" className="fn-blog-card-image" />
                </div>
                <div className="fn-blog-card-body">
                  <span className="fn-label">{article.category}</span>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <div className="fn-blog-meta">
                    <span className="fn-blog-meta-author">By {article.author}</span>
                    <span className="fn-blog-meta-dot" aria-hidden />
                    <span>{article.date}</span>
                    <span className="fn-blog-meta-dot" aria-hidden />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fn-blog-newsletter">
        <div className="fn-inner fn-blog-newsletter-inner">
          <p className="fn-blog-newsletter-label">{BLOG_NEWSLETTER.label}</p>
          <h2>{BLOG_NEWSLETTER.title}</h2>
          <p>{BLOG_NEWSLETTER.lead}</p>
          <form className="fn-blog-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your@email.com" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <section className="fn-final-cta">
        <div className="fn-inner">
          <h2>
            {BLOG_CTA.title} <em>{BLOG_CTA.titleAccent}</em>
          </h2>
          <p className="fn-section-lead">{BLOG_CTA.lead}</p>
          <Link href="/" className="fn-cta-btn">
            Start with an address →
          </Link>
          {BLOG_CTA.perks?.length ? (
            <div className="fn-perks mt-6">
              {BLOG_CTA.perks.map((perk) => (
                <span key={perk} className="fn-perk">
                  <img src="/figma-assets/imgCheckmarkCircle02.svg" alt="" aria-hidden />
                  {perk}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
