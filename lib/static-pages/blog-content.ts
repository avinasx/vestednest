export type BlogArticle = {
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
};

export const BLOG_FEATURED = {
  tag: "Deep dive  ·  DSCR fundamentals",
  title: "What every LLC investor needs to know about",
  titleAccent: "DSCR before their first deal",
  excerpt:
    "From the ratio formula to rate drivers, prepay trade-offs, and why DSCR beats conventional for portfolio builders — a complete operator's guide.",
  author: "Viraj Bhalla",
  date: "June 2026",
  readTime: "12 min read",
  image: "/figma-assets/imgRectangle3.png",
};

export const BLOG_CATEGORIES = [
  "All",
  "DSCR basics",
  "Strategy",
  "Market analysis",
  "Bridge & BRRRR",
  "Foreign nationals",
  "Case studies",
] as const;

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    category: "DSCR basics",
    title: "DSCR vs. conventional: the honest comparison",
    excerpt:
      "Where DSCR wins, where it doesn't, and how to decide which product is right for your specific deal.",
    author: "Viraj Bhalla",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10804.png",
  },
  {
    category: "Bridge & BRRRR",
    title: "The BRRRR math: how to model a full cycle before you buy",
    excerpt:
      "Purchase price, renovation, ARV, DSCR exit at 75% ARV, equity recycled. A worked example with real numbers.",
    author: "Rishi Dutta",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10810.png",
  },
  {
    category: "Strategy",
    title: "Why the 14-day close is worth more than a lower rate",
    excerpt:
      "On a $400K bridge at 12%, every extra day costs $131. Here's how we calculated what a 31-day advantage is actually worth.",
    author: "Arvin Hallak",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10811.png",
  },
  {
    category: "Foreign nationals",
    title: "Step-by-step: how to buy a U.S. rental from outside the U.S.",
    excerpt:
      "Form the LLC, get the ITIN, open the bank account, drop the address. A timeline-by-timeline walkthrough for international investors.",
    author: "Viraj Bhalla",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10812.png",
  },
  {
    category: "Case study",
    title: "How a 5-door Memphis portfolio closed in 16 days with a blanket DSCR",
    excerpt:
      "Full deal breakdown: $840K blanket loan, blended 1.31x DSCR, $280K cash out, 4 properties under one loan. What made it work.",
    author: "Arvin Hallak",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10813.png",
  },
  {
    category: "Market analysis",
    title: "DSCR rates in 2026: what's driving spreads and where they're heading",
    excerpt:
      "10-year Treasury, MBS spreads, and how they combine to set DSCR pricing. What operators should watch to time their locks.",
    author: "Rishi Dutta",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10814.png",
  },
  {
    category: "Strategy",
    title: "How to use a DSCR cash-out to fund your next acquisition without selling anything",
    excerpt:
      "The equity recycling loop: pull cash from property A, use it as the down payment on property B. Repeat. Modeled out over 5 deals.",
    author: "Rishi Dutta",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10810.png",
  },
  {
    category: "DSCR basics",
    title: "Interest-only DSCR: when IO makes the deal work and when it doesn't",
    excerpt:
      "IO can turn a 0.94x deal into a 1.18x deal. But it costs you amortization. Here's how to model whether IO is worth the rate premium.",
    author: "Arvin Hallak",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10811.png",
  },
  {
    category: "DSCR basics",
    title: "From Australia to Atlanta: how a foreign national closed a U.S. rental in 18 days",
    excerpt:
      "Delaware LLC, ITIN, international wire. Full timeline and cost breakdown for an Australian investor buying their first U.S. rental property.",
    author: "Rishi Dutta",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10812.png",
  },
  {
    category: "Bridge & BRRRR",
    title: "The bridge calculator: understanding your daily bleed and why it matters",
    excerpt:
      "At 12%, $400K in bridge costs $131/day. Here's exactly how bridge interest compounds and what 31 fewer days means in dollar terms.",
    author: "Viraj Bhalla",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10813.png",
  },
  {
    category: "Market analysis",
    title: "The best markets for DSCR investors in 2026: where cash flow still works",
    excerpt:
      "Atlanta, Memphis, Tampa, Charlotte, Jacksonville — the markets where rent-to-price ratios still support 1.25x+ DSCR at current rates.",
    author: "Rishi Dutta",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10814.png",
  },
  {
    category: "Foreign nationals",
    title: "ITIN, EIN, LLC: the three acronyms every international real estate investor needs to know",
    excerpt:
      "What each one is, how to get it, how long it takes, and in what order to get them. The setup checklist for non-resident investors.",
    author: "Arvin Hallak",
    date: "June 14, 2026",
    readTime: "6 min read",
    image: "/figma-assets/imgImage10815.png",
  },
];

export const BLOG_NEWSLETTER = {
  label: "Stay current",
  title: "Operator intel, straight to your inbox.",
  lead:
    "New deal case studies, rate updates, and market analysis. Two emails a month. No spam. Unsubscribe any time.",
};

export const BLOG_CTA = {
  title: "Ready to quote",
  titleAccent: "a deal?",
  lead:
    "Drop an address. We pull the rent comps, run the DSCR, and get your rate all in under 30 seconds.",
  perks: ["No W2", "No DTI", "No hard pull", "14-day close"],
};
