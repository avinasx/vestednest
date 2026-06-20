"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { SectionLabel } from "@/components/landing/section-label";
import { StaticCta } from "@/components/static-pages/static-cta";
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  BLOG_CTA,
  BLOG_FEATURED,
  BLOG_NEWSLETTER,
} from "@/lib/static-pages/blog-content";

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="static-page blog-page">
      <section className="blog-featured">
        <div className="landing-section-inner blog-featured-grid">
          <div className="blog-featured-copy">
            <SectionLabel>{BLOG_FEATURED.tag}</SectionLabel>
            <h1 className="blog-featured-title">
              {BLOG_FEATURED.title} <em>{BLOG_FEATURED.titleAccent}</em>
            </h1>
            <p className="blog-featured-excerpt">{BLOG_FEATURED.excerpt}</p>
            <div className="blog-meta">
              <span className="blog-meta-author">By {BLOG_FEATURED.author}</span>
              <span className="blog-meta-dot" aria-hidden />
              <span>{BLOG_FEATURED.date}</span>
              <span className="blog-meta-dot" aria-hidden />
              <span>{BLOG_FEATURED.readTime}</span>
            </div>
          </div>
          <div className="blog-featured-image-wrap">
            <img src={BLOG_FEATURED.image} alt="" className="blog-featured-image" />
          </div>
        </div>
      </section>

      <section className="static-section">
        <div className="landing-section-inner">
          <div className="blog-filters" role="tablist" aria-label="Blog categories">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                className={`blog-filter${activeCategory === cat ? " is-active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="blog-grid">
            {filtered.map((article) => (
              <article key={article.title} className="blog-card">
                <div className="blog-card-image-wrap">
                  <img src={article.image} alt="" className="blog-card-image" />
                </div>
                <div className="blog-card-body">
                  <SectionLabel>{article.category}</SectionLabel>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <div className="blog-meta">
                    <span className="blog-meta-author">By {article.author}</span>
                    <span className="blog-meta-dot" aria-hidden />
                    <span>{article.date}</span>
                    <span className="blog-meta-dot" aria-hidden />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-newsletter">
        <div className="landing-section-inner blog-newsletter-inner">
          <p className="blog-newsletter-label">{BLOG_NEWSLETTER.label}</p>
          <h2>{BLOG_NEWSLETTER.title}</h2>
          <p>{BLOG_NEWSLETTER.lead}</p>
          <form className="blog-newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your@email.com" aria-label="Email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <StaticCta
        title={BLOG_CTA.title}
        titleAccent={BLOG_CTA.titleAccent}
        lead={BLOG_CTA.lead}
        perks={BLOG_CTA.perks}
      />
    </div>
  );
}
