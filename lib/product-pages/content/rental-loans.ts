import type { ProductPageConfig } from "../types";

export const rentalLoansPage: ProductPageConfig = {
  slug: "rental-loans",
  meta: {
    title: "Rental Property Loans — Vested Nest",
    description:
      "DSCR rental loans for operators who own through LLCs. SFR to small multifamily — the property qualifies, not your W2.",
  },
  sections: [
    {
      type: "hero",
      badge: "Now funding in 38 states",
      title: "Built for operators who",
      titleAccent: "LLCs.",
      lead: "Whether it's your first rental or your fifteenth, the underwrite doesn't change. The property qualifies. Your W2 doesn't factor in.",
      perks: ["No hard pull", "No W2", "No DTI", "60s to a term sheet"],
    },
    {
      type: "journey",
      label: "The operator journey",
      title: "Built for the whole journey. Not just deal one.",
      lead: "Most lenders want to fund your first rental. We want to fund your first, your tenth, and your thirtieth. The underwrite doesn't change as you scale — the property always does the qualifying.",
      steps: [
        {
          title: "First rental",
          body: "Single SFR or duplex. Standard DSCR. LLC setup recommended.",
        },
        {
          title: "Portfolio building",
          body: "Loans 2–10. Each deal underwritten on its own cash flow. No personal income check.",
        },
        {
          title: "Blanket loans",
          body: "5+ properties, one loan. Simplify servicing, consolidate equity, unlock BIFI add-ons.",
        },
        {
          title: "At scale",
          body: "No loan count ceiling. No personal income review. The portfolio qualifies itself.",
        },
      ],
    },
    {
      type: "spectrum",
      label: "Product spectrum",
      title: "SFR to small commercial. One underwrite model.",
      items: [
        {
          tab: "Single-Family Rental",
          title: "SFR · 1 unit",
          body: "The core product. One address, one tenant, one DSCR calculation. From a $100K entry-level rental to a $1.5M luxury SFR.",
          specs: [
            { label: "Loan range", value: "$100K – $2M" },
            { label: "Max LTV", value: "80% purchase" },
            { label: "Min DSCR", value: "1.0x" },
            { label: "STR eligible", value: "Yes" },
          ],
        },
        {
          tab: "Small Multi-family",
          title: "2–4 units",
          body: "Duplex, triplex, or fourplex. DSCR calculated on combined rental income across all units. Strong cash flow typically makes these easy to qualify.",
          specs: [
            { label: "Loan range", value: "$100K – $2M" },
            { label: "Max LTV", value: "80% purchase" },
            { label: "Min DSCR", value: "1.0x" },
            { label: "STR eligible", value: "Yes" },
          ],
        },
        {
          tab: "Small Balance Commercial",
          title: "5–10 units",
          body: "Small apartment buildings and mixed portfolios. Blended rent roll DSCR across units. BIFI blanket options available at 5+ doors.",
          specs: [
            { label: "Loan range", value: "$250K – $5M" },
            { label: "Max LTV", value: "75% purchase" },
            { label: "Min DSCR", value: "1.0x" },
            { label: "STR eligible", value: "Case-by-case" },
          ],
        },
      ],
    },
    {
      type: "cards",
      label: "Advanced product",
      title: "Own through an LLC.",
      lead: "Asset protection through entity separation",
      items: [
        {
          title: "",
          body: "When you own rental properties through an LLC, a lawsuit against one property can't pierce the entity wall to reach your personal assets — or assets in a different LLC. This is the fundamental reason operators use LLCs.",
        },
        {
          title: "",
          body: "Conventional mortgages can't accommodate this — Fannie Mae requires personal borrowers. DSCR is designed for it. The entity is the borrower.",
        },
      ],
      columns: 2,
      bg: "muted",
    },
    {
      type: "timeline",
      label: "Entity docs",
      title: "What entity docs you'll need",
      steps: [
        {
          time: "1",
          title: "LLC Operating Agreement",
          body: "Or trust agreement / articles of organization. Shows ownership structure and authority to borrow.",
        },
        {
          time: "2",
          title: "EIN (Employer ID Number)",
          body: "The entity's tax ID. Required for title and closing. Takes a few days to get from the IRS if you don't have one.",
        },
        {
          time: "3",
          title: "Certificate of Good Standing",
          body: "Some investors require this to confirm the LLC is active and in good standing in its state of registration.",
        },
        {
          time: "4",
          title: "That's it. No W2. No tax returns.",
          body: "The entity documents replace the personal income stack that conventional loans require.",
        },
      ],
    },
    {
      type: "pipeline",
      label: "Funded pipeline",
      title: "Real rental deals.",
      deals: [
        {
          tag: "DSCR + BIFI",
          city: "Nashville, TN",
          amount: "$972,000 @ 7.5%",
          caption: "5-door portfolio refi. Blanket DSCR + BIFI add-on. Single LLC borrower.",
          stats: [
            { label: "Units", value: "5 doors" },
            { label: "Blended DSCR", value: "1.32x" },
            { label: "Cash flow", value: "$425/mo" },
            { label: "Closed in", value: "16 days" },
          ],
        },
        {
          tag: "DSCR Purchase",
          city: "Tampa, FL",
          amount: "$415,000 @ 7.75%",
          caption: "New build SFR. Out-of-state LLC borrower. No W2. Funded under target close.",
          stats: [
            { label: "Type", value: "SFR 4bd" },
            { label: "Rent", value: "$3,100/mo" },
            { label: "DSCR", value: "1.28x" },
            { label: "Days", value: "13" },
          ],
        },
        {
          tag: "Portfolio Cash-Out",
          city: "Memphis, TN",
          amount: "$840,000 @ 8.5%",
          caption: "4-property blanket cash-out refi. Proceeds used to fund two new acquisitions.",
          stats: [
            { label: "Properties", value: "4 SFRs" },
            { label: "Blended DSCR", value: "1.38x" },
            { label: "Cash out", value: "$210K" },
            { label: "Closed in", value: "18 days" },
          ],
        },
      ],
    },
    {
      type: "faq",
      label: "Common questions",
      title: "Rental loan FAQ.",
      items: [
        {
          q: "Can a foreign national LLC borrow for a rental property?",
          a: "Yes — see our Foreign National Loans product. U.S. LLC, ITIN or passport, and international bank statements are accepted.",
        },
        {
          q: "Can I finance multiple properties in one loan?",
          a: "Yes — BIFI blanket financing is available for portfolios of 5+ properties with blended DSCR underwriting.",
        },
        {
          q: "Can I use short-term rental income (Airbnb/VRBO) to qualify?",
          a: "Yes. AirDNA projections or documented STR performance are accepted on SFR and 2–4 unit properties.",
        },
        {
          q: "What's the minimum DSCR for a multi-family property?",
          a: "1.0x standard across all product types. Near-DSCR from 0.75x available with LTV reduction.",
        },
        {
          q: "Is there a limit on how many loans I can have with Vested Nest?",
          a: "No loan count ceiling. Each property is underwritten on its own cash flow.",
        },
        {
          q: "Do condos qualify?",
          a: "Yes — warrantable and non-warrantable condos are eligible. LTV may be capped on non-warrantable.",
        },
      ],
    },
    {
      type: "cta",
      title: "Quote your rental.",
      titleAccent: "Any property type.",
      lead: "Drop an address — SFR, duplex, or small multifamily. We pull the comps, run the DSCR, and quote your rate in 60 seconds.",
      perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
    },
  ],
};
