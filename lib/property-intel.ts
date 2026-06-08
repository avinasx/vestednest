import { estimateArv, estimateMonthlyRent } from "./dscr";
import { enrichFromRentCast, formatRentCastAddress, type RentCastEnrichment } from "./rentcast";
import { propertyHasUsefulData } from "./realie";

export type RentComp = {
  address: string;
  details: string;
  rent: number;
  daysAgo: number;
};

export type PropertyIntel = {
  addressLine: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  propertyType: string;
  yearBuilt: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  acres: number | null;
  lastSalePrice: number | null;
  lastSaleDate: string | null;
  annualTax: number | null;
  estimatedRent: number;
  arv: number;
  marketValue: number;
  yoyRentChange: number;
  avgDom: number;
  rentComps: RentComp[];
  rentSource: "realie" | "rentcast" | "derived";
  raw: Record<string, unknown>;
};

function num(
  obj: Record<string, unknown>,
  keys: string[],
  opts?: { positiveOnly?: boolean },
): number | null {
  for (const key of keys) {
    const v = obj[key];
    let n: number | null = null;
    if (typeof v === "number" && !Number.isNaN(v)) n = v;
    else if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) {
      n = Number(v);
    }
    if (n === null) continue;
    if (opts?.positiveOnly && n <= 0) continue;
    return n;
  }
  return null;
}

