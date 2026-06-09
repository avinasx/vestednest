import type { PublicAddressSuggestion } from "@/lib/address-resolve";
import type { ChatInteraction } from "@/lib/chat-interactions/types";
import type { PropertyIntel } from "@/lib/property-intel";
import type { TermSheet } from "@/lib/dscr";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  interaction?: Omit<ChatInteraction, "source"> | null;
  /** @deprecated — use interaction.options when kind=address */
  addressSuggestions?: PublicAddressSuggestion[];
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

export type CloseTrackerData = {
  application: { id: string; status: string; address: string };
  steps: { label: string; pct: number; status: string }[];
  daysToClose: number;
  loanOfficer: {
    name: string;
    email: string;
    phone: string | null;
    title: string | null;
    avatar_initials: string | null;
  };
  twilioEnabled: boolean;
};
