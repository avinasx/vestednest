import { NextResponse } from "next/server";
import { ADDRESS_KIND, resolveInteraction, toClientInteraction } from "@/lib/chat-interactions";
import { ensureServerSettings } from "@/lib/settings";

export async function GET(request: Request) {
  await ensureServerSettings();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const state = searchParams.get("state") ?? "";

  if (!state || state.length !== 2) {
    return NextResponse.json(
      { status: "invalid_input", error: "A two-letter state code is required (e.g. FL)." },
      { status: 400 },
    );
  }

  try {
    const interaction = await resolveInteraction(ADDRESS_KIND, {
      address: query,
      state,
      enrichRent: false,
    });

    const clientInteraction = toClientInteraction(interaction);

    if (interaction.status === "needs_selection") {
      return NextResponse.json({
        status: "needs_selection",
        message: interaction.message,
        interaction: clientInteraction,
        suggestions: interaction.options?.map((o) => ({
          id: o.id,
          label: o.label,
          streetAddress: o.meta?.streetAddress ?? o.label,
          city: o.meta?.city ?? null,
          state: o.meta?.state ?? state,
          zip: o.meta?.zip ?? null,
          county: o.meta?.county ?? null,
        })),
      });
    }

    if (
      interaction.status === "not_found" ||
      interaction.status === "invalid_input"
    ) {
      return NextResponse.json({
        status: interaction.status,
        message: interaction.message,
        interaction: clientInteraction,
        suggestions: [],
      });
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

    // Single exact match — return as one suggestion for autocomplete UX
    const data = interaction.data as {
      formattedAddress?: string;
      intel?: {
        addressLine?: string;
        city?: string | null;
        state?: string;
        zip?: string | null;
        raw?: Record<string, unknown>;
      };
    };

    const intel = data?.intel;
    const label = data?.formattedAddress ?? query;

    return NextResponse.json({
      status: "ok",
      message: interaction.message,
      interaction: clientInteraction,
      suggestions: intel
        ? [
            {
              id: `exact-${label}`,
              label,
              streetAddress: intel.addressLine ?? label,
              city: intel.city ?? null,
              state: intel.state ?? state,
              zip: intel.zip ?? null,
              county: null,
              property: intel.raw ?? {},
            },
          ]
        : [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error:
          err instanceof Error ? err.message : "Address suggestion failed",
      },
      { status: 500 },
    );
  }
}
