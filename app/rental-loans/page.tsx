import { RentalLoansPage } from "@/components/figma-pages/rental-loans/rental-loans-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import { rentalLoansPage } from "@/lib/product-pages";
import type { Metadata } from "next";
import "../figma-pages/rental-loans.css";

export const metadata: Metadata = {
  title: rentalLoansPage.meta.title,
  description: rentalLoansPage.meta.description,
};

export default function RentalLoansRoutePage() {
  return (
    <FigmaPageShell>
      <RentalLoansPage />
    </FigmaPageShell>
  );
}