function str(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function resolveAddressLine(property: Record<string, unknown>): string {
  const line1 = str(property, ["addressLine1", "address", "addressFormal"]);
  if (line1 && !/^0\s+[A-Z]/i.test(line1)) return line1;

  const numPart =
    typeof property.streetNumber === "string" ? property.streetNumber : "";
  const street = typeof property.street === "string" ? property.street : "";
  if (street) {
    const combined = `${numPart} ${street}`.trim();
    if (combined && !/^0\s+[A-Z]/i.test(combined)) return combined;
  }

  const full = str(property, ["addressFullUSPS", "addressFull"]);
  if (full) {
    const streetPart = full.split(",")[0]?.trim() ?? full;
    if (!/^0\s+[A-Z]/i.test(streetPart)) return streetPart;
  }

  return line1 ?? "Property";
}

function resolveMarketValue(property: Record<string, unknown>): number {
  const market = num(property, ["totalMarketValue", "marketValue"], {
    positiveOnly: true,
  });
  if (market) return market;

  const assessed = num(property, ["totalAssessedValue", "assessedValue"], {
    positiveOnly: true,
  });
  if (assessed) return assessed;

  const building = num(property, ["assessedBuildingValue", "totalBuildingValue"], {
    positiveOnly: true,
  });
  const land = num(property, ["assessedLandValue", "totalLandValue"], {
    positiveOnly: true,
  });
  if ((building ?? 0) + (land ?? 0) > 0) {
    return (building ?? 0) + (land ?? 0);
  }

  return 0;
}

function compAddress(p: Record<string, unknown>): string {
  const full = str(p, ["addressFullUSPS", "addressFull"]);
  if (full) {
    const parts = full.split(",").map((s) => s.trim());
    if (parts[0] && !/^0\s+[A-Z]/i.test(parts[0])) {
      return parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : parts[0];
    }
  }
  return str(p, ["addressLine1", "address"]) ?? "Nearby comp";
}

function formatSaleDate(raw: string | null): string | null {
  if (!raw) return null;
  if (/^\d{8}$/.test(raw)) {
    const y = raw.slice(0, 4);
    const m = raw.slice(4, 6);
    const d = raw.slice(6, 8);
    const date = new Date(`${y}-${m}-${d}`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  }
  return raw;
}

function propertyTypeLabel(
  useCode: string | null,
  residential: boolean | null,
  sqft: number | null,
): string {
  if (sqft && sqft > 0 && residential !== false) return "Single Family";
  if (residential) return "Single Family";
  if (useCode) return `Use ${useCode}`;
  return "Residential";
}

function applyRentCastEnrichment(
  intel: PropertyIntel,
  enrichment: RentCastEnrichment,
): PropertyIntel {
  if (!enrichment.source) return intel;

  let { estimatedRent, marketValue, arv, rentComps, rentSource } = intel;

  if (enrichment.estimatedRent && enrichment.estimatedRent > 0) {
    if (!estimatedRent || estimatedRent <= 0 || rentSource === "derived") {
      estimatedRent = enrichment.estimatedRent;
      rentSource = "rentcast";
    }
  }

  if ((!marketValue || marketValue <= 0) && enrichment.marketValue) {
    marketValue = enrichment.marketValue;
    arv = estimateArv(marketValue);
    if (!estimatedRent || estimatedRent <= 0) {
      estimatedRent = estimateMonthlyRent(marketValue);
      rentSource = "derived";
    }
  }

  if (enrichment.rentComps.length > 0) {
    rentComps = enrichment.rentComps;
  }

  const subject = enrichment.subjectProperty;
  if (subject) {
    if (subject.formattedAddress) {
      const street = subject.formattedAddress.split(",")[0]?.trim();
      if (street && !/^0\s+[A-Z]/i.test(street)) {
        intel = {
          ...intel,
          addressLine: street,
          city: subject.city ?? intel.city,
          state: subject.state ?? intel.state,
          zip: subject.zipCode ?? intel.zip,
          county: subject.county ?? intel.county,
        };
      }
    }
    if (!intel.beds && subject.bedrooms) intel = { ...intel, beds: subject.bedrooms };
    if (!intel.baths && subject.bathrooms) intel = { ...intel, baths: subject.bathrooms };
    if (!intel.sqft && subject.squareFootage) intel = { ...intel, sqft: subject.squareFootage };
    if (!intel.yearBuilt && subject.yearBuilt) intel = { ...intel, yearBuilt: subject.yearBuilt };
    if (!intel.lastSalePrice && subject.lastSalePrice) {
      intel = { ...intel, lastSalePrice: subject.lastSalePrice };
    }
    if (subject.propertyType) intel = { ...intel, propertyType: subject.propertyType };
  }

  return { ...intel, estimatedRent, marketValue, arv, rentComps, rentSource };
}

/** Build demo-ready property intel from a Realie record. */
export function buildPropertyIntel(
  property: Record<string, unknown>,
  nearby: Record<string, unknown>[] = [],
): PropertyIntel {
  const addressLine = resolveAddressLine(property);

  const city = str(property, ["city", "cityUSPS"]) ?? "";
  const state = str(property, ["state"]) ?? "";
  const zip = str(property, ["zipCode", "mailingZip5"]) ?? "";
  const county = str(property, ["county", "countyUSPS"]) ?? "";

  const sqft = num(property, ["buildingArea", "livingArea", "squareFeet"], {
    positiveOnly: true,
  });
  const marketValue = resolveMarketValue(property);
  const estimatedRent = estimateMonthlyRent(marketValue);
  const arv = estimateArv(marketValue);

  const usefulNearby = nearby.filter(propertyHasUsefulData);

  const rentComps: RentComp[] = usefulNearby.slice(0, 3).map((p, i) => {
    const mv = resolveMarketValue(p) || marketValue;
    const rent = estimateMonthlyRent(mv);
    const beds = num(p, ["totalBedrooms", "bedrooms"], { positiveOnly: true });
    const baths = num(p, ["totalBathrooms", "bathrooms"], { positiveOnly: true });
    const compSqft = num(p, ["buildingArea", "livingArea", "squareFeet"], {
      positiveOnly: true,
    });
    return {
      address: compAddress(p),
      details: `SFR · ${beds ?? "?"}bd/${baths ?? "?"}ba · ${compSqft ? `${compSqft.toLocaleString()} sqft` : "—"} · ${(0.4 + i * 0.3).toFixed(1)} mi`,
      rent,
      daysAgo: 24 + i * 17,
    };
  });

  if (rentComps.length === 0 && estimatedRent > 0) {
    rentComps.push({
      address: zip ? `Market rentals near ${zip}` : "Market-area rental estimate",
      details: "Derived from comparable market values in zip",
      rent: estimatedRent,
      daysAgo: 30,
    });
  }

  return {
    addressLine,
    city,
    state,
    zip,
    county,
    propertyType: propertyTypeLabel(
      str(property, ["useCode"]),
      typeof property.residential === "boolean" ? property.residential : null,
      sqft,
    ),
    yearBuilt: num(property, ["yearBuilt", "effectiveYearBuilt"], {
      positiveOnly: true,
    }),
    beds: num(property, ["totalBedrooms", "bedrooms", "beds"], {
      positiveOnly: true,
    }),
    baths: num(property, ["totalBathrooms", "bathrooms", "baths"], {
      positiveOnly: true,
    }),
    sqft,
    acres: num(property, ["acres"], { positiveOnly: true }),
    lastSalePrice: num(property, ["assessorSalePrice", "salePriceLastTransfer"], {
      positiveOnly: true,
    }),
    lastSaleDate: formatSaleDate(str(property, ["assessorSaleRecordingDate", "recordingDate"])),
    annualTax: num(property, ["taxValue"], { positiveOnly: true }),
    estimatedRent,
    arv,
    marketValue,
    yoyRentChange: 4.2,
    avgDom: 18,
    rentComps,
    rentSource: estimatedRent > 0 ? "derived" : "realie",
    raw: property,
  };
}

/** Enrich Realie intel with RentCast rent/value when data is missing or weak. */
export async function enrichPropertyIntel(intel: PropertyIntel): Promise<PropertyIntel> {
  const needsRent =
    !intel.estimatedRent || intel.estimatedRent <= 0 || intel.rentSource === "derived";
  const needsValue = !intel.marketValue || intel.marketValue <= 0;
  const hasRealComps = intel.rentComps.some(
    (c) => c.rent > 0 && !c.details.includes("Derived from comparable market values"),
  );
  const needsComps = !hasRealComps;

  const address =
    formatRentCastAddress({
      street: intel.addressLine,
      city: intel.city,
      state: intel.state,
      zip: intel.zip,
    }) ?? formatAddress(intel);

  try {
    const enrichment = await enrichFromRentCast(address, {
      bedrooms: intel.beds,
      bathrooms: intel.baths,
      sqft: intel.sqft,
    });
    return applyRentCastEnrichment(intel, enrichment);
  } catch {
    return intel;
  }
}

export function formatAddress(intel: PropertyIntel): string {
  const parts = [intel.addressLine];
  if (intel.city) parts.push(intel.city);
  const stateZip = [intel.state, intel.zip].filter(Boolean).join(" ").trim();
  if (stateZip) parts.push(stateZip);
  return parts.join(", ");
}
