import { Supermemory } from "supermemory";

const CONTAINER_PREFIX = "vestednest";

function getClient() {
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) return null;
  return new Supermemory({ apiKey });
}

export async function getMemoryContext(
  sessionId: string,
  query: string,
): Promise<string> {
  const client = getClient();
  if (!client) return "";

  try {
    const profile = await client.profile({
      containerTag: `${CONTAINER_PREFIX}-${sessionId}`,
      q: query,
    });

    const staticFacts = profile.profile?.static?.join("\n") ?? "";
    const dynamicFacts = profile.profile?.dynamic?.join("\n") ?? "";
    const memories =
      profile.searchResults?.results
        ?.map((r) => (r as { memory?: string }).memory)
        .filter(Boolean)
        .join("\n") ?? "";

    if (!staticFacts && !dynamicFacts && !memories) return "";

    return [
      staticFacts ? `Profile:\n${staticFacts}` : "",
      dynamicFacts ? `Recent context:\n${dynamicFacts}` : "",
      memories ? `Relevant memories:\n${memories}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  } catch {
    return "";
  }
}

export async function storeConversation(
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.add({
      content: `User: ${userMessage}\nAssistant: ${assistantMessage}`,
      containerTag: `${CONTAINER_PREFIX}-${sessionId}`,
      metadata: { type: "conversation", timestamp: new Date().toISOString() },
    });
  } catch {
    // Memory is best-effort for the demo
  }
}
