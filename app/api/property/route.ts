import { NextResponse } from "next/server";
import { parseUsAddress, parsedFromSuggestion } from "@/lib/address";
import { calculateTermSheet } from "@/lib/dscr";
import { buildPropertyIntel, formatAddress } from "@/lib/property-intel";
import { lookupProperty, searchAddressSuggestions } from "@/lib/realie";

export async function GET(request: Request) {
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
        const nearby = await searchAddressSuggestions(
          parsed.streetAddress,
          parsed.state,
          4,
        );
        const intel = buildPropertyIntel(
          result.property,
          nearby.suggestions.map((s) => s.property),
        );
        const termSheet = calculateTermSheet({
          purchasePrice: intel.arv || intel.marketValue || 300000,
          downPaymentPct: 25,
          monthlyRent: intel.estimatedRent,
          annualTax: intel.annualTax ?? 3000,
          purpose: "purchase",
          term: "30yr",
          prepay: "3yr",
          interestOnly: false,
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
        { error: "Could not parse address — include city, state, and ZIP" },
        { status: 400 },
      );
    }

    const search = await searchAddressSuggestions(address, state, 5);
    const first = search.suggestions[0];
    if (!first) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const intel = buildPropertyIntel(
      first.property,
      search.suggestions.slice(1).map((s) => s.property),
    );
    const termSheet = calculateTermSheet({
      purchasePrice: intel.arv || intel.marketValue || 300000,
      downPaymentPct: 25,
      monthlyRent: intel.estimatedRent,
      annualTax: intel.annualTax ?? 3000,
      purpose: "purchase",
      term: "30yr",
      prepay: "3yr",
      interestOnly: false,
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
