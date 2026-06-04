import { NextResponse } from "next/server";
import { parseUsAddress } from "@/lib/address";
import { lookupProperty } from "@/lib/realie";
import { createClient } from "@/lib/supabase/server";
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
};

export async function POST(request: Request) {
  let body: InquiryPayload;

  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseUsAddress(body.address);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          'Enter a full US address (e.g. "123 Main St, Sarasota, FL 34236").',
      },
      { status: 400 },
    );
  }

  let realieProperty: Record<string, unknown> | null = null;
  let realieError: string | null = null;

  try {
    const realie = await lookupProperty(parsed);
    realieProperty = realie.property;
    realieError = realie.error;
  } catch (err) {
    realieError =
      err instanceof Error ? err.message : "Realie property lookup failed";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("loan_inquiries")
    .insert({
      user_id: user?.id ?? null,
      loan_strategy: body.loanStrategy,
      street_address: parsed.streetAddress,
      city: parsed.city,
      county: parsed.county,
      state: parsed.state,
      unit_number: parsed.unitNumber,
      down_payment_pct: body.downPaymentPct,
      fico_band: body.ficoBand,
      intended_horizon: body.intendedHorizon,
      borrower_type: body.borrowerType,
      realie_property: realieProperty as Json,
      realie_error: realieError,
      status: realieProperty ? "property_found" : "submitted",
    })
    .select("id, realie_property, realie_error, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inquiryId: data.id,
    status: data.status,
    property: data.realie_property,
    realieError: data.realie_error,
  });
}
