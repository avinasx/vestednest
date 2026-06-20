import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import { BridgeLoansPage } from "@/components/figma-pages/bridge-loans/bridge-loans-page";
import { bridgeLoansPage } from "@/lib/product-pages";
import type { Metadata } from "next";
import "../figma-pages/bridge-loans.css";

export const metadata: Metadata = {
  title: bridgeLoansPage.meta.title,
  description: bridgeLoansPage.meta.description,
};

export default function BridgeLoansRoute() {
  return (
    <FigmaPageShell>
      <BridgeLoansPage />
    </FigmaPageShell>
  );
}
