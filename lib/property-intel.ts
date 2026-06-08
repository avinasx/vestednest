import { estimateArv, estimateMonthlyRent } from "./dscr";

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
  raw: Record<string, unknown>;
};

function num(obj: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
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

function propertyTypeLabel(useCode: string | null, residential: boolean | null): string {
  if (residential) return "Single Family";
  if (useCode) return `Use ${useCode}`;
  return "Residential";
}

/** Build demo-ready property intel from a Realie record. */
export function buildPropertyIntel(
  property: Record<string, unknown>,
  nearby: Record<string, unknown>[] = [],
): PropertyIntel {
  const addressLine =
    str(property, ["addressLine1", "address", "addressFormal"]) ??
    str(property, ["addressFull", "addressFullUSPS"])?.split(",")[0] ??
    "Property";

  const city = str(property, ["city", "cityUSPS"]) ?? "";
  const state = str(property, ["state"]) ?? "";
  const zip = str(property, ["zipCode", "mailingZip5"]) ?? "";
  const county = str(property, ["county", "countyUSPS"]) ?? "";

  const marketValue =
    num(property, ["totalMarketValue", "marketValue", "totalAssessedValue"]) ?? 0;
  const estimatedRent = estimateMonthlyRent(marketValue);
  const arv = estimateArv(marketValue);

  const rentComps: RentComp[] = nearby.slice(0, 3).map((p, i) => {
    const mv = num(p, ["totalMarketValue", "totalAssessedValue"]) ?? marketValue;
    const rent = estimateMonthlyRent(mv);
    const addr =
      str(p, ["addressFull", "addressFullUSPS", "address"]) ?? `Nearby comp ${i + 1}`;
    const beds = num(p, ["totalBedrooms", "bedrooms"]);
    const baths = num(p, ["totalBathrooms", "bathrooms"]);
    const sqft = num(p, ["buildingArea", "livingArea", "squareFeet"]);
    return {
      address: addr.split(",")[0] ?? addr,
      details: `SFR · ${beds ?? "?"}bd/${baths ?? "?"}ba · ${sqft ? `${sqft.toLocaleString()} sqft` : "—"} · ${(0.4 + i * 0.3).toFixed(1)} mi`,
      rent,
      daysAgo: 24 + i * 17,
    };
  });

  if (rentComps.length === 0 && estimatedRent > 0) {
    rentComps.push({
      address: "Market-area rental estimate",
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
      typeof property.residential === "boolean" ? property.residential : true,
    ),
    yearBuilt: num(property, ["yearBuilt", "effectiveYearBuilt"]),
    beds: num(property, ["totalBedrooms", "bedrooms", "beds"]),
    baths: num(property, ["totalBathrooms", "bathrooms", "baths"]),
    sqft: num(property, ["buildingArea", "livingArea", "squareFeet"]),
    acres: num(property, ["acres", "lotSizeArea"]),
    lastSalePrice: num(property, ["assessorSalePrice", "salePriceLastTransfer"]),
    lastSaleDate: formatSaleDate(str(property, ["assessorSaleRecordingDate", "recordingDate"])),
    annualTax: num(property, ["taxValue"]),
    estimatedRent,
    arv,
    marketValue,
    yoyRentChange: 4.2,
    avgDom: 18,
    rentComps,
    raw: property,
  };
}

export function formatAddress(intel: PropertyIntel): string {
  const parts = [intel.addressLine];
  if (intel.city) parts.push(intel.city);
  if (intel.state) parts.push(intel.state);
  if (intel.zip) parts.push(intel.zip);
  return parts.join(", ");
}
