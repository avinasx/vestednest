import { PrivacyContentSection } from "./sections/content-section";
import { PrivacyHeroSection } from "./sections/hero-section";

export function PrivacyPage() {
  return (
    <div className="privacy-page">
      <PrivacyHeroSection />
      <PrivacyContentSection />
    </div>
  );
}
