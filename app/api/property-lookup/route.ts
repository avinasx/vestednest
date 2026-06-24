import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADDRESS_KIND,
  propertyFromInteraction,
  resolveInteraction,
  resolveInteractionSelection,
  toClientInteraction,
} from "@/lib/chat-interactions";
import { evaluateFundingLane } from "@/lib/eligibility/matrix";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureServerSettings } from "@/lib/settings";

const postSchema = z.object({
  address: z.string().optional(),
  state: z.string().optional(),
  optionId: z.string().optional(),
  optionMeta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/property-lookup", 30);
  if (limited) return limited;

  await ensureServerSettings();

  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { address, state = "GA", optionId, optionMeta } = parsed.data;

    if (!address?.trim() && !optionId) {
      return NextResponse.json({ status: "not_found", error: "address is required" }, { status: 400 });
    }

    let interaction;
    if (optionId) {
      interaction = await resolveInteractionSelection(ADDRESS_KIND, optionId, optionMeta);
    } else {
      interaction = await resolveInteraction(ADDRESS_KIND, { address: address!, state });
    }

    const clientInteraction = toClientInteraction(interaction);

    if (interaction.status === "needs_selection") {
      return NextResponse.json({
        status: "needs_selection",
        message: interaction.message,
        interaction: clientInteraction,
        addressSuggestions: interaction.options?.map((o) => ({
          id: o.id,
          label: o.label,
          streetAddress: o.meta?.streetAddress ?? o.label,
          city: o.meta?.city ?? null,
          state: o.meta?.state ?? state,
          zip: o.meta?.zip ?? null,
        })),
      });
    }

    if (interaction.status === "not_found" || interaction.status === "invalid_input") {
      return NextResponse.json(
        { status: "not_found", message: interaction.message, interaction: clientInteraction },
        { status: 404 },
      );
    }

    if (interaction.status === "error") {
      return NextResponse.json(
        { status: "error", message: interaction.message, interaction: clientInteraction },
        { status: 502 },
      );
    }

    if (interaction.status === "blocked") {
      return NextResponse.json(
        { status: "blocked", message: interaction.message, interaction: clientInteraction, data: interaction.data },
        { status: 403 },
      );
    }

    const property = propertyFromInteraction(interaction);
    if (!property) {
      return NextResponse.json(
        { status: "error", message: "Property data could not be loaded.", interaction: clientInteraction },
        { status: 500 },
      );
    }

    const intel = property.intel;
    const st = intel.state?.toUpperCase() ?? state.toUpperCase();
    const funding = evaluateFundingLane({ state: st });

    const valueMid = intel.marketValue ?? intel.arv ?? 0;
    const rentMid = intel.estimatedRent ?? 0;
    const valueRange = {
      low: Math.round(valueMid * 0.95),
      mid: valueMid,
      high: Math.round(valueMid * 1.05),
      confidence: "medium" as const,
    };
    const rentRange = {
      low: Math.round(rentMid * 0.9),
      mid: rentMid,
      high: Math.round(rentMid * 1.1),
      confidence: "medium" as const,
    };

    return NextResponse.json({
      status: "ok",
      message: interaction.message,
      interaction: clientInteraction,
      intel,
      formattedAddress: property.formattedAddress,
      valueRange,
      rentRange,
      fundingLane: funding.lane,
      funding,
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Property lookup failed" },
      { status: 500 },
    );
  }
}

/** Legacy GET — delegate to POST shape for backward compat */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return POST(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: searchParams.get("address") ?? "",
        state: searchParams.get("state") ?? "GA",
        optionId: searchParams.get("optionId") ?? undefined,
        optionMeta: searchParams.get("optionMeta")
          ? JSON.parse(searchParams.get("optionMeta")!)
          : undefined,
      }),
    }),
  );
}
