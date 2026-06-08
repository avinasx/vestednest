import { NextResponse } from "next/server";
import { parseUsAddress, parsedFromSuggestion } from "@/lib/address";
import { lookupProperty, searchAddressSuggestions } from "@/lib/realie";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  BorrowerType,
  InvestmentHorizon,
  Json,
  LoanStrategy,
} from "@/types/database";

export type InquiryPayload = {
  loanStrategy: LoanStrategy;
  address: string;
  downPaymentPct: number | null;
  ficoBand: string;
  intendedHorizon: InvestmentHorizon;
  borrowerType: BorrowerType;
  selectedProperty?: Record<string, unknown> | null;
  structuredAddress?: {
    streetAddress: string;
    city: string | null;
    county: string | null;
    state: string;
    zip: string | null;
  } | null;
};

export async function POST(request: Request) {
  let body: InquiryPayload;

  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = body.structuredAddress
    ? parsedFromSuggestion(body.structuredAddress)
    : parseUsAddress(body.address);

  if (!parsed) {
    return NextResponse.json(
      {
        error:
          'Select an address from the suggestions or enter a full US address (e.g. "123 Main St, Sarasota, FL 34236").',
      },
      { status: 400 },
    );
  }

  let realieProperty: Record<string, unknown> | null = null;
  let realieError: string | null = null;

  if (
    body.selectedProperty &&
    typeof body.selectedProperty === "object" &&
    Object.keys(body.selectedProperty).length > 0
  ) {
    realieProperty = body.selectedProperty;
  } else {
    try {
      const realie = await lookupProperty(parsed);
      realieProperty = realie.property;
      realieError = realie.error;

      if (!realieProperty) {
        const { suggestions } = await searchAddressSuggestions(
          body.address,
          parsed.state,
          1,
        );
        if (suggestions[0]) {
          realieProperty = suggestions[0].property;
          realieError = null;
        }
      }
    } catch (err) {
      realieError =
        err instanceof Error ? err.message : "Realie property lookup failed";
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const writer = createServiceClient() ?? supabase;

  const { data: inquiry, error: insertError } = await writer
    .from("loan_inquiries")
    .insert({
      user_id: user?.id ?? null,
      loan_strategy: body.loanStrategy,
      street_address: parsed.streetAddress,
      city: parsed.city,
      county: parsed.county,
      state: parsed.state,
      unit_number: parsed.unitNumber,
      country: "US",
      down_payment_pct: body.downPaymentPct,
      fico_band: body.ficoBand,
      intended_horizon: body.intendedHorizon,
      borrower_type: body.borrowerType,
      realie_property: realieProperty as Json,
      realie_error: realieError,
      status: realieProperty ? "property_found" : "submitted",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("loan_inquiries insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to save inquiry" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: realieProperty ? "property_found" : "submitted",
    property: realieProperty,
    realieError,
    inquiryId: inquiry?.id,
  });
}
