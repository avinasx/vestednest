import { Supermemory } from "supermemory";

const CONTAINER_PREFIX = "vestednest";
const KB_CONTAINER = "vestednest-kb";

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
    // Memory is best-effort
  }
}

export async function syncKnowledgeMemory(
  docId: string,
  title: string,
  content: string,
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const result = await client.add({
      content: `# ${title}\n\n${content}`,
      containerTag: KB_CONTAINER,
      metadata: {
        type: "knowledge",
        docId,
        title,
        timestamp: new Date().toISOString(),
      },
    });
    return (result as { id?: string }).id ?? docId;
  } catch {
    return null;
  }
}

export async function deleteKnowledgeMemory(memoryId: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.delete(memoryId);
  } catch {
    // Best-effort cleanup
  }
}

export async function searchKnowledgeMemory(
  query: string,
  limit = 5,
): Promise<{ title: string; content: string }[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const profile = await client.profile({
      containerTag: KB_CONTAINER,
      q: query,
    });

    return (
      profile.searchResults?.results
        ?.slice(0, limit)
        .map((r) => {
          const memory = (r as { memory?: string; metadata?: { title?: string } }).memory ?? "";
          const title =
            (r as { metadata?: { title?: string } }).metadata?.title ?? "Knowledge";
          return { title, content: memory };
        })
        .filter((r) => r.content) ?? []
    );
  } catch {
    return [];
  }
}
