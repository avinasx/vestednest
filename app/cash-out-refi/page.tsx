import { CashOutRefiPage } from "@/components/figma-pages/cash-out-refi/cash-out-refi-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import { cashOutRefiPage } from "@/lib/product-pages";
import type { Metadata } from "next";
import "../figma-pages/cash-out-refi.css";

export const metadata: Metadata = {
  title: cashOutRefiPage.meta.title,
  description: cashOutRefiPage.meta.description,
};

export default function CashOutRefiRoutePage() {
  return (
    <FigmaPageShell>
      <CashOutRefiPage />
    </FigmaPageShell>
  );
}
