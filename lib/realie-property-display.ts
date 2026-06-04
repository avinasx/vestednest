export type PropertyDisplayRow = {
  label: string;
  value: string;
};

export type PropertyDisplaySection = {
  title: string;
  rows: PropertyDisplayRow[];
};

function pick(
  obj: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && !Number.isNaN(value)) return formatNumber(value, key);
    if (typeof value === "boolean") return value ? "Yes" : "No";
  }
  return null;
}

function formatNumber(n: number, key: string): string {
  const moneyKeys =
    /value|tax|price|ltv|assessed|market|land|building/i.test(key) &&
    !/year|count|area|rate/i.test(key);
  if (moneyKeys && Math.abs(n) >= 100) {
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }
  if (/area|acres|frontage|depth|latitude|longitude/i.test(key)) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  return String(n);
}

function section(
  title: string,
  rows: (PropertyDisplayRow | null)[],
): PropertyDisplaySection | null {
  const filtered = rows.filter((r): r is PropertyDisplayRow => r !== null);
  if (filtered.length === 0) return null;
  return { title, rows: filtered };
}

function row(
  label: string,
  obj: Record<string, unknown>,
  keys: string[],
): PropertyDisplayRow | null {
  const value = pick(obj, keys);
  return value ? { label, value } : null;
}

/** Human-readable rows from a Realie property search / address record. */
export function buildRealiePropertySections(
  property: Record<string, unknown>,
): PropertyDisplaySection[] {
  const address =
    pick(property, [
      "addressFull",
      "addressFullUSPS",
      "addressFormal",
      "addressLine1",
      "address",
      "addressRaw",
    ]) ?? null;

  const locationLine = [
    pick(property, ["city", "cityUSPS"]),
    pick(property, ["state"]),
    pick(property, ["zipCode", "mailingZip5"]),
  ]
    .filter(Boolean)
    .join(", ");

  return [
    section("Property", [
      address ? { label: "Address", value: address } : null,
      locationLine ? { label: "Location", value: locationLine } : null,
      row("County", property, ["county", "countyUSPS"]),
      row("Parcel ID", property, ["parcelId", "state_parcelIdSTD", "state_parcelId"]),
      row("Site ID", property, ["siteId"]),
      row("Use code", property, ["useCode"]),
      row("Residential", property, ["residential"]),
      row("Condo", property, ["condo"]),
    ]),
    section("Ownership", [
      row("Owner", property, ["ownerName"]),
      row("Owner address", property, ["ownerAddressFull", "ownerAddressLine1"]),
      row("Owner city / state", property, ["ownerCity", "ownerState"]),
      row("Owner ZIP", property, ["ownerZipCode", "ownerZipCodePlusFour"]),
    ]),
    section("Structure", [
      row("Bedrooms", property, ["totalBedrooms", "bedrooms", "beds"]),
      row("Bathrooms", property, ["totalBathrooms", "bathrooms", "baths"]),
      row("Buildings", property, ["buildingCount"]),
      row("Building sq ft", property, ["buildingArea", "livingArea", "squareFeet"]),
      row("Garage", property, ["garage", "garageCount"]),
      row("Pool", property, ["pool"]),
    ]),
    section("Lot", [
      row("Acres", property, ["acres", "lotSizeArea"]),
      row("Land area (sq ft)", property, ["landArea"]),
      row("Frontage", property, ["frontage"]),
      row("Depth", property, ["depthSize"]),
      row("Neighborhood", property, ["neighborhood"]),
      row("Block / tract", property, ["blockNum", "tractNum"]),
    ]),
    section("Valuation & tax", [
      row("Total assessed", property, [
        "totalAssessedValue",
        "assessedValue",
      ]),
      row("Assessed building", property, ["assessedBuildingValue", "totalBuildingValue"]),
      row("Assessed land", property, ["assessedLandValue", "totalLandValue"]),
      row("Market value", property, ["totalMarketValue", "marketValue"]),
      row("Assessed year", property, ["assessedYear", "marketValueYear"]),
      row("Annual tax", property, ["taxValue"]),
      row("Tax year", property, ["taxYear"]),
      row("LTV (purchase est.)", property, ["LTVPurchase"]),
      row("LTV (current est.)", property, ["LTVCurrentEstCombined"]),
    ]),
    section("Sales & records", [
      row("Last assessor sale", property, ["assessorSalePrice"]),
      row("Sale recording date", property, ["assessorSaleRecordingDate"]),
    ]),
    section("Legal & coordinates", [
      row("Legal description", property, ["legalDesc"]),
      row("Latitude", property, ["latitude"]),
      row("Longitude", property, ["longitude"]),
    ]),
  ].filter((s): s is PropertyDisplaySection => s !== null);
}
