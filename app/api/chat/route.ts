import { NextResponse } from "next/server";
import { runNestAgent } from "@/lib/agent/nest-agent";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      message?: string;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    const sessionId = body.sessionId?.trim() || "anonymous";
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runNestAgent(sessionId, message, body.history ?? []);

    return NextResponse.json({
      message: result.message,
      actions: result.actions,
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
