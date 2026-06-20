export const PRODUCT_ROUTES = {
  dscrLoans: {
    href: "/dscr-loans",
    label: "DSCR Loans",
    shortLabel: "DSCR loans",
  },
  bridgeLoans: {
    href: "/bridge-loans",
    label: "Bridge Loans",
    shortLabel: "Bridge loans",
  },
  cashOutRefi: {
    href: "/cash-out-refi",
    label: "Cash-Out Refinance",
    shortLabel: "Cash-out refi",
  },
  rentalLoans: {
    href: "/rental-loans",
    label: "Rental Property Loans",
    shortLabel: "Rental loans",
  },
  foreignNational: {
    href: "/foreign-national-loans",
    label: "Foreign National Loans",
    shortLabel: "Foreign national",
  },
} as const;

export const PRODUCT_FOOTER_LINKS = [
  PRODUCT_ROUTES.dscrLoans,
  PRODUCT_ROUTES.bridgeLoans,
  PRODUCT_ROUTES.cashOutRefi,
  PRODUCT_ROUTES.rentalLoans,
  PRODUCT_ROUTES.foreignNational,
] as const;
