"use client";

import type { useLoanFlow } from "@/components/flow/use-loan-flow";
import { BridgeCalculatorSection } from "./bridge-calculator-section";
import { FinalCtaSection } from "./final-cta-section";
import { Footer } from "./footer";
import { FundedPipelineSection } from "./funded-pipeline-section";
import { HeroSection } from "./hero-section";
import { NestAiSection } from "./nest-ai-section";
import { OldWaySection } from "./old-way-section";
import { ProcessSection } from "./process-section";
import { TestimonialsSection } from "./testimonials-section";
import { WhyDscrSection } from "./why-dscr-section";

type LoanFlow = ReturnType<typeof useLoanFlow>;

export function LandingPage({ f }: { f: LoanFlow }) {
  const flowProps = {
    heroInput: f.heroInput,
    heroState: f.heroState,
    classicMode: f.classicMode,
    onHeroInputChange: f.setHeroInput,
    onHeroStateChange: f.setHeroState,
    onClassicModeChange: f.setClassicMode,
    onStart: (text?: string) => f.startFromHero(text),
  };

  return (
    <div className="landing-page min-h-full">
      <main>
        <HeroSection onStart={() => f.startFromHero()} />
        <OldWaySection />
        <WhyDscrSection />
        <NestAiSection {...flowProps} />
        <ProcessSection />
        <FundedPipelineSection />
        <BridgeCalculatorSection onStart={(text) => f.startFromHero(text)} />
        <TestimonialsSection />
        <FinalCtaSection onStart={() => f.startFromHero()} />
      </main>
      <Footer />
    </div>
  );
}
