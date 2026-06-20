import type { Differentiator, TeamMember } from "../types";

export const ABOUT_STATS = [
  { value: "$1.4B+", label: "Originated by our team since 2019" },
  { value: "38", label: "States funded" },
  { value: "14", label: "Median days to close" },
  { value: "4.9/5", label: "Operator satisfaction rating" },
] as const;

export const ABOUT_BELIEFS = [
  {
    title: "Cash flow is the underwrite.",
    body: "A property earning 1.32x its payment is a good loan — regardless of who owns it.",
  },
  {
    title: "Speed is a product feature.",
    body: "Closing in 14 days isn't a tagline — it's a competitive advantage that wins deals.",
  },
  {
    title: "Transparency is non-negotiable.",
    body: "Rate, points, and payment on screen before you talk to anyone — no email gate, no bait-and-switch.",
  },
  {
    title: "LLCs are the default.",
    body: "Not an exception. Not a problem. The entity is the borrower — that's how it should work.",
  },
] as const;

export const ABOUT_DIFFERENTIATORS: Differentiator[] = [
  {
    title: "Agentic AI, not a portal",
    body: "Most fintech lenders built a faster form. We built an AI that reads the property for you — rent comps, ARV, DSCR — before you even answer a question. The form doesn't exist.",
  },
  {
    title: "14 days, not 45",
    body: "Our median close is 14 calendar days. That's 31 fewer days of bridge interest, 31 fewer days of carry risk, and 31 fewer days before the rental income starts. Speed is money.",
  },
  {
    title: "Live rate. No email gate.",
    body: "Consumer lenders are bound by TRID — every rate quote is a 3-day wait. DSCR is exempt. We put the real rate, points, and payment on screen in 60 seconds. No account. No callback. No catch.",
  },
  {
    title: "Built for the whole portfolio",
    body: "No Fannie Mae 10-loan ceiling. No personal income check. Whether you're on deal one or deal twenty, the underwrite is the same — the property qualifies, not you.",
  },
  {
    title: "Foreign nationals welcome",
    body: "No SSN. No U.S. credit history. No in-person visit. International investors with a U.S. LLC can own U.S. rentals and close entirely remotely via wire and e-sign.",
  },
  {
    title: "Bridge → DSCR, same team",
    body: "We close your bridge and handle the DSCR exit — no handoff to a different lender, no starting over. The same underwriter who knew your deal on day one closes it on day 14.",
  },
];

export const ABOUT_TEAM: TeamMember[] = [
  {
    name: "Rishi Dutta",
    title: "Co-CEO",
    bio: "Leads growth, technology, and the Nest AI platform. Background in fintech and agentic systems. Obsessed with compressing the path from address to closed loan.",
    photo: "/figma-assets/imgEllipse36410.png",
  },
  {
    name: "Viraj Bhalla",
    title: "Co-Founder & Co-CEO",
    bio: "Brings deep operator experience in DSCR financing and investment real estate. Focused on product, investor relationships, and the underwriting process.",
    photo: "/figma-assets/imgEllipse36408.png",
  },
  {
    name: "Arvin Hallak",
    title: "COO",
    bio: "Runs operations, closing coordination, and the underwriting pipeline. The person responsible for the 14-day median close actually being 14 days.",
    photo: "/figma-assets/imgEllipse36411.png",
  },
];

export const ABOUT_PRESS = [
  "BiggerPockets",
  "Bloomberg",
  "Inman",
  "HOUSINGWIRE",
  "THE REAL DEAL",
] as const;
