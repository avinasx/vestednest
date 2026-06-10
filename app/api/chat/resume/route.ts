import { NextResponse } from "next/server";
import { getOptionalUser, resolveChatIdentity } from "@/lib/auth/optional-user";
import { streamNestAgentResponse } from "@/lib/agent/run-agent";
import { friendlyChatError } from "@/lib/chat-intent";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureServerSettings } from "@/lib/settings";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/chat/resume", 20);
  if (limited) return limited;

  try {
    const [body, user] = await Promise.all([
      request.json() as Promise<{
        sessionId?: string;
        threadId?: string;
        kind?: string;
        interactionKind?: string;
        optionId?: string;
        optionMeta?: Record<string, unknown>;
      }>,
      (async () => {
        await ensureServerSettings();
        return getOptionalUser();
      })(),
    ]);

    const sessionId = body.sessionId?.trim() || "anonymous";
    const identity = resolveChatIdentity(sessionId, user?.id);

    const kind = body.kind ?? body.interactionKind;
    const optionId = body.optionId?.trim();

    if (!kind || !optionId) {
      return NextResponse.json(
        { error: "kind and optionId are required" },
        { status: 400 },
      );
    }

    return streamNestAgentResponse({
      identity: {
        ...identity,
        threadId: body.threadId?.trim() || identity.threadId,
      },
      resume: {
        kind,
        optionId,
        optionMeta: body.optionMeta,
      },
    });
  } catch (err) {
    console.error("chat resume error", err);
    return NextResponse.json({
      message: friendlyChatError(err),
      actions: ["Try again"],
      interaction: null,
      property: null,
    });
  }
}
