import { ForeignNationalLoansPage } from "@/components/figma-pages/foreign-national-loans/foreign-national-loans-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import { foreignNationalLoansPage } from "@/lib/product-pages";
import type { Metadata } from "next";
import "../figma-pages/foreign-national-loans.css";

export const metadata: Metadata = {
  title: foreignNationalLoansPage.meta.title,
  description: foreignNationalLoansPage.meta.description,
};

export default function ForeignNationalLoansRoutePage() {
  return (
    <FigmaPageShell>
      <ForeignNationalLoansPage />
    </FigmaPageShell>
  );
}
