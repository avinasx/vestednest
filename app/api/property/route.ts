import { NextResponse } from "next/server";
import { parseUsAddress, parsedFromSuggestion } from "@/lib/address";
import { calculateTermSheetAsync } from "@/lib/dscr";
import { checkRateLimit } from "@/lib/rate-limit";
import { buildPropertyIntel, enrichPropertyIntel, formatAddress } from "@/lib/property-intel";
import { ensureServerSettings } from "@/lib/settings";
import {
  lookupProperty,
  searchAddressSuggestions,
  searchNearbyProperties,
} from "@/lib/realie";

export async function GET(request: Request) {
  const limited = checkRateLimit(request, "/api/property", 30);
  if (limited) return limited;

  await ensureServerSettings();

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") ?? "";
  const state = searchParams.get("state") ?? "";

  if (!address.trim()) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const parsed = parseUsAddress(address);
    if (parsed) {
      const result = await lookupProperty(parsed);
      if (result.property) {
        const nearby = await searchNearbyProperties(result.property, 4);
        const intel = await enrichPropertyIntel(
          buildPropertyIntel(result.property, nearby),
        );
        const termSheet = await calculateTermSheetAsync({
          purchasePrice: intel.arv || intel.marketValue || 300000,
          downPaymentPct: 25,
          monthlyRent: intel.estimatedRent,
          annualTax: intel.annualTax ?? 3000,
          purpose: "purchase",
          term: "30yr",
          prepay: "3yr",
          interestOnly: false,
          state: intel.state,
        });
        return NextResponse.json({
          intel,
          formattedAddress: formatAddress(intel),
          termSheet,
          source: result.source,
        });
      }
    }

    if (!state || state.length !== 2) {
      return NextResponse.json(
        { error: "Could not parse address — include city and state (e.g. Cascade Rd Atlanta GA)" },
        { status: 400 },
      );
    }

    const search = await searchAddressSuggestions(address, state, 5);
    const first = search.suggestions[0];
    if (!first) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const intel = await enrichPropertyIntel(
      buildPropertyIntel(
        first.property,
        await searchNearbyProperties(first.property, 4),
      ),
    );
    const termSheet = await calculateTermSheetAsync({
      purchasePrice: intel.arv || intel.marketValue || 300000,
      downPaymentPct: 25,
      monthlyRent: intel.estimatedRent,
      annualTax: intel.annualTax ?? 3000,
      purpose: "purchase",
      term: "30yr",
      prepay: "3yr",
      interestOnly: false,
      state: intel.state,
    });

    return NextResponse.json({
      intel,
      formattedAddress: formatAddress(intel),
      termSheet,
      source: "search",
      suggestion: parsedFromSuggestion(first),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Property lookup failed" },
      { status: 500 },
    );
  }
}
