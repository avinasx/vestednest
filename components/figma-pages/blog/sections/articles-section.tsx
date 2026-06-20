"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  type BlogArticle,
} from "@/lib/static-pages/blog-content";

function matchesCategory(article: BlogArticle, filter: string) {
  if (filter === "All") return true;
  if (filter === "Case studies") return article.category === "Case study";
  return article.category === filter;
}

export function BlogArticlesSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = useMemo(
    () => BLOG_ARTICLES.filter((article) => matchesCategory(article, activeCategory)),
    [activeCategory],
  );

  return (
    <section className="blog-page-articles" aria-label="Blog articles">
      <div className="blog-page-inner">
        <div className="blog-page-filters" role="tablist" aria-label="Blog categories">
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              className={`blog-page-filter${activeCategory === category ? " is-active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="blog-page-grid">
          {filtered.map((article) => (
            <article key={article.title} className="blog-page-card">
              <div className="blog-page-card-image-wrap">
                <img src={article.image} alt="" className="blog-page-card-image" />
              </div>
              <div className="blog-page-card-body">
                <div className="blog-page-label blog-page-label--compact">
                  <span className="blog-page-label-mark" aria-hidden />
                  <span>{article.category}</span>
                </div>
                <h2 className="blog-page-card-title">{article.title}</h2>
                <p className="blog-page-card-excerpt">{article.excerpt}</p>
                <div className="blog-page-meta">
                  <span className="blog-page-meta-author">By {article.author}</span>
                  <span className="blog-page-meta-dot" aria-hidden />
                  <span>{article.date}</span>
                  <span className="blog-page-meta-dot" aria-hidden />
                  <span>{article.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
