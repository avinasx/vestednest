import { RlBifiSection } from "./sections/bifi-section";
import { RlCtaSection } from "./sections/cta-section";
import { RlEntitySection } from "./sections/entity-section";
import { RlFaqSection } from "./sections/faq-section";
import { RlHeroSection } from "./sections/hero-section";
import { RlJourneySection } from "./sections/journey-section";
import { RlPipelineSection } from "./sections/pipeline-section";
import { RlSpectrumSection } from "./sections/spectrum-section";

export function RentalLoansPage() {
  return (
    <div className="rl-page">
      <RlHeroSection />
      <RlJourneySection />
      <RlSpectrumSection />
      <RlBifiSection />
      <RlEntitySection />
      <RlPipelineSection />
      <RlFaqSection />
      <RlCtaSection />
    </div>
  );
}
