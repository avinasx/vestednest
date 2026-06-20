import type { PrivacySection } from "../types";

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "Who we are",
    paragraphs: [
      'Vested Nest ("Vested Nest," "we," "us," or "our") is an agentic DSCR financing platform. We operate vestednest.ai and provide DSCR loan brokerage services for residential and commercial investment properties in the United States. Our registered address is in New York, NY. For privacy inquiries, contact us at viraj@theagentfactory.io.',
      "Business-purpose loans only. All loans facilitated through Vested Nest are business-purpose loans made to entity borrowers (LLCs or similar). Consumer lending laws (including certain consumer privacy protections) may not apply. We explain what does apply below.",
    ],
  },
  {
    title: "What information we collect",
    paragraphs: [],
    subsections: [
      {
        title: "2.1 Information you give us",
        body: "Property address (to generate your DSCR quote) · Self-reported FICO range (no hard pull at this stage) · Borrower type selection (LLC, individual, foreign national) · Email address (only if you choose to save your term sheet) · Phone number (only if you request a call) · Entity documents, bank statements, and other documents you upload during the pre-qualification process",
      },
      {
        title: "2.2 Information we collect automatically",
        body: "IP address and general location (state/city, not street address) · Browser type, device type, and operating system · Pages visited, time on site, and actions taken (e.g., term sheet downloaded) · Referral source (how you found us)",
      },
      {
        title: "2.3 Information from third parties",
        body: "Rentcast AVM data — when you enter a property address, we query the Rentcast API to retrieve rent estimates, comparable rentals, property attributes, and market trend data for that address. This data is used solely to generate your DSCR quote. Credit bureau data — only if you explicitly authorize a soft credit pull during pre-qualification. We do not run a hard inquiry without your written consent.",
      },
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "We use the information we collect to:",
      "Generate your DSCR quote, term sheet, and loan proposal · Underwrite and process your loan application · Communicate with you about your loan status · Improve our AI models and quote accuracy (using aggregated, de-identified data) · Send you information about relevant products if you've opted in · Comply with legal obligations and prevent fraud",
      "We do not sell your personal information to third parties. We do not use your data to train general-purpose AI models outside of our own quote-generation system.",
    ],
  },
  {
    title: "Who we share your information with",
    paragraphs: [],
    subsections: [
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
  {
    title: "Cookies & tracking",
    paragraphs: [
      "We use cookies and similar tracking technologies to operate our website and improve your experience. Specifically:",
      "Essential cookies — required for the site to function (session management, security). Cannot be disabled. · Analytics cookies — we use anonymous analytics to understand how users interact with the site. You can opt out via your browser settings. · Marketing cookies — only set if you've engaged with a paid ad. Used to measure campaign effectiveness.",
      "We do not use advertising pixels from social media platforms on pages where you've entered personal loan information.",
    ],
  },
  {
    title: "How long we keep your information",
    paragraphs: [
      "Quote data (address, FICO range, term sheet) — 90 days if you don't proceed with a loan application · Loan application data — 7 years after the loan closes or is declined, as required by federal lending regulations · Email address (if you opted in to communications) — until you unsubscribe · Analytics data — 26 months in aggregate, anonymized form",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "Depending on your location, you may have the following rights regarding your personal information:",
      "Access — request a copy of the information we hold about you · Correction — ask us to correct inaccurate information · Deletion — request that we delete your information (subject to legal retention requirements) · Opt-out — opt out of marketing communications at any time · Data portability — receive your data in a machine-readable format",
      'To exercise any of these rights, email viraj@theagentfactory.io with the subject line "Privacy Request." We respond within 30 days.',
      "California residents: Under CCPA, you have additional rights including the right to know what personal information is collected, the right to opt out of the sale of personal information (we don't sell it), and the right to non-discrimination for exercising your rights.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "We use industry-standard security measures to protect your information, including:",
      "TLS encryption for all data in transit · Encrypted storage for sensitive documents · Access controls limiting who within our team can view personal data · Regular security reviews of our infrastructure and third-party providers",
      "No system is 100% secure. If you believe your information has been compromised, contact us immediately at viraj@theagentfactory.io",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      "For any privacy questions, requests, or concerns:",
      "Email: viraj@theagentfactory.io · Phone: +1 (516) 661-9018 · Subject line: \"Privacy Request\" helps us route quickly",
      'We reserve the right to update this policy as our practices evolve or as required by law. The "Last updated" date at the top of this page reflects when the most recent change was made. We\'ll notify active users of material changes by email.',
    ],
  },
];
