import { BridgeSection } from "@/components/vestednest/bridge-section";
import { ClosedDeals } from "@/components/vestednest/closed-deals";
import { FinalCta } from "@/components/vestednest/final-cta";
import { Footer } from "@/components/vestednest/footer";
import { Hero } from "@/components/vestednest/hero";
import { HowItWorks } from "@/components/vestednest/how-it-works";
import { Nav } from "@/components/vestednest/nav";
import { PressLogos } from "@/components/vestednest/press-logos";
import { PageShell } from "@/components/vestednest/section";
import { WhyDscr } from "@/components/vestednest/why-dscr";

export default function Home() {
  return (
    <PageShell>
      <Nav />
      <Hero />
      <PressLogos />
      <ClosedDeals />
      <HowItWorks />
      <WhyDscr />
      <BridgeSection />
      <FinalCta />
      <Footer />
    </PageShell>
  );
}
