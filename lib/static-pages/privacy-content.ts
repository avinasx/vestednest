export type PrivacyBlock =
  | { type: "paragraphs"; items: string[] }
  | { type: "list"; intro?: string; items: string[] }
  | { type: "subsection"; title: string; body: string }
  | { type: "subsections"; items: { title: string; body: string }[] };

export type PrivacySection = {
  id: string;
  title: string;
  blocks: PrivacyBlock[];
};

export const PRIVACY_HERO = {
  badge: "Last updated: June 2026",
  title: "VestedNest",
  titleAccent: "Privacy Policy",
  lead:
    "How Vested Nest collects, uses, and protects your information. We keep it plain English — no 40-page legal maze.",
};

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    blocks: [
      {
        type: "paragraphs",
        items: [
          'Vested Nest ("Vested Nest," "we," "us," or "our") is an agentic DSCR financing platform. We operate vestednest.ai and provide DSCR loan brokerage services for residential and commercial investment properties in the United States.',
          "Our registered address is in New York, NY. For privacy inquiries, contact us at viraj@theagentfactory.io.",
          "Business-purpose loans only. All loans facilitated through Vested Nest are business-purpose loans made to entity borrowers (LLCs or similar). Consumer lending laws (including certain consumer privacy protections) may not apply. We explain what does apply below.",
        ],
      },
    ],
  },
  {
    id: "what-we-collect",
    title: "What information we collect",
    blocks: [
      {
        type: "list",
        intro: "2.1 Information you give us",
        items: [
          "Property address (to generate your DSCR quote)",
          "Self-reported FICO range (no hard pull at this stage)",
          "Borrower type selection (LLC, individual, foreign national)",
          "Email address (only if you choose to save your term sheet)",
          "Phone number (only if you request a call)",
          "Entity documents, bank statements, and other documents you upload during the pre-qualification process",
        ],
      },
      {
        type: "list",
        intro: "2.2 Information we collect automatically",
        items: [
          "IP address and general location (state/city, not street address)",
          "Browser type, device type, and operating system",
          "Pages visited, time on site, and actions taken (e.g., term sheet downloaded)",
          "Referral source (how you found us)",
        ],
      },
      {
        type: "list",
        intro: "2.3 Information from third parties",
        items: [
          "Rentcast AVM data — when you enter a property address, we query the Rentcast API to retrieve rent estimates, comparable rentals, property attributes, and market trend data for that address. This data is used solely to generate your DSCR quote.",
          "Credit bureau data — only if you explicitly authorize a soft credit pull during pre-qualification. We do not run a hard inquiry without your written consent.",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    blocks: [
      {
        type: "list",
        intro: "We use the information we collect to:",
        items: [
          "Generate your DSCR quote, term sheet, and loan proposal",
          "Underwrite and process your loan application",
          "Communicate with you about your loan status",
          "Improve our AI models and quote accuracy (using aggregated, de-identified data)",
          "Send you information about relevant products if you've opted in",
          "Comply with legal obligations and prevent fraud",
        ],
      },
      {
        type: "paragraphs",
        items: [
          "We do not sell your personal information to third parties. We do not use your data to train general-purpose AI models outside of our own quote-generation system.",
        ],
      },
    ],
  },
  {
    id: "who-we-share",
    title: "Who we share your information with",
    blocks: [
      {
        type: "subsections",
        items: [
          {
            title: "4.1 Wholesale lenders and investors",
            body: "To originate your loan, we share necessary application information with the wholesale lenders and institutional investors in our network. This sharing is required to process your loan and is governed by confidentiality agreements.",
          },
          {
            title: "4.2 Service providers",
            body: "We use third-party service providers to operate our platform, including: Rentcast (rent data), Zoho CRM (contact management), cloud hosting providers, and email delivery services. These providers access your data only as necessary to provide services to us and are contractually required to protect it.",
          },
          {
            title: "4.3 Legal requirements",
            body: "We may disclose your information if required by law, court order, or regulatory authority — for example, to comply with a subpoena or respond to a government request.",
          },
          {
            title: "4.4 Business transfers",
            body: "If Vested Nest is acquired, merged, or its assets are sold, your information may be transferred to the acquiring entity. We will provide notice before this occurs.",
          },
        ],
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies & tracking",
    blocks: [
      {
        type: "paragraphs",
        items: [
          "We use cookies and similar tracking technologies to operate our website and improve your experience. Specifically:",
        ],
      },
      {
        type: "list",
        items: [
          "Essential cookies — required for the site to function (session management, security). Cannot be disabled.",
          "Analytics cookies — we use anonymous analytics to understand how users interact with the site (e.g., which pages are visited, where users drop off). You can opt out via your browser settings.",
          "Marketing cookies — only set if you've engaged with a paid ad. Used to measure campaign effectiveness. You can opt out via standard browser controls or the IAB opt-out mechanism.",
        ],
      },
      {
        type: "paragraphs",
        items: [
          "We do not use advertising pixels from social media platforms on pages where you've entered personal loan information.",
        ],
      },
    ],
  },
  {
    id: "retention",
    title: "How long we keep your information",
    blocks: [
      {
        type: "list",
        items: [
          "Quote data (address, FICO range, term sheet) — 90 days if you don't proceed with a loan application",
          "Loan application data — 7 years after the loan closes or is declined, as required by federal lending regulations",
          "Email address (if you opted in to communications) — until you unsubscribe",
          "Analytics data — 26 months in aggregate, anonymized form",
        ],
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    blocks: [
      {
        type: "list",
        intro: "Depending on your location, you may have the following rights regarding your personal information:",
        items: [
          "Access — request a copy of the information we hold about you",
          "Correction — ask us to correct inaccurate information",
          "Deletion — request that we delete your information (subject to legal retention requirements)",
          "Opt-out — opt out of marketing communications at any time via the unsubscribe link in any email or by contacting us directly",
          "Data portability — receive your data in a machine-readable format",
        ],
      },
      {
        type: "paragraphs",
        items: [
          'To exercise any of these rights, email viraj@theagentfactory.io with the subject line "Privacy Request." We respond within 30 days.',
          "California residents: Under CCPA, you have additional rights including the right to know what personal information is collected, the right to opt out of the sale of personal information (we don't sell it), and the right to non-discrimination for exercising your rights.",
        ],
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    blocks: [
      {
        type: "list",
        intro: "We use industry-standard security measures to protect your information, including:",
        items: [
          "TLS encryption for all data in transit",
          "Encrypted storage for sensitive documents",
          "Access controls limiting who within our team can view personal data",
          "Regular security reviews of our infrastructure and third-party providers",
        ],
      },
      {
        type: "paragraphs",
        items: [
          "No system is 100% secure. If you believe your information has been compromised, contact us immediately at viraj@theagentfactory.io.",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    blocks: [
      {
        type: "paragraphs",
        items: [
          "For any privacy questions, requests, or concerns:",
          "Email: viraj@theagentfactory.io",
          "Phone: +1 (516) 661-9018",
          'Please include "Privacy Request" in the subject line for data-related inquiries.',
        ],
      },
    ],
  },
];

export const PRIVACY_NAV = PRIVACY_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
