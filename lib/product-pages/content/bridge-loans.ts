import type { ProductPageConfig } from "../types";

export const bridgeLoansPage: ProductPageConfig = {
  slug: "bridge-loans",
  meta: {
    title: "Bridge Loans — Vested Nest",
    description:
      "Short-term capital for fix-and-flip and BRRRR investors. Interest-only, up to 90% LTC. Exit into our DSCR product with the same team — no handoff friction.",
  },
  sections: [
    {
      type: "hero",
      badge: "SAME-WEEK DECISION",
      title: "Short-term capital.",
      titleAccent: "Same-week decision.",
      lead: "Bridge loans for fix-and-flip operators and BRRRR investors who need to move fast. Interest-only. Up to 90% LTC. Exit into our DSCR product with the same team — no handoff friction.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
    {
      type: "intro",
      label: "Plain English",
      title: "What is a bridge loan?",
      paragraphs: [
        "A bridge loan is short-term capital that lets you buy or renovate before your permanent financing is in place. It \"bridges\" the gap between the deal you want to do and the long-term loan you'll exit into.",
        "Bridge loans are interest-only, which keeps your monthly payment lower during the hold. They're priced higher than permanent loans — typically 11–14% — which is why exiting into a DSCR as quickly as possible is almost always the right move.",
        "Most of our bridge borrowers exit into our DSCR product. Same team, same system, no handoff friction.",
      ],
    },
    {
      type: "timeline",
      label: "The bridge timeline",
      title: "From close to DSCR exit.",
      steps: [
        {
          time: "Day 1",
          title: "Bridge closes",
          body: "You take ownership. Renovation begins or property is stabilized. Interest accrues daily.",
        },
        {
          time: "Month 1–6",
          title: "Hold period",
          body: "Interest-only payments. Every day in the bridge costs money — the goal is to exit efficiently.",
        },
        {
          time: "Month 3–9",
          title: "DSCR exit initiated",
          body: "Property is stabilized, tenant is in, rent is confirmed. We start the DSCR underwrite in parallel.",
        },
        {
          time: "Exit",
          title: "Bridge paid off, DSCR in place",
          body: "Long-term DSCR loan replaces the bridge. Monthly payment drops. You pull equity out if eligible.",
        },
      ],
      bg: "muted",
    },
    {
      type: "cards",
      label: "The exit path",
      title: "Bridge → DSCR. Same team. No friction.",
      lead: "Most bridge lenders hand you off to a different lender for the permanent financing. We don't. The same team that closed your bridge underwrites your DSCR exit — no new application, no starting over, no handoff risk.",
      items: [
        {
          title: "Same-week decision",
          body: "When your property is stabilized, drop us a note. We initiate the DSCR underwrite in parallel with the appraisal — no committee, no queue.",
        },
        {
          title: "Light doc transition",
          body: "Your entity docs and bank statements carry over. The main addition is an updated insurance binder and the signed lease if the property is occupied.",
        },
        {
          title: "No prepay penalty after 6 months",
          body: "Once you're 6 months into the bridge, you can exit into DSCR without a prepayment penalty. We're aligned with your incentive to refinance quickly.",
        },
      ],
      columns: 3,
    },
    { type: "bridge-calculator" },
    {
      type: "cards",
      label: "Use cases",
      title: "Two strategies. One product.",
      items: [
        {
          title: "Fix & Flip — Buy distressed. Renovate. Sell.",
          body: "Buy at below-market, put in the work, sell at ARV. Bridge capital covers the purchase and the renovation budget in one loan. 6–24 month terms · Up to 90% LTC / 75% ARV · Interest-only payments.",
        },
        {
          title: "BRRRR Strategy — Buy. Rehab. Rent. Refi. Repeat.",
          body: "Buy distressed with bridge, renovate, place a tenant, then refinance into a long-term DSCR to pull out equity and repeat the cycle. Exit into our DSCR, same team · No prepay after 6 months · Same-week underwriting decision.",
        },
      ],
      columns: 2,
      bg: "muted",
    },
    {
      type: "pipeline",
      label: "Funded pipeline",
      title: "Real bridge deals.",
      deals: [
        {
          tag: "Bridge → DSCR",
          city: "Atlanta, GA",
          amount: "$990,000 @ 12%",
          caption: "Exited bridge after 31 days. Cash-out at DSCR close. No prepay penalty.",
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
          stats: [
            { label: "Purchase", value: "$220K" },
            { label: "Reno", value: "$68K" },
            { label: "ARV", value: "$420K" },
            { label: "Exit to DSCR", value: "Month 5" },
          ],
        },
      ],
    },
    {
      type: "terms",
      label: "Bridge loan terms",
      title: "Bridge loan terms.",
      rows: [
        { param: "Loan Amount", range: "$150,000 – $3,000,000", notes: "Case-by-case above $3M" },
        { param: "LTC / LTV", range: "Up to 90% LTC | Up to 75% ARV", notes: "Experience and market dependent" },
        { param: "Term", range: "6 – 24 months", notes: "Extensions available" },
        { param: "Rate", range: "Typically 11 – 14%", notes: "Interest-only" },
        { param: "Prepay", range: "None after 6 months", notes: "Aligned with DSCR exit" },
        { param: "Property Types", range: "SFR | 2–4 unit | small multi", notes: "Non-owner occupied" },
        { param: "Exit", range: "DSCR refi (same team)", notes: "Bridge appraisal reused where allowed" },
      ],
    },
    {
      type: "faq",
      label: "Common questions",
      title: "Bridge loan FAQ.",
      items: [
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
      ],
    },
    {
      type: "cta",
      title: "Get your bridge quote. Same day.",
      lead: "Drop an address or tell us about the deal. We'll quote LTC, rate, and hold costs — then map your DSCR exit path.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
  ],
};
