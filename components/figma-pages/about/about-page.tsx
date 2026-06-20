import { AboutContactSection } from "./sections/contact-section";
import { AboutCtaSection } from "./sections/cta-section";
import { AboutDifferentiatorsSection } from "./sections/differentiators-section";
import { AboutHeroSection } from "./sections/hero-section";
import { AboutMissionSection } from "./sections/mission-section";
import { AboutPressSection } from "./sections/press-section";
import { AboutTeamSection } from "./sections/team-section";

export function AboutPage() {
  return (
    <div className="about-page">
      <AboutHeroSection />
      <AboutMissionSection />
      <AboutDifferentiatorsSection />
      <AboutTeamSection />
      <AboutPressSection />
      <AboutContactSection />
      <AboutCtaSection />
    </div>
  );
}
