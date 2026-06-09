import { NextResponse } from "next/server";
import { parsedFromSuggestion } from "@/lib/address";
import {
  ADDRESS_KIND,
  resolveInteraction,
  resolveInteractionSelection,
  toClientInteraction,
} from "@/lib/chat-interactions";
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
  /** Follow-up when user picks from needs_selection */
  interactionKind?: string;
  optionId?: string;
  optionMeta?: Record<string, unknown>;
};

export async function POST(request: Request) {
  let body: InquiryPayload;

  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.interactionKind && body.optionId) {
    const interaction = await resolveInteractionSelection(
      body.interactionKind,
      body.optionId,
      body.optionMeta,
    );
    const clientInteraction = toClientInteraction(interaction);

    if (interaction.status === "needs_selection") {
      return NextResponse.json({
        status: "needs_selection",
        message: interaction.message,
        interaction: clientInteraction,
        addressSuggestions: interaction.options,
      });
    }

    if (interaction.status !== "success" && interaction.status !== "blocked") {
      return NextResponse.json(
        {
          status: interaction.status,
          message: interaction.message,
          interaction: clientInteraction,
        },
        { status: interaction.status === "invalid_input" ? 400 : 404 },
      );
    }

    const addrData = interaction.data as {
      intel?: { raw?: Record<string, unknown>; state?: string; addressLine?: string; city?: string | null; zip?: string | null };
      formattedAddress?: string;
    };
    const realieProperty =
      interaction.status === "success" ? (addrData?.intel?.raw ?? null) : null;

    if (interaction.status === "blocked") {
      return NextResponse.json({
        status: "blocked",
        message: interaction.message,
        interaction: clientInteraction,
        property: null,
      });
    }

    const parsed = parsedFromSuggestion({
      streetAddress: addrData?.intel?.addressLine ?? body.address,
      city: addrData?.intel?.city ?? null,
      county: null,
      state: addrData?.intel?.state ?? "FL",
      zip: addrData?.intel?.zip ?? null,
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        realie_error: null,
        status: "property_found",
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
      status: "property_found",
      message: interaction.message,
      interaction: clientInteraction,
      property: realieProperty,
      inquiryId: inquiry?.id,
    });
  }

  const state =
    body.structuredAddress?.state ??
    body.address.match(/\b([A-Z]{2})\b/)?.[1] ??
    "FL";

  const interaction = await resolveInteraction(ADDRESS_KIND, {
    address: body.address,
    state,
    enrichRent: Boolean(body.selectedProperty || body.structuredAddress),
  });

  const clientInteraction = toClientInteraction(interaction);

  if (interaction.status === "needs_selection") {
    return NextResponse.json({
      status: "needs_selection",
      message: interaction.message,
      interaction: clientInteraction,
      addressSuggestions: interaction.options,
    });
  }

  if (
    interaction.status === "not_found" ||
    interaction.status === "invalid_input"
  ) {
    return NextResponse.json(
      {
        status: interaction.status,
        message: interaction.message,
        interaction: clientInteraction,
        error: interaction.message,
      },
      { status: 400 },
    );
  }

  if (interaction.status === "error") {
    return NextResponse.json(
      {
        status: "error",
        message: interaction.message,
        interaction: clientInteraction,
        error: interaction.message,
      },
      { status: 502 },
    );
  }

  if (interaction.status === "blocked") {
    return NextResponse.json({
      status: "blocked",
      message: interaction.message,
      interaction: clientInteraction,
      property: null,
    });
  }

  const parsed = body.structuredAddress
    ? parsedFromSuggestion(body.structuredAddress)
    : parsedFromSuggestion({
        streetAddress: body.address.split(",")[0]?.trim() ?? body.address,
        city: null,
        county: null,
        state,
        zip: null,
      });

  let realieProperty: Record<string, unknown> | null =
    body.selectedProperty && typeof body.selectedProperty === "object"
      ? body.selectedProperty
      : null;

  if (!realieProperty) {
    const data = interaction.data as {
      intel?: { raw?: Record<string, unknown> };
    };
    realieProperty = data?.intel?.raw ?? null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
      realie_error: realieProperty ? null : interaction.message,
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
    message: interaction.message,
    interaction: clientInteraction,
    property: realieProperty,
    realieError: realieProperty ? null : interaction.message,
    inquiryId: inquiry?.id,
  });
}
