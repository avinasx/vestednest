/* eslint-disable @next/next/no-img-element */
import { SectionLabel } from "@/components/landing/section-label";
import { BLOG_POSTS } from "@/lib/static-pages/content/blog";

export function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      <section className="static-hero static-hero--blog">
        <div className="product-hero-grid" aria-hidden />
        <div className="landing-section-inner static-hero-inner text-center">
          <div className="landing-hero-badge">Operator-grade insights</div>
          <h1 className="static-hero-title">
            No fluff. Just the math <em>operators need.</em>
          </h1>
          <p className="static-hero-lead static-hero-lead--center">
            DSCR education, market analysis, and deal case studies — written for people who own
            rental properties through LLCs and want to understand the numbers.
          </p>
        </div>
      </section>

      {featured ? (
        <section className="static-section static-blog-featured">
          <div className="landing-section-inner static-blog-featured-grid">
            <div>
              <SectionLabel>{featured.category}</SectionLabel>
              <h2 className="product-section-title static-blog-featured-title">{featured.title}</h2>
              <p className="static-blog-excerpt">{featured.excerpt}</p>
              <p className="static-blog-meta">
                By {featured.author} · {featured.date} · {featured.readTime}
              </p>
            </div>
            {featured.image ? (
              <img src={featured.image} alt="" className="static-blog-featured-image" />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="static-section static-section--muted">
        <div className="landing-section-inner static-blog-grid">
          {rest.map((post) => (
            <article key={post.title} className="static-blog-card">
              {post.image ? (
                <img src={post.image} alt="" className="static-blog-card-image" />
              ) : null}
              <div className="static-blog-card-body">
                <SectionLabel>{post.category}</SectionLabel>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <p className="static-blog-meta">
                  By {post.author} · {post.date} · {post.readTime}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
