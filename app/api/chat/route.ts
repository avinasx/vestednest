import { NextResponse } from "next/server";
import { runNestAgent } from "@/lib/agent/nest-agent";
import {
  interactionToAddressSuggestions,
  propertyFromInteraction,
  toClientInteraction,
} from "@/lib/chat-interactions";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureServerSettings } from "@/lib/settings";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/chat", 20);
  if (limited) return limited;

  await ensureServerSettings();

  try {
    const body = (await request.json()) as {
      sessionId?: string;
      message?: string;
      history?: { role: "user" | "assistant"; content: string }[];
      /** Resolve a prior needs_selection interaction */
      interactionKind?: string;
      optionId?: string;
      optionMeta?: Record<string, unknown>;
    };

    const sessionId = body.sessionId?.trim() || "anonymous";

    // Selection follow-up (e.g. user picked an address option)
    if (body.interactionKind && body.optionId) {
      const { resolveInteractionSelection } = await import(
        "@/lib/chat-interactions"
      );
      const interaction = await resolveInteractionSelection(
        body.interactionKind,
        body.optionId,
        body.optionMeta,
      );
      const clientInteraction = toClientInteraction(interaction);
      const property = propertyFromInteraction(interaction);
      let message = interaction.message;

      if (property) {
        const ts = property.termSheet;
        message = `Got it — ${property.formattedAddress}.\n\n✓ Estimated rent: $${property.intel.estimatedRent.toLocaleString()}/mo\n✓ DSCR at 25% down: ${ts.dscr}x\n✓ Rate: ${ts.rate.toFixed(2)}% · 30yr Fixed\n\nReady to see the full interactive term sheet?`;
      }

      return NextResponse.json({
        message,
        actions: property
          ? ["Yes — open term sheet", "Adjust loan structure", "Download PDF now"]
          : interaction.status === "needs_selection"
            ? []
            : ["Get a DSCR quote"],
        interaction: clientInteraction,
        addressSuggestions: interactionToAddressSuggestions(interaction),
        property: property
          ? {
              intel: property.intel,
              formattedAddress: property.formattedAddress,
              termSheet: property.termSheet,
            }
          : null,
      });
    }

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runNestAgent(sessionId, message, body.history ?? []);

    return NextResponse.json({
      message: result.message,
      actions: result.actions,
      interaction: result.interaction,
      addressSuggestions: result.addressSuggestions ?? null,
      property: result.propertyLookup
        ? {
            intel: result.propertyLookup.intel,
            formattedAddress: result.propertyLookup.formattedAddress,
            termSheet: result.propertyLookup.termSheetAt25Down,
          }
        : null,
    });
  } catch (err) {
    console.error("chat error", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Chat failed",
      },
      { status: 500 },
    );
  }
}
