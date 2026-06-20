/* eslint-disable @next/next/no-img-element */
import { FigmaHeroBackground } from "@/components/figma-pages/shared/figma-hero-background";
import { BLOG_FEATURED } from "@/lib/static-pages/blog-content";

export function BlogFeaturedSection() {
  return (
    <section className="blog-page-featured" aria-labelledby="blog-featured-title">
      <FigmaHeroBackground variant="content" />
      <div className="blog-page-inner blog-page-featured-grid">
        <div className="blog-page-featured-copy">
          <div className="blog-page-label">
            <span className="blog-page-label-mark" aria-hidden />
            <span>{BLOG_FEATURED.tag}</span>
          </div>
          <h1 id="blog-featured-title" className="blog-page-featured-title">
            {BLOG_FEATURED.title}{" "}
            <span className="blog-page-featured-accent">{BLOG_FEATURED.titleAccent}</span>
          </h1>
          <p className="blog-page-featured-excerpt">{BLOG_FEATURED.excerpt}</p>
          <div className="blog-page-meta">
            <span className="blog-page-meta-author">By {BLOG_FEATURED.author}</span>
            <span className="blog-page-meta-dot" aria-hidden />
            <span>{BLOG_FEATURED.date}</span>
            <span className="blog-page-meta-dot" aria-hidden />
            <span>{BLOG_FEATURED.readTime}</span>
          </div>
        </div>
        <div className="blog-page-featured-image-wrap">
          <img
            src={BLOG_FEATURED.image}
            alt=""
            className="blog-page-featured-image"
          />
        </div>
      </div>
    </section>
  );
}
