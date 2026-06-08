import type { PropertyIntel } from "@/lib/property-intel";
import type { TermSheet } from "@/lib/dscr";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
};

export type DealState = {
  formattedAddress: string;
  intel: PropertyIntel;
  termSheet: TermSheet;
  monthlyRent: number;
  fico: number;
  borrowerType: "llc" | "individual" | "foreign";
  downPaymentPct: number;
  interestOnly: boolean;
  loanTerm: "30yr" | "5/1" | "7/1";
  prepay: "none" | "3yr" | "5yr";
  purpose: "purchase" | "cashout" | "bridge";
};
