import "@/app/figma-pages/about.css";
import { AboutPage } from "@/components/figma-pages/about/about-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Vested Nest",
  description:
    "Vested Nest is an agentic DSCR financing platform built for serious real estate operators.",
};

export default function AboutRoutePage() {
  return (
    <FigmaPageShell>
      <AboutPage />
    </FigmaPageShell>
  );
}
