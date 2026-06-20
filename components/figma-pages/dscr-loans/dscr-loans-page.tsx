import { DscrComparisonSection } from "./sections/comparison-section";
import { DscrCtaSection } from "./sections/cta-section";
import { DscrFaqSection } from "./sections/faq-section";
import { DscrHeroSection } from "./sections/hero-section";
import { DscrPersonasSection } from "./sections/personas-section";
import { DscrRentcastSection } from "./sections/rentcast-section";
import { DscrScaleSection } from "./sections/scale-section";
import { DscrTermsSection } from "./sections/terms-section";

export function DscrLoansPage() {
  return (
    <div className="dscr-page">
      <DscrHeroSection />
      <DscrScaleSection />
      <DscrPersonasSection />
      <DscrRentcastSection />
      <DscrTermsSection />
      <DscrComparisonSection />
      <DscrFaqSection />
      <DscrCtaSection />
    </div>
  );
}
