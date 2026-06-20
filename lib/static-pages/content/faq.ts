import type { FaqCategory } from "../types";

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    "id": "dscr-basics",
    "label": "DSCR basics",
    "description": "Understanding what DSCR is and how it works",
    "count": 28,
    "items": [
      {
        "q": "What does DSCR stand for and what does it mean?",
        "a": "DSCR stands for Debt Service Coverage Ratio \u2014 monthly rent divided by monthly PITIA (principal, interest, taxes, insurance, and association dues). A ratio of 1.0x means the property earns exactly enough to cover its debt payment."
      },
      {
        "q": "How is DSCR different from a conventional mortgage?",
        "a": "Conventional loans qualify the borrower on W2 income and DTI. DSCR loans qualify the property on cash flow. No tax returns, no employment verification, and LLC borrowers are the default."
      },
      {
        "q": "Is DSCR only for experienced investors?",
        "a": "No. First-time rental investors with strong property cash flow qualify the same way as portfolio builders."
      },
      {
        "q": "What is a \"business-purpose loan\" and why does it matter?",
        "a": "DSCR loans are business-purpose loans to entity borrowers for investment properties. They sit outside TRID and RESPA consumer rules \u2014 which is why we can show live rates on screen in 60 seconds."
      },
      {
        "q": "Can DSCR loans be used for short-term rentals (Airbnb/VRBO)?",
        "a": "Yes. We accept AirDNA projections or documented STR income."
      },
      {
        "q": "What is a No-Ratio DSCR loan?",
        "a": "A No-Ratio DSCR loan allows qualification below 1.0x DSCR (typically 0.75\u20130.99x) with reduced LTV caps."
      },
      {
        "q": "Is Vested Nest a direct lender or a broker?",
        "a": "Vested Nest originates through a network of wholesale lenders and institutional investors. You work with one team from quote through close."
      }
    ]
  },
  {
    "id": "qualifying",
    "label": "Qualifying",
    "description": "Who qualifies and what you need to apply",
    "count": 15,
    "items": [
      {
        "q": "What's the minimum DSCR to qualify?",
        "a": "Standard qualification is 1.0x DSCR. Near-DSCR programs may apply at 0.75\u20130.99x with reduced LTV."
      },
      {
        "q": "Is an LLC required?",
        "a": "LLC is strongly preferred and our default structure. Foreign nationals must vest through a U.S. LLC."
      },
      {
        "q": "Do I need a minimum credit score?",
        "a": "Minimum FICO requirements vary by program \u2014 typically 660+ for standard DSCR."
      },
      {
        "q": "Do I need to show a lease or rental history?",
        "a": "No executed lease is required at quote. We use market rent comps (Rentcast) for the DSCR calculation."
      },
      {
        "q": "What reserves are required?",
        "a": "Typically 6 months PITIA in liquid assets, verified at underwriting."
      },
      {
        "q": "Can I be self-employed and still qualify?",
        "a": "Yes. DSCR does not use personal income or employment."
      },
      {
        "q": "Can I get a DSCR loan on a property I already own?",
        "a": "Yes \u2014 for rate-and-term or cash-out refinance on stabilized rentals."
      },
      {
        "q": "Is there a limit on how many DSCR loans I can have?",
        "a": "No Fannie Mae 10-loan ceiling. Portfolio builders routinely finance deal 11, 12, and beyond."
      },
      {
        "q": "What entity documents do I need?",
        "a": "Operating agreement, EIN letter, and certificate of formation for your LLC."
      }
    ]
  },
  {
    "id": "rates-terms",
    "label": "Rates & terms",
    "description": "How pricing, points, and loan structure work",
    "count": 12,
    "items": [
      {
        "q": "How is my DSCR rate determined?",
        "a": "Rate is driven by LTV, DSCR ratio, FICO, loan amount, property type, prepay selection, and current market spreads."
      },
      {
        "q": "What are current DSCR rates?",
        "a": "Drop an address on our homepage for a live quote reflecting today's pricing."
      },
      {
        "q": "How does the prepayment penalty work?",
        "a": "You choose at quote: no prepay, 3-year, or 5-year. Longer prepay periods typically buy a lower rate."
      },
      {
        "q": "Is interest-only available and how does it affect the rate?",
        "a": "Yes \u2014 IO periods are available on most products at a modest rate adjustment."
      },
      {
        "q": "What origination fees should I expect?",
        "a": "Origination typically runs 1.0\u20132.0 points, reflected in your live quote."
      },
      {
        "q": "What loan amounts are available?",
        "a": "$100,000 to $5,000,000 on standard programs."
      },
      {
        "q": "Are there points on top of the origination fee?",
        "a": "Points and origination are shown transparently in your live term sheet."
      }
    ]
  },
  {
    "id": "process-timeline",
    "label": "Process & timeline",
    "description": "From address to closed loan",
    "count": 10,
    "items": [
      {
        "q": "How does the 60-second term sheet actually work?",
        "a": "Drop a property address. Nest AI pulls Rentcast rent comps and renders rate, points, and PITIA on screen."
      },
      {
        "q": "How accurate is the 60-second quote?",
        "a": "The quote is indicative based on self-reported FICO and current rate sheet pricing."
      },
      {
        "q": "What happens after I submit for pre-qualification?",
        "a": "A loan officer reviews your file and coordinates docs and closing. Median close is 14 days."
      },
      {
        "q": "Do you do a hard credit pull? When?",
        "a": "Soft pull only for pre-qualification. Hard pull occurs only when you authorize it."
      },
      {
        "q": "Can I really close in 14 days? What could delay it?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I lock my rate and how long does a rate lock last?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I close remotely?",
        "a": "Yes. E-sign and wire transfer supported."
      }
    ]
  },
  {
    "id": "property-types",
    "label": "Property types",
    "description": "Eligible properties and state coverage",
    "count": 7,
    "items": [
      {
        "q": "What property types are eligible for DSCR financing?",
        "a": "SFR, 2\u20134 unit, 5\u201310 unit, warrantable and non-warrantable condos."
      },
      {
        "q": "Are condos eligible?",
        "a": "Yes \u2014 both warrantable and non-warrantable condos, subject to program LTV caps."
      },
      {
        "q": "Can I finance a new construction property?",
        "a": "Stabilized new construction qualifies. Ground-up typically requires bridge financing first."
      },
      {
        "q": "What about mixed-use properties?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "What states do you fund in?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I finance multiple properties under one loan?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      }
    ]
  },
  {
    "id": "bridge-loans",
    "label": "Bridge loans",
    "description": "Bridge-to-DSCR and short-term financing",
    "count": 6,
    "items": [
      {
        "q": "What's the difference between a bridge loan and a DSCR loan?",
        "a": "Bridge is short-term for acquisition or rehab. DSCR is long-term based on stabilized rental income."
      },
      {
        "q": "Can I definitely exit my bridge into Vested Nest's DSCR product?",
        "a": "Yes \u2014 bridge-to-DSCR is a core workflow with the same team handling your exit."
      },
      {
        "q": "No prepay penalty after 6 months - what does that mean exactly?",
        "a": "On bridge-to-DSCR exits, the new permanent loan has no prepayment penalty after 6 months."
      },
      {
        "q": "Does Vested Nest do ground-up construction loans?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Is a personal guaranty required on a bridge loan?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "How quickly can a bridge loan close?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      }
    ]
  },
  {
    "id": "foreign-nationals",
    "label": "Foreign nationals",
    "description": "International investors and U.S. LLCs",
    "count": 7,
    "items": [
      {
        "q": "Which countries are eligible?",
        "a": "Most countries are eligible for foreign national DSCR with a U.S. LLC."
      },
      {
        "q": "Why does a foreign national need a U.S. LLC?",
        "a": "U.S. investment property financing for non-residents requires entity vesting."
      },
      {
        "q": "Do I need an ITIN to get a DSCR loan as a foreign national?",
        "a": "ITIN or valid identification path depends on program."
      },
      {
        "q": "Can I use a foreign trust or offshore holding company instead of a U.S. LLC?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I close the loan without visiting the U.S.?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Do I need a U.S. bank account to close?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "How long does a foreign national DSCR loan take to close?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "What does DSCR stand for and what does it mean?",
        "a": "DSCR stands for Debt Service Coverage Ratio \u2014 monthly rent divided by monthly PITIA (principal, interest, taxes, insurance, and association dues). A ratio of 1.0x means the property earns exactly enough to cover its debt payment."
      },
      {
        "q": "How is DSCR different from a conventional mortgage?",
        "a": "Conventional loans qualify the borrower on W2 income and DTI. DSCR loans qualify the property on cash flow. No tax returns, no employment verification, and LLC borrowers are the default."
      },
      {
        "q": "Is DSCR only for experienced investors?",
        "a": "No. First-time rental investors with strong property cash flow qualify the same way as portfolio builders."
      },
      {
        "q": "What is a \"business-purpose loan\" and why does it matter?",
        "a": "DSCR loans are business-purpose loans to entity borrowers for investment properties. They sit outside TRID and RESPA consumer rules \u2014 which is why we can show live rates on screen in 60 seconds."
      },
      {
        "q": "Can DSCR loans be used for short-term rentals (Airbnb/VRBO)?",
        "a": "Yes. We accept AirDNA projections or documented STR income."
      },
      {
        "q": "What is a No-Ratio DSCR loan?",
        "a": "A No-Ratio DSCR loan allows qualification below 1.0x DSCR (typically 0.75\u20130.99x) with reduced LTV caps."
      },
      {
        "q": "Is Vested Nest a direct lender or a broker?",
        "a": "Vested Nest originates through a network of wholesale lenders and institutional investors. You work with one team from quote through close."
      },
      {
        "q": "What's the minimum DSCR to qualify?",
        "a": "Standard qualification is 1.0x DSCR. Near-DSCR programs may apply at 0.75\u20130.99x with reduced LTV."
      },
      {
        "q": "Is an LLC required?",
        "a": "LLC is strongly preferred and our default structure. Foreign nationals must vest through a U.S. LLC."
      },
      {
        "q": "Do I need a minimum credit score?",
        "a": "Minimum FICO requirements vary by program \u2014 typically 660+ for standard DSCR."
      },
      {
        "q": "Do I need to show a lease or rental history?",
        "a": "No executed lease is required at quote. We use market rent comps (Rentcast) for the DSCR calculation."
      },
      {
        "q": "What reserves are required?",
        "a": "Typically 6 months PITIA in liquid assets, verified at underwriting."
      },
      {
        "q": "Can I be self-employed and still qualify?",
        "a": "Yes. DSCR does not use personal income or employment."
      },
      {
        "q": "Can I get a DSCR loan on a property I already own?",
        "a": "Yes \u2014 for rate-and-term or cash-out refinance on stabilized rentals."
      },
      {
        "q": "Is there a limit on how many DSCR loans I can have?",
        "a": "No Fannie Mae 10-loan ceiling. Portfolio builders routinely finance deal 11, 12, and beyond."
      },
      {
        "q": "What entity documents do I need?",
        "a": "Operating agreement, EIN letter, and certificate of formation for your LLC."
      },
      {
        "q": "How is my DSCR rate determined?",
        "a": "Rate is driven by LTV, DSCR ratio, FICO, loan amount, property type, prepay selection, and current market spreads."
      },
      {
        "q": "What are current DSCR rates?",
        "a": "Drop an address on our homepage for a live quote reflecting today's pricing."
      },
      {
        "q": "How does the prepayment penalty work?",
        "a": "You choose at quote: no prepay, 3-year, or 5-year. Longer prepay periods typically buy a lower rate."
      },
      {
        "q": "Is interest-only available and how does it affect the rate?",
        "a": "Yes \u2014 IO periods are available on most products at a modest rate adjustment."
      },
      {
        "q": "What origination fees should I expect?",
        "a": "Origination typically runs 1.0\u20132.0 points, reflected in your live quote."
      },
      {
        "q": "What loan amounts are available?",
        "a": "$100,000 to $5,000,000 on standard programs."
      },
      {
        "q": "Are there points on top of the origination fee?",
        "a": "Points and origination are shown transparently in your live term sheet."
      },
      {
        "q": "How does the 60-second term sheet actually work?",
        "a": "Drop a property address. Nest AI pulls Rentcast rent comps and renders rate, points, and PITIA on screen."
      },
      {
        "q": "How accurate is the 60-second quote?",
        "a": "The quote is indicative based on self-reported FICO and current rate sheet pricing."
      },
      {
        "q": "What happens after I submit for pre-qualification?",
        "a": "A loan officer reviews your file and coordinates docs and closing. Median close is 14 days."
      },
      {
        "q": "Do you do a hard credit pull? When?",
        "a": "Soft pull only for pre-qualification. Hard pull occurs only when you authorize it."
      },
      {
        "q": "Can I really close in 14 days? What could delay it?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I lock my rate and how long does a rate lock last?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I close remotely?",
        "a": "Yes. E-sign and wire transfer supported."
      },
      {
        "q": "What property types are eligible for DSCR financing?",
        "a": "SFR, 2\u20134 unit, 5\u201310 unit, warrantable and non-warrantable condos."
      },
      {
        "q": "Are condos eligible?",
        "a": "Yes \u2014 both warrantable and non-warrantable condos, subject to program LTV caps."
      },
      {
        "q": "Can I finance a new construction property?",
        "a": "Stabilized new construction qualifies. Ground-up typically requires bridge financing first."
      },
      {
        "q": "What about mixed-use properties?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "What states do you fund in?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Can I finance multiple properties under one loan?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "What's the difference between a bridge loan and a DSCR loan?",
        "a": "Bridge is short-term for acquisition or rehab. DSCR is long-term based on stabilized rental income."
      },
      {
        "q": "Can I definitely exit my bridge into Vested Nest's DSCR product?",
        "a": "Yes \u2014 bridge-to-DSCR is a core workflow with the same team handling your exit."
      },
      {
        "q": "No prepay penalty after 6 months - what does that mean exactly?",
        "a": "On bridge-to-DSCR exits, the new permanent loan has no prepayment penalty after 6 months."
      },
      {
        "q": "Does Vested Nest do ground-up construction loans?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "Is a personal guaranty required on a bridge loan?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      },
      {
        "q": "How quickly can a bridge loan close?",
        "a": "Contact us at viraj@theagentfactory.io or drop a property address on our homepage."
      }
    ]
  }
];
