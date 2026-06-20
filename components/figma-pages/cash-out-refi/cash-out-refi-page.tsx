import { CorCtaSection } from "./sections/cta-section";
import { CorFaqSection } from "./sections/faq-section";
import { CorHeroSection } from "./sections/hero-section";
import { CorIntroSection } from "./sections/intro-section";
import { CorPipelineSection } from "./sections/pipeline-section";
import { CorQualificationSection } from "./sections/qualification-section";
import { CorTermsSection } from "./sections/terms-section";
import { CorUseCasesSection } from "./sections/use-cases-section";

export function CashOutRefiPage() {
  return (
    <div className="cor-page">
      <CorHeroSection />
      <CorIntroSection />
      <CorUseCasesSection />
      <CorQualificationSection />
      <CorPipelineSection />
      <CorTermsSection />
      <CorFaqSection />
      <CorCtaSection />
    </div>
  );
}
