import { NextResponse } from "next/server";
import {
  ADDRESS_KIND,
  propertyFromInteraction,
  resolveInteraction,
  resolveInteractionSelection,
  toClientInteraction,
} from "@/lib/chat-interactions";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureServerSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const limited = checkRateLimit(request, "/api/property", 30);
  if (limited) return limited;

  await ensureServerSettings();

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") ?? "";
  const state = searchParams.get("state") ?? "GA";
  const optionId = searchParams.get("optionId");
  const optionMetaRaw = searchParams.get("optionMeta");

  if (!address.trim() && !optionId) {
    return NextResponse.json(
      { status: "not_found", error: "address is required" },
      { status: 400 },
    );
  }

  try {
    let interaction;
    if (optionId) {
      let meta: Record<string, unknown> | undefined;
      if (optionMetaRaw) {
        try {
          meta = JSON.parse(optionMetaRaw) as Record<string, unknown>;
        } catch {
          meta = undefined;
        }
      }
      interaction = await resolveInteractionSelection(
        ADDRESS_KIND,
        optionId,
        meta,
      );
    } else {
      interaction = await resolveInteraction(ADDRESS_KIND, {
        address,
        state,
      });
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

    if (
      interaction.status === "not_found" ||
      interaction.status === "invalid_input"
    ) {
      return NextResponse.json(
        {
          status: "not_found",
          message: interaction.message,
          interaction: clientInteraction,
        },
        { status: 404 },
      );
    }

    if (interaction.status === "error") {
      return NextResponse.json(
        {
          status: "error",
          message: interaction.message,
          interaction: clientInteraction,
        },
        { status: 502 },
      );
    }

    if (interaction.status === "blocked") {
      return NextResponse.json(
        {
          status: "blocked",
          message: interaction.message,
          interaction: clientInteraction,
          data: interaction.data,
        },
        { status: 403 },
      );
    }

    const property = propertyFromInteraction(interaction);
    if (!property) {
      return NextResponse.json(
        {
          status: "error",
          message: "Property data could not be loaded.",
          interaction: clientInteraction,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      status: "ok",
      message: interaction.message,
      interaction: clientInteraction,
      intel: property.intel,
      formattedAddress: property.formattedAddress,
      termSheet: property.termSheet,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Property lookup failed",
      },
      { status: 500 },
    );
  }
}
