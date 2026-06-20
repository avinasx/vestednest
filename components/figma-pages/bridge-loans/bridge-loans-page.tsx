import { BridgeCtaSection } from "./sections/cta-section";
import { BridgeExitCalculatorSection } from "./sections/exit-calculator-section";
import { BridgeFaqSection } from "./sections/faq-section";
import { BridgeHeroSection } from "./sections/hero-section";
import { BridgeIntroTimelineSection } from "./sections/intro-timeline-section";
import { BridgePipelineSection } from "./sections/pipeline-section";
import { BridgeTermsSection } from "./sections/terms-section";
import { BridgeUseCasesSection } from "./sections/use-cases-section";

export function BridgeLoansPage() {
  return (
    <div className="bl-page">
      <BridgeHeroSection />
      <BridgeIntroTimelineSection />
      <BridgeUseCasesSection />
      <BridgeExitCalculatorSection />
      <BridgeTermsSection />
      <BridgePipelineSection />
      <BridgeFaqSection />
      <BridgeCtaSection />
    </div>
  );
}
