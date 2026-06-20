import { FnlCtaSection } from "./sections/cta-section";
import { FnlFaqSection } from "./sections/faq-section";
import { FnlHeroSection } from "./sections/hero-section";
import { FnlPersonasSection } from "./sections/personas-section";
import { FnlPipelineSection } from "./sections/pipeline-section";
import { FnlQualificationSection } from "./sections/qualification-section";
import { FnlRemoteCloseSection } from "./sections/remote-close-section";
import { FnlTermsSection } from "./sections/terms-section";

export function ForeignNationalLoansPage() {
  return (
    <div className="fnl-page">
      <FnlHeroSection />
      <FnlPersonasSection />
      <FnlQualificationSection />
      <FnlTermsSection />
      <FnlRemoteCloseSection />
      <FnlPipelineSection />
      <FnlFaqSection />
      <FnlCtaSection />
    </div>
  );
}
