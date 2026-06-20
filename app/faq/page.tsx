import "@/app/figma-pages/faq.css";
import { FaqPage } from "@/components/figma-pages/faq/faq-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Vested Nest",
  description:
    "Frequently asked questions about DSCR loans, bridge loans, cash-out refi, rental loans, and foreign national financing.",
};

export default function FaqRoutePage() {
  return (
    <FigmaPageShell>
      <FaqPage />
    </FigmaPageShell>
  );
}
