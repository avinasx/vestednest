/* eslint-disable @next/next/no-img-element */
import { BLOG_NEWSLETTER } from "@/lib/static-pages/blog-content";

export function BlogNewsletterSection() {
  return (
    <section className="blog-page-newsletter" aria-labelledby="blog-newsletter-title">
      <div className="blog-page-inner">
        <div className="blog-page-newsletter-box">
          <p className="blog-page-newsletter-label">{BLOG_NEWSLETTER.label}</p>
          <h2 id="blog-newsletter-title" className="blog-page-newsletter-title">
            {BLOG_NEWSLETTER.title}
          </h2>
          <p className="blog-page-newsletter-lead">{BLOG_NEWSLETTER.lead}</p>
          <form className="blog-page-newsletter-form" action="#" method="post">
            <input type="email" placeholder="Your@email.com" aria-label="Email address" />
            <button type="submit">
              Subscribe
              <img src="/figma-assets/imgSvg1.svg" alt="" aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
