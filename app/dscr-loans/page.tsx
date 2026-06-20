import { DscrLoansPage } from "@/components/figma-pages/dscr-loans/dscr-loans-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import { dscrLoansPage } from "@/lib/product-pages";
import type { Metadata } from "next";
import "../figma-pages/dscr-loans.css";

export const metadata: Metadata = {
  title: dscrLoansPage.meta.title,
  description: dscrLoansPage.meta.description,
};

export default function DscrLoansRoutePage() {
  return (
    <FigmaPageShell>
      <DscrLoansPage />
    </FigmaPageShell>
  );
}
