type PropertySummaryProps = {
  property: Record<string, unknown>;
};

function pickString(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

export function PropertySummary({ property }: PropertySummaryProps) {
  const address = pickString(property, [
    "address",
    "streetAddress",
    "siteAddress",
    "fullAddress",
  ]);
  const city = pickString(property, ["city", "siteCity"]);
  const state = pickString(property, ["state", "siteState"]);
  const beds = pickString(property, ["bedrooms", "beds", "bedroomCount"]);
  const baths = pickString(property, ["bathrooms", "baths", "bathroomCount"]);
  const sqft = pickString(property, [
    "buildingArea",
    "livingArea",
    "squareFeet",
    "sqft",
  ]);
  const value = pickString(property, [
    "assessedValue",
    "marketValue",
    "totalValue",
    "avm",
  ]);
  const yearBuilt = pickString(property, ["yearBuilt", "effectiveYearBuilt"]);

  const rows = [
    ["Address", [address, city, state].filter(Boolean).join(", ") || null],
    ["Beds / Baths", beds || baths ? `${beds ?? "—"} / ${baths ?? "—"}` : null],
    ["Sq ft", sqft],
    ["Assessed / market", value],
    ["Year built", yearBuilt],
  ].filter(([, v]) => v);

  if (rows.length === 0) {
    return (
      <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-[#f3f3f3] p-4 text-xs text-black/80">
        {JSON.stringify(property, null, 2)}
      </pre>
    );
  }

  return (
    <dl className="mt-4 grid gap-2 rounded-lg border border-vn-green/20 bg-vn-green/5 p-4 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4">
          <dt className="font-medium text-black/60">{label}</dt>
          <dd className="text-right text-black">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
