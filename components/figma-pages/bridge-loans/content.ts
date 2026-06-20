import { bridgeLoansPage } from "@/lib/product-pages/content/bridge-loans";

const hero = bridgeLoansPage.sections.find((s) => s.type === "hero");
const intro = bridgeLoansPage.sections.find((s) => s.type === "intro");
const timeline = bridgeLoansPage.sections.find((s) => s.type === "timeline");
const exitCards = bridgeLoansPage.sections.find(
  (s) => s.type === "cards" && s.label === "The exit path",
);
const cta = bridgeLoansPage.sections.find((s) => s.type === "cta");

export const BRIDGE_HERO = {
  badge: "Now funding in 38 states",
  title: hero && hero.type === "hero" ? hero.title : "Short-term capital.",
  titleAccent: hero && hero.type === "hero" ? hero.titleAccent : "Same-week decision.",
  lead:
    hero && hero.type === "hero"
      ? hero.lead
      : "Bridge loans for fix-and-flip operators and BRRRR investors who need to move fast.",
  perks: hero && hero.type === "hero" ? hero.perks : ["No W2", "No DTI", "No hard pull", "14-day close"],
};

export const BRIDGE_INTRO =
  intro && intro.type === "intro"
    ? intro
    : {
        label: "Plain English",
        title: "What is a bridge loan?",
        paragraphs: [] as string[],
      };

export const BRIDGE_TIMELINE =
  timeline && timeline.type === "timeline"
    ? timeline
    : { label: "The bridge timeline", title: "From close to DSCR exit.", steps: [] as const };

export const BRIDGE_EXIT = {
  label: exitCards && exitCards.type === "cards" ? exitCards.label : "The exit path",
  title: exitCards && exitCards.type === "cards" ? exitCards.title : "Bridge → DSCR. Same team. No friction.",
  lead:
    exitCards && exitCards.type === "cards"
      ? exitCards.lead
      : "Most bridge lenders hand you off to a different lender for the permanent financing.",
  cards:
    exitCards && exitCards.type === "cards"
      ? exitCards.items.map((item, i) => ({
          ...item,
          icon: ["/figma-assets/imgCalendar3.svg", "/figma-assets/imgFile02.svg", "/figma-assets/imgPayment02.svg"][i],
        }))
      : [],
};

export const BRIDGE_USE_CASES = [
  {
    tag: "Fix & Flip",
    title: "Buy distressed. Renovate. Sell.",
    body: "Buy at below-market, put in the work, sell at ARV. Bridge capital covers the purchase and the renovation budget in one loan.",
    perks: ["6–24 month terms", "Up to 90% LTC / 75% ARV", "Interest-only payments"],
    math: [
      { label: "Purchase price", value: "$220,000" },
      { label: "Reno budget", value: "$45,000" },
      { label: "Bridge loan (80% of cost)", value: "$212,000" },
      { label: "ARV (post-reno value)", value: "$340,000" },
      { label: "Gross profit at sale", value: "~$85,000", highlight: true },
    ],
  },
  {
    tag: "BRRRR Strategy",
    title: "Buy. Rehab. Rent. Refi. Repeat.",
    body: "Buy distressed with bridge, renovate, place a tenant, then refinance into a long-term DSCR to pull out equity and repeat the cycle.",
    perks: ["Exit into our DSCR, same team", "No prepay after 6 months", "Same-week underwriting decision"],
    math: [
      { label: "Purchase + reno (all-in)", value: "$280,000" },
      { label: "After-repair value", value: "$380,000" },
      { label: "DSCR refi at 75% ARV", value: "$285,000" },
      { label: "Equity pulled out", value: "~$5,000+", highlight: true },
    ],
  },
];

export const BRIDGE_PIPELINE = [
  {
    tag: "Bridge → DSCR",
    city: "Atlanta, GA",
    amount: "$990,000 @ 12%",
    caption: "Exited bridge after 31 days. Cash-out at DSCR close. No prepay penalty.",
    featured: true,
    stats: [
      { label: "ARV", value: "$936.7K" },
      { label: "Hold period", value: "31 days" },
      { label: "Exit rate", value: "7.99%" },
      { label: "Days to DSCR", value: "14 days" },
    ],
  },
  {
    tag: "BRRRR",
    city: "Charlotte, NC",
    amount: "$312,000 @ 12.5%",
    caption: "Full BRRRR cycle. Tenant placed, DSCR refi at 75% ARV, equity recycled.",
    featured: false,
    stats: [
      { label: "Purchase", value: "$220K" },
      { label: "Reno", value: "$68K" },
      { label: "ARV", value: "$420K" },
      { label: "Exit to DSCR", value: "Month 5" },
    ],
  },
  {
    tag: "Fix & Flip",
    city: "Jacksonville, FL",
    amount: "$185,000 @ 11.5%",
    caption: "SFR distressed purchase. Sold at ARV. Same-week underwriting decision.",
    featured: false,
    stats: [
      { label: "Purchase", value: "$142K" },
      { label: "Reno", value: "$38K" },
      { label: "ARV", value: "$265K" },
      { label: "Hold period", value: "4 months" },
    ],
  },
];

export const BRIDGE_TERMS_ROWS = [
  { param: "Loan Amount", range: "$100,000 – $5,000,000", notes: "Residential and small commercial" },
  { param: "LTC (Loan to Cost)", range: "Up to 90%", notes: "Purchase + renovation budget" },
  { param: "ARV LTV", range: "Up to 75%", notes: "After-repair value ceiling" },
  { param: "Rate", range: "11% – 14%", notes: "Interest-only, priced to exit" },
  { param: "Term", range: "6 – 24 months", notes: "Extensions available" },
  { param: "Payments", range: "Interest-only", notes: "Lower monthly obligation during hold" },
  { param: "Prepay penalty", range: "None after 6 months", notes: "Aligned with your DSCR exit" },
  { param: "Decision speed", range: "Same-week underwriting", notes: "In-house underwriter, no committee" },
  { param: "Property types", range: "SFR, 2–10 unit, mixed-use", notes: "Ground-up not available" },
];

export const BRIDGE_FAQ = [
  {
    q: "What's the minimum and maximum loan amount?",
    a: "We typically fund $100,000 to $5,000,000 on bridge loans. Larger deals are evaluated case-by-case — drop an address to discuss.",
  },
  {
    q: "Can I extend my bridge if I need more time?",
    a: "Yes — extensions are available subject to performance and market conditions. Contact your funder before maturity to discuss terms.",
  },
  {
    q: "Can I refinance into your DSCR product after?",
    a: "That's the primary exit path. Same team, light doc transition, and bridge appraisal reused where allowed — typically saving ~$650 and 2+ weeks.",
  },
  {
    q: "Do you fund ground-up construction?",
    a: "We focus on acquisition + renovation bridge for existing structures. Ground-up is evaluated case-by-case — drop an address to discuss.",
  },
  {
    q: "Is a personal guarantee required?",
    a: "Entity borrowers are standard. Recourse terms depend on experience, leverage, and deal structure — disclosed at term sheet.",
  },
  {
    q: "How quickly can you close a bridge loan?",
    a: "Same-week decision on complete files. Closings in as few as 7–10 business days when appraisal and title are ordered immediately.",
  },
];

export const BRIDGE_CTA = {
  title: cta && cta.type === "cta" ? cta.title : "Get your bridge quote. Same day.",
  lead:
    "Drop the address. We'll run the ARV, LTC, and structure your bridge.\nSame-week underwriting decision.",
  perks: cta && cta.type === "cta" ? cta.perks : ["No W2", "No DTI", "No hard pull", "14-day close"],
};
