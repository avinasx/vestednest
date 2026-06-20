export type FaqCategory = {
  id: string;
  label: string;
  count: number;
  description: string;
  questions: string[];
};

export const FAQ_HERO = {
  badge: "60+ questions answered",
  title: "Frequently asked",
  titleAccent: "questions",
  lead:
    "Plain English. No deflection. If the answer isn't here, email viraj@theagentfactory.io and we'll add it.",
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "dscr-basics",
    label: "DSCR basics",
    count: 8,
    description: "Understanding what DSCR is and how it works",
    questions: [
      "What does DSCR stand for and what does it mean?",
      "How is DSCR different from a conventional mortgage?",
      "Is DSCR only for experienced investors?",
      'What is a "business-purpose loan" and why does it matter?',
      "What is PITIA?",
      "Can DSCR loans be used for short-term rentals (Airbnb/VRBO)?",
      "What is a No-Ratio DSCR loan?",
      "Is Vested Nest a direct lender or a broker?",
    ],
  },
  {
    id: "qualifying",
    label: "Qualifying",
    count: 9,
    description: "Who qualifies, what you need, and what you don't",
    questions: [
      "What's the minimum DSCR to qualify?",
      "Is an LLC required?",
      "Do I need a minimum credit score?",
      "Do I need to show a lease or rental history?",
      "What reserves are required?",
      "Can I be self-employed and still qualify?",
      "Can I get a DSCR loan on a property I already own?",
      "Is there a limit on how many DSCR loans I can have?",
      "What entity documents do I need?",
    ],
  },
  {
    id: "rates-terms",
    label: "Rates & terms",
    count: 7,
    description: "Pricing, prepay, and loan structure",
    questions: [
      "How is my DSCR rate determined?",
      "What are current DSCR rates?",
      "How does the prepayment penalty work?",
      "Is interest-only available and how does it affect the rate?",
      "What origination fees should I expect?",
      "What loan amounts are available?",
      "Are there points on top of the origination fee?",
    ],
  },
  {
    id: "process-timeline",
    label: "Process & timeline",
    count: 7,
    description: "From first address to closed loan",
    questions: [
      "How does the 60-second term sheet actually work?",
      "How accurate is the 60-second quote?",
      "What happens after I submit for pre-qualification?",
      "Do you do a hard credit pull? When?",
      "Can I really close in 14 days? What could delay it?",
      "Can I lock my rate and how long does a rate lock last?",
      "Can I close remotely?",
    ],
  },
  {
    id: "property-types",
    label: "Property types",
    count: 6,
    description: "What types of properties we finance",
    questions: [
      "What property types are eligible for DSCR financing?",
      "Are condos eligible?",
      "Can I finance a new construction property?",
      "What about mixed-use properties?",
      "What states do you fund in?",
      "Can I finance multiple properties under one loan?",
    ],
  },
  {
    id: "bridge-loans",
    label: "Bridge loans",
    count: 6,
    description: "Short-term capital and the DSCR exit",
    questions: [
      "What's the difference between a bridge loan and a DSCR loan?",
      "Can I definitely exit my bridge into Vested Nest's DSCR product?",
      "No prepay penalty after 6 months - what does that mean exactly?",
      "Does Vested Nest do ground-up construction loans?",
      "Is a personal guaranty required on a bridge loan?",
      "How quickly can a bridge loan close?",
    ],
  },
  {
    id: "foreign-nationals",
    label: "Foreign nationals",
    count: 7,
    description: "International investors buying U.S. rental properties",
    questions: [
      "Which countries are eligible?",
      "Why does a foreign national need a U.S. LLC?",
      "Do I need an ITIN to get a DSCR loan as a foreign national?",
      "Can I use a foreign trust or offshore holding company instead of a U.S. LLC?",
      "Can I close the loan without visiting the U.S.?",
      "Do I need a U.S. bank account to close?",
      "How long does a foreign national DSCR loan take to close?",
    ],
  },
];

export const FAQ_CTA = {
  title: "Still have a question?",
  titleAccent: "We pick up the phone.",
  lead: "Or drop an address and see your rate in 60 seconds — no account, no hard pull.",
  email: "viraj@theagentfactory.io",
  phone: "+1 (516) 661-9018",
};
