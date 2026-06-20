import type { ProductPageConfig } from "../types";

export const dscrLoansPage: ProductPageConfig = {
  slug: "dscr-loans",
  meta: {
    title: "DSCR Loans — Vested Nest",
    description:
      "DSCR loans let the property qualify itself. No income docs, no DTI, no employment check — just cash flow. Drop an address and see your rate in 60 seconds.",
  },
  sections: [
    {
      type: "hero",
      badge: "NOW FUNDING IN 38 STATES",
      title: "The loan that reads the rent roll,",
      titleAccent: "not your W2.",
      lead: "DSCR loans let the property qualify itself. No income docs, no DTI, no employment check — just the cash flow. Drop an address and see your rate in 60 seconds.",
      perks: ["No W2", "No DTI", "No hard pull", "60s to a term sheet"],
    },
    {
      type: "scale",
      label: "The DSCR scale",
      title: "What is a DSCR loan?",
      intro: [
        "DSCR stands for Debt Service Coverage Ratio. It's the number that tells a lender whether a rental property can pay for itself.",
        "The formula is simple: Monthly Rent ÷ Monthly PITIA. If the property earns more than it costs, it qualifies — regardless of who owns it, what they earn, or what their W2 says.",
        "Because DSCR loans are business-purpose loans made to entities (your LLC), they sit outside the consumer mortgage rulebook. No TRID. No RESPA. No DTI. That's how we can quote your rate on screen in 60 seconds.",
      ],
      items: [
        { value: "1.32x", tag: "Strong", body: "Property earns well above its cost. Qualifies easily." },
        { value: "1.10x", tag: "Qualifying", body: "Above 1.1x — eligible. Rate may be slightly higher." },
        { value: "1.00x", tag: "Borderline", body: "Break-even. No-Ratio option may apply." },
        { value: "0.85x", tag: "Below 1.0x", body: "Property costs more than it earns. No-Ratio or STR income considered." },
      ],
      bg: "muted",
    },
    {
      type: "personas",
      label: "Who it's for",
      title: "Built for serious operators.",
      lead: "Not your first home. Not a weekend cabin. This product exists for people who own rental properties through entities and need capital that keeps up with them.",
      items: [
        {
          title: "Portfolio Builder",
          subtitle: "Scaling past the 10-loan conventional ceiling",
          body: "Hit the Fannie Mae 10-loan limit two years ago. Has been buying cash, needing a DSCR lender who can underwrite deal 11, 12, and 20 with no personal income check.",
        },
        {
          title: "Out-of-state Buyer",
          subtitle: "Buying in markets they don't live in",
          body: "Based in California, buying in Georgia and Florida for the cash flow. Needs a lender who doesn't require them to bank locally, appear in person, or explain their rental income on a form.",
        },
        {
          title: "LLC Investor",
          subtitle: "Buying through an entity, protecting assets",
          body: "Owns three SFRs through a Delaware LLC. Great cash flow, thin W2. Every conventional lender has said no — not because the deals are bad, but because the system isn't built for them.",
        },
      ],
    },
    {
      type: "timeline",
      label: "The Rentcast hook",
      title: "You drop an address. We do the rest.",
      steps: [
        {
          time: "45 seconds",
          title: "Drop the address",
          body: "One field. We pull the parcel, rent comps, and market trend from Rentcast automatically.",
        },
        {
          time: "Instant",
          title: "AI calculates DSCR",
          body: "Monthly rent divided by PITIA — rate, points, and qualification rendered live.",
        },
        {
          time: "60 seconds total",
          title: "Rate, points, PITIA on screen",
          body: "No email gate. No 3-day TRID wait. Adjust levers and watch the term sheet update.",
        },
        {
          time: "Day 14",
          title: "Close",
          body: "Light borrower docs. Parallel underwriting. Dedicated funder who picks up the phone.",
        },
      ],
      example: {
        label: "Live example — 142 Oak Ridge Dr, Atlanta GA",
        stats: [
          { label: "Rentcast Rent Est.", value: "$2,340/mo" },
          { label: "Monthly PITIA", value: "$1,773" },
          { label: "DSCR Ratio", value: "1.32x" },
          { label: "Rate Quoted", value: "7.99%" },
        ],
      },
    },
    {
      type: "terms",
      label: "Transparent pricing",
      title: "Rates & terms.",
      lead: "No teaser rates. No bait-and-switch. Your live quote reflects today's pricing — you see the exact rate, points, and payment before you talk to anyone.",
      footnote:
        "Rates are indicative and subject to change. Your live quote reflects current pricing at time of quote.",
      rows: [
        { param: "Loan Amount", range: "$100,000 – $5,000,000", notes: "Small balance multi available" },
        { param: "LTV", range: "Up to 80% (purchase) | Up to 75% (refi)", notes: "DSCR ≥ 1.25x for max LTV" },
        { param: "DSCR Minimum", range: "1.0x | 0.75x (No-Ratio)", notes: "No-Ratio available at lower LTV" },
        { param: "Loan Term", range: "30yr Fixed | 5/1 ARM | 7/1 ARM", notes: "Interest-only period available" },
        { param: "Prepay Penalty", range: "None | 3yr | 5yr", notes: "Longer prepay = lower rate" },
        { param: "Borrower Type", range: "LLC | Individual | Foreign National", notes: "LLC is the default & preferred" },
        { param: "Property Types", range: "SFR | 2–4 unit | 5–10 unit | Condo", notes: "Warrantable and non-warrantable condos" },
        { param: "Occupancy", range: "Non-owner occupied only", notes: "Investment / rental properties only" },
        { param: "Origination", range: "1.0 – 2.0 pts", notes: "Reflected in live quote" },
        { param: "Reserves", range: "6 months PITIA", notes: "Liquid assets, verified" },
      ],
    },
    {
      type: "comparison",
      label: "Honest comparison",
      title: "DSCR vs. conventional. Who wins where.",
      rows: [
        { feature: "Income qualification", dscr: "Property cash flow", conventional: "W2 / tax returns required" },
        { feature: "DTI calculation", dscr: "Not required", conventional: "Required — caps leverage" },
        { feature: "Entity borrower (LLC)", dscr: "Default & preferred", conventional: "Not allowed on most products" },
        { feature: "Loan count ceiling", dscr: "No limit", conventional: "10 loans (Fannie Mae)" },
        { feature: "Rate quote speed", dscr: "60 seconds, on screen", conventional: "3-day TRID wait" },
        { feature: "Close timeline", dscr: "Median 14 days", conventional: "45+ days typical" },
        { feature: "STR / Airbnb income", dscr: "Eligible with AirDNA", conventional: "Generally not accepted" },
      ],
      bg: "muted",
    },
    {
      type: "faq",
      label: "Common questions",
      title: "DSCR loan FAQ.",
      items: [
        {
          q: "Is an LLC required to get a DSCR loan?",
          a: "LLC is strongly preferred and our default structure. Individual borrowers are eligible in most states; foreign nationals must vest through a U.S. LLC.",
        },
        {
          q: "Do I need to show a lease or rental history?",
          a: "No executed lease is required at quote. We use market rent comps (Rentcast) for the DSCR calculation. A signed lease may be requested at underwriting for occupied properties.",
        },
        {
          q: "Can I use short-term rental (Airbnb/VRBO) income to qualify?",
          a: "Yes. We accept AirDNA projections or self-reported STR income with appropriate documentation. STR properties may have slightly different LTV caps.",
        },
        {
          q: "Is interest-only available?",
          a: "Yes — interest-only periods are available on most products. IO lowers the monthly payment and can improve DSCR at the cost of a modest rate adjustment.",
        },
        {
          q: "What states does Vested Nest fund in?",
          a: "We fund in 38 states. North Dakota and South Dakota are hard-blocked. NJ, NY, and VA have additional requirements — ask Nest AI or drop an address for a live eligibility check.",
        },
        {
          q: "How does the pre-payment penalty work?",
          a: "You choose at quote: no prepay, 3-year, or 5-year. Longer prepay periods typically buy you a lower rate. Bridge-to-DSCR exits have no prepay after 6 months on the new loan.",
        },
        {
          q: "What documents do I need to close?",
          a: "Entity docs (operating agreement, EIN), 3 months bank statements, insurance binder, and appraisal. No tax returns, W2, or employment verification.",
        },
      ],
    },
    {
      type: "cta",
      title: "Drop the address. We'll do the rest",
      lead: "Sixty seconds to a real indicative term sheet. Fourteen days to a closed loan. The property does the qualifying.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
  ],
};
