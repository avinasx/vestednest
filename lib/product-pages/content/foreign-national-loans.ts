import type { ProductPageConfig } from "../types";

export const foreignNationalLoansPage: ProductPageConfig = {
  slug: "foreign-national-loans",
  meta: {
    title: "Foreign National Loans — Vested Nest",
    description:
      "DSCR loans for international investors buying U.S. rental properties through a U.S. LLC. No credit score. No tax returns. Close entirely remotely.",
  },
  sections: [
    {
      type: "hero",
      badge: "Now funding in 38 states",
      title: "No U.S. credit. No SSN.",
      titleAccent: "No problem.",
      lead: "DSCR loans for international investors buying U.S. rental properties through a U.S. LLC. No credit score. No tax returns. Close entirely remotely — wire and e-sign.",
      perks: ["No hard pull", "No W2", "No DTI", "60s to a term sheet"],
    },
    {
      type: "personas",
      label: "Who this is for",
      title: "Three types of international investors. One product.",
      lead: "Being specific here matters. If you see yourself in one of these scenarios, you're exactly who this product was built for.",
      items: [
        {
          title: "International HNW Investor",
          subtitle: "Building a U.S. rental portfolio from abroad",
          body: "Lives in the UK or Canada. Has capital to deploy. Wants to own cash-flowing U.S. rentals in their LLC. Told no by every conventional lender because they have no U.S. credit history and no SSN.",
        },
        {
          title: "Returning Expat",
          subtitle: "U.S. citizen or green card holder living abroad",
          body: "American living in Singapore or Germany. Wants to invest back in the U.S. market while abroad. Has a U.S. passport but hasn't filed a U.S. tax return in years. Foreign national DSCR works for them.",
        },
        {
          title: "Non-Resident with Existing U.S. Property",
          subtitle: "Looking to leverage equity or refinance",
          body: "Bought a U.S. property with cash or through a seller-finance deal. Now wants to pull equity out and redeploy, or refinance into permanent fixed-rate financing — without physically being in the U.S.",
        },
      ],
    },
    {
      type: "qualification",
      label: "Qualification",
      title: "No SSN. No U.S. credit. Here's what you do need.",
      yes: [
        {
          title: "U.S.-registered LLC",
          body: "Delaware or Wyoming LLCs are most common for foreign nationals. Takes 1–3 business days to form online. Cost: ~$150–$500. We can refer you to a registered agent.",
        },
        {
          title: "ITIN or Passport",
          body: "An Individual Taxpayer Identification Number (ITIN) is preferred. A passport is accepted in most cases. No SSN required.",
        },
        {
          title: "3 months bank statements",
          body: "From any bank, in any currency. We verify reserves (6 months of PITIA). International bank accounts are accepted. Wire transfers are fine.",
        },
        {
          title: "Property cash flow (DSCR ≥ 1.0x)",
          body: "Same standard as domestic borrowers. The property qualifies the loan. Our AI pulls rent comps from Rentcast and calculates DSCR automatically when you drop the address.",
        },
      ],
      no: [
        {
          title: "U.S. Social Security Number",
          body: "No SSN required at any stage.",
        },
        {
          title: "U.S. credit history",
          body: "No credit score required. The property is the credit.",
        },
        {
          title: "U.S. tax returns",
          body: "No Schedule E, no 1040, no business filings.",
        },
        {
          title: "U.S. employment",
          body: "Retired, self-employed, or employed abroad — irrelevant.",
        },
        {
          title: "Physical presence in the U.S.",
          body: "The entire process can be completed remotely. Closing is handled via wire and e-sign.",
        },
      ],
    },
    {
      type: "cards",
      label: "The remote close",
      title: "Close from anywhere. No U.S. trip required.",
      items: [
        {
          title: "E-sign the closing docs",
          body: "All closing documents are signed electronically. A notary is not required for most foreign national closings. Your attorney can review docs before you sign.",
        },
        {
          title: "Wire from any international account",
          body: "We accept international wire transfers for the down payment and closing costs. No currency conversion required on your end — wire in the amount we specify in USD.",
        },
        {
          title: "Property managed remotely too",
          body: "We can refer you to property management companies in our funded states. Most operators who close remotely use professional management — the rental income is deposited directly to your LLC account.",
        },
      ],
      columns: 3,
      bg: "white",
    },
    {
      type: "pipeline",
      label: "Funded pipeline",
      title: "Real foreign national deals.",
      deals: [
        {
          tag: "Foreign National DSCR",
          city: "Atlanta, GA",
          amount: "$224,000 @ 8.5%",
          caption: "Wyoming LLC borrower. Closed entirely remotely via e-sign and international wire.",
          stats: [
            { label: "Origin", value: "Australia" },
            { label: "LTV", value: "70%" },
            { label: "DSCR", value: "1.24x" },
            { label: "Closed in", value: "18 days" },
          ],
        },
        {
          tag: "Foreign National DSCR",
          city: "Jacksonville, FL",
          amount: "$196,000 @ 8.75%",
          caption: "No U.S. credit history. ITIN provided. Delaware LLC. 3rd property in U.S. portfolio.",
          stats: [
            { label: "Origin", value: "UK" },
            { label: "LTV", value: "68%" },
            { label: "DSCR", value: "1.19x" },
            { label: "Closed in", value: "21 days" },
          ],
        },
        {
          tag: "Foreign National Cash-Out",
          city: "Charlotte, NC",
          amount: "$280,000 @ 9.0%",
          caption: "Cash-out refi on existing U.S. property. Proceeds wired internationally. No SSN.",
          stats: [
            { label: "Origin", value: "Canada" },
            { label: "Cash out", value: "$80K" },
            { label: "DSCR", value: "1.21x" },
            { label: "Closed in", value: "20 days" },
          ],
        },
      ],
    },
    {
      type: "faq",
      label: "Common questions",
      title: "Foreign national FAQ.",
      items: [
        {
          q: "Which countries are eligible?",
          a: "We fund foreign nationals from most countries. OFAC-sanctioned jurisdictions are excluded. Drop an address or contact us for country-specific guidance.",
        },
        {
          q: "Is an LLC absolutely required?",
          a: "Yes for foreign national borrowers. The U.S. LLC is the borrower of record and provides liability protection.",
        },
        {
          q: "How do I get an ITIN?",
          a: "Apply through the IRS (Form W-7) or work with a CPA who handles international clients. Processing typically takes 7–11 weeks; passport-only closings are available in many cases.",
        },
        {
          q: "Can I use a foreign trust or offshore entity instead of a U.S. LLC?",
          a: "The borrower must be a U.S.-registered entity. Offshore structures can own the U.S. LLC, but the LLC must be the named borrower on the note.",
        },
        {
          q: "What if I already own a U.S. property?",
          a: "Cash-out and rate-term refis are available on stabilized properties. Seasoning and LTV rules apply — drop the address for a live quote.",
        },
        {
          q: "Can I use short-term rental (STR) income to qualify?",
          a: "Yes — AirDNA or documented STR income is accepted on eligible property types.",
        },
        {
          q: "How long does the full process take?",
          a: "LLC formation: 1–3 days. Loan close: median 18–21 days for foreign national files with complete documentation.",
        },
        {
          q: "Do I need a U.S. bank account?",
          a: "Not required at application. A U.S. LLC bank account is recommended for rental deposits and reserves — we can refer banking partners.",
        },
      ],
    },
    {
      type: "cta",
      title: "Get your foreign national",
      titleAccent: "DSCR quote.",
      lead: "Drop the address. We pull the comps, run the DSCR, and put rate + payment on screen. No SSN. No U.S. credit check.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
  ],
};
