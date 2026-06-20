import "@/app/figma-pages/privacy.css";
import { PrivacyPage } from "@/components/figma-pages/privacy/privacy-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Vested Nest",
  description:
    "How Vested Nest collects, uses, and protects your information. Plain English privacy policy.",
};

export default function PrivacyRoutePage() {
  return (
    <FigmaPageShell>
      <PrivacyPage />
    </FigmaPageShell>
  );
}
