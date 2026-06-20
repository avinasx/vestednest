import { FaqContentSection } from "./sections/content-section";
import { FaqCtaSection } from "./sections/cta-section";
import { FaqHeroSection } from "./sections/hero-section";

export function FaqPage() {
  return (
    <div className="faq-page">
      <FaqHeroSection />
      <FaqContentSection />
      <FaqCtaSection />
    </div>
  );
}
