import { BlogArticlesSection } from "./sections/articles-section";
import { BlogCtaSection } from "./sections/cta-section";
import { BlogFeaturedSection } from "./sections/featured-section";
import { BlogNewsletterSection } from "./sections/newsletter-section";

export function BlogPage() {
  return (
    <div className="blog-page">
      <BlogFeaturedSection />
      <BlogArticlesSection />
      <BlogNewsletterSection />
      <BlogCtaSection />
    </div>
  );
}
