import { NextResponse } from "next/server";
import { getOptionalUser, resolveChatIdentity } from "@/lib/auth/optional-user";
import { streamNestAgentResponse } from "@/lib/agent/run-agent";
import { friendlyChatError } from "@/lib/chat-intent";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureServerSettings } from "@/lib/settings";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/chat", 20);
  if (limited) return limited;

  try {
    const [body, user] = await Promise.all([
      request.json() as Promise<{
        sessionId?: string;
        message?: string;
        /** @deprecated Server checkpointer owns history */
        history?: unknown[];
        /** AI SDK useChat — last message text */
        text?: string;
        /** AI SDK UIMessage parts */
        messages?: { role: string; parts?: { type: string; text?: string }[] }[];
      }>,
      (async () => {
        await ensureServerSettings();
        return getOptionalUser();
      })(),
    ]);

    const sessionId = body.sessionId?.trim() || "anonymous";
    const identity = resolveChatIdentity(sessionId, user?.id);

    let message = body.message?.trim();
    if (!message && body.text?.trim()) {
      message = body.text.trim();
    }
    if (!message && body.messages?.length) {
      const last = body.messages[body.messages.length - 1];
      const textPart = last?.parts?.find((p) => p.type === "text");
      if (textPart?.text?.trim()) message = textPart.text.trim();
    }

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    return streamNestAgentResponse({
      identity,
      userMessage: message,
    });
  } catch (err) {
    console.error("chat error", err);
    const stream = await streamNestAgentResponse({
      identity: resolveChatIdentity("anonymous"),
      userMessage: "",
    }).catch(() => null);

    if (stream) return stream;

    return NextResponse.json({
      message: friendlyChatError(err),
      actions: ["Get a DSCR quote", "Try again"],
      interaction: null,
      addressSuggestions: null,
      property: null,
    });
  }
}
