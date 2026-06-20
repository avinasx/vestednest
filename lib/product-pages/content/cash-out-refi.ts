import type { ProductPageConfig } from "../types";

export const cashOutRefiPage: ProductPageConfig = {
  slug: "cash-out-refi",
  meta: {
    title: "Cash-Out Refinance — Vested Nest",
    description:
      "Pull equity from a stabilized rental without W2, DTI, or tax returns. The property qualifies itself — drop an address and see cash-out available in 60 seconds.",
  },
  sections: [
    {
      type: "hero",
      badge: "CASH-OUT DSCR",
      title: "See how much equity",
      titleAccent: "you can pull out.",
      lead: "Drop the address. We calculate your LTV ceiling, run the DSCR, and show you the cash out available in 60 seconds.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
    {
      type: "intro",
      label: "How it works",
      title: "Turn equity into capital. Without touching your W2.",
      paragraphs: [
        "A cash-out DSCR refinance lets you pull equity out of a stabilized rental property and put it to work — without tax returns, DTI calculations, or employment verification.",
        "The property qualifies itself. As long as the rental income covers the new loan's PITIA (DSCR ≥ 1.0x), you get the cash.",
        "This is the mechanism behind every smart operator who keeps buying without needing to save up cash each time. Equity in deal one funds the down payment on deal two.",
      ],
    },
    {
      type: "worked-example",
      label: "Worked example",
      title: "4-unit rental · Atlanta, GA",
      subtitle: "Current property value",
      rows: [
        { label: "Current property value", value: "$680,000" },
        { label: "Max LTV (75%)", value: "$510,000" },
        { label: "Existing loan payoff", value: "− $320,000" },
        { label: "Cash in your account", value: "$190,000", highlight: true },
      ],
      stats: [
        { label: "Monthly rent", value: "$4,900" },
        { label: "New PITIA", value: "$3,842" },
        { label: "DSCR", value: "1.28x ✓" },
        { label: "Rate", value: "8.25%" },
      ],
    },
    {
      type: "cards",
      label: "Use cases",
      title: "What operators use cash-out for.",
      lead: "The cash doesn't care what you use it for. Here's what most operators are doing with it.",
      items: [
        {
          title: "Fund the next acquisition",
          body: "Pull equity from property one, use it as the down payment on property two. The BRRRR loop — running without selling anything.",
        },
        {
          title: "Renovate to increase rent",
          body: "Cash-out now to fund a kitchen or bathroom upgrade that pushes rent from $1,800 to $2,300. The DSCR still works at the higher loan balance.",
        },
        {
          title: "Pay off a bridge loan",
          body: "If the stabilized property has equity, a cash-out DSCR refi pays off the bridge and puts extra cash in your pocket at the same close.",
        },
        {
          title: "Build a capital reserve",
          body: "Smart operators keep 6–12 months of PITIA in liquid reserves. Cash-out lets you replenish reserves without touching operating income.",
        },
      ],
      columns: 4,
      bg: "muted",
    },
    {
      type: "qualification",
      label: "Qualification",
      title: "What we look at. And what we don't.",
      yes: [
        { title: "Property cash flow (DSCR)", body: "Monthly rent must cover new PITIA at ≥1.0x." },
        { title: "LTV ceiling", body: "Max 75% of current appraised value on cash-out refi." },
        {
          title: "Seasoning",
          body: "Typically 3–6 months of ownership before cash-out. Ask us about your specific situation.",
        },
        { title: "Entity structure", body: "LLC preferred. Individual and foreign national eligible." },
        {
          title: "Reserves",
          body: "6 months of new PITIA in liquid assets, verified by bank statement.",
        },
      ],
      no: [
        { title: "Your W2 or personal income", body: "The property pays the loan. Your income is irrelevant." },
        { title: "Tax returns", body: "We don't need to see your Schedule E or business filings." },
        { title: "DTI ratio", body: "No debt-to-income calculation. DSCR is the only ratio that matters." },
        {
          title: "Employment verification",
          body: "Self-employed, retired, or between jobs — doesn't matter.",
        },
        {
          title: "Number of properties owned",
          body: "No Fannie Mae 10-loan ceiling. Own 50 properties — we don't care.",
        },
      ],
    },
    {
      type: "pipeline",
      label: "Funded pipeline",
      title: "Real cash-out deals.",
      deals: [
        {
          tag: "Cash-Out DSCR",
          city: "Atlanta, GA",
          amount: "$510,000 @ 8.25%",
          caption: "4-unit multi-family · Cash used for next acquisition down payment.",
          stats: [
            { label: "Property value", value: "$680K" },
            { label: "Cash out", value: "$190K" },
            { label: "DSCR", value: "1.28x" },
            { label: "Closed in", value: "14 days" },
          ],
        },
        {
          tag: "Cash-Out Refi",
          city: "Houston, TX",
          amount: "$318,000 @ 8.0%",
          caption:
            "SFR owned free-and-clear. First lien cash-out. Funds used to pay off bridge on adjacent property.",
          stats: [
            { label: "Value", value: "$425K" },
            { label: "DSCR", value: "1.22x" },
            { label: "Cash out", value: "$318K" },
            { label: "Closed in", value: "16 days" },
          ],
        },
      ],
    },
    {
      type: "terms",
      label: "Cash-out terms",
      title: "Cash-out terms.",
      lead: "Cash-out carries a small rate premium vs. purchase — typically 0.25–0.5%. Here's the full picture.",
      rows: [
        { param: "Max LTV", range: "Up to 75%", notes: "Of current appraised value" },
        { param: "Min DSCR", range: "1.0x standard | 0.75x No-Ratio", notes: "At reduced LTV" },
        { param: "Seasoning", range: "3–6 months typical", notes: "Free-and-clear may qualify sooner" },
        { param: "Rate premium", range: "+0.25 – 0.50%", notes: "Vs. purchase pricing" },
        { param: "Reserves", range: "6 months new PITIA", notes: "Can be sourced from cash proceeds" },
        { param: "Property types", range: "SFR | 2–4 | 5–10 | Condo", notes: "STR income eligible" },
      ],
    },
    {
      type: "faq",
      label: "Common questions",
      title: "Cash-out refi FAQ.",
      items: [
        {
          q: "Can I cash out on a property I own free and clear?",
          a: "Yes — a first-lien cash-out DSCR refi on a free-and-clear property is one of our most common requests. Max 75% LTV of appraised value.",
        },
        {
          q: "What if my DSCR is tight at the new loan balance?",
          a: "Try a lower cash-out amount, interest-only structure, or longer term. Near-DSCR (0.75–0.99x) may qualify with reduced LTV. Drop the address and we'll show live options.",
        },
        {
          q: "Can I cash out on a short-term rental (Airbnb) property?",
          a: "Yes — STR income via AirDNA or documented performance is accepted. LTV caps may be slightly lower than long-term rental.",
        },
        {
          q: "How long does a cash-out refi take to close?",
          a: "Median 14 calendar days from complete file. Appraisal and title ordered day one; underwriting runs in parallel.",
        },
      ],
    },
    {
      type: "cta",
      title: "See how much equity you can pull out.",
      lead: "Drop the address. We calculate your LTV ceiling, run the DSCR, and show cash-out available in 60 seconds.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
  ],
};
