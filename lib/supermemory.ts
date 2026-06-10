import { Supermemory } from "supermemory";

const SESSION_PREFIX = "vestednest";
const LEGACY_KB_CONTAINER = "vestednest-kb";

function getClient() {
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  if (!apiKey) return null;
  return new Supermemory({ apiKey });
}

export function sessionContainer(sessionId: string): string {
  return `${SESSION_PREFIX}-${sessionId}`;
}

export function userContainer(userId: string): string {
  return `${SESSION_PREFIX}-user-${userId}`;
}

export async function getMemoryContext(
  containerTag: string,
  query: string,
): Promise<string> {
  const client = getClient();
  if (!client) return "";

  try {
    const profile = await client.profile({
      containerTag,
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

export async function recallUserContext(
  containerTag: string,
  query: string,
): Promise<string> {
  return getMemoryContext(containerTag, query);
}

export async function storeConversation(
  containerTag: string,
  userMessage: string,
  assistantMessage: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.add({
      content: `User: ${userMessage}\nAssistant: ${assistantMessage}`,
      containerTag,
      metadata: { type: "conversation", timestamp: new Date().toISOString() },
    });
  } catch {
    // Memory is best-effort
  }
}

export async function saveUserPreference(
  containerTag: string,
  preference: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.add({
      content: preference,
      containerTag,
      metadata: { type: "preference", timestamp: new Date().toISOString() },
    });
  } catch {
    // Best-effort
  }
}

/** Best-effort one-time merge when user logs in mid-session. */
export async function mergeSessionMemoryToUser(
  sessionId: string,
  userId: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;

  const from = sessionContainer(sessionId);
  const to = userContainer(userId);

  try {
    const results = await client.search.memories({
      q: "conversation preference property address",
      containerTag: from,
      limit: 20,
      searchMode: "hybrid",
      rerank: true,
    });

    for (const hit of results.results ?? []) {
      const memory = (hit as { memory?: string }).memory;
      if (!memory) continue;
      await client.add({
        content: memory,
        containerTag: to,
        metadata: { type: "merged_from_session", sessionId },
      });
    }
  } catch {
    // Non-blocking enhancement
  }
}

export async function hybridSearchContainer(
  query: string,
  containerTag: string,
  limit = 5,
): Promise<{ title: string; content: string; score?: number }[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const response = await client.search.memories({
      q: query,
      containerTag,
      limit,
      searchMode: "hybrid",
      rerank: true,
    });

    return (
      response.results
        ?.map((r) => {
          const memory = (r as { memory?: string; chunk?: string }).memory;
          const chunk = (r as { chunk?: string }).chunk;
          const content = memory ?? chunk ?? "";
          const title =
            (r as { metadata?: { title?: string } }).metadata?.title ??
            (r as { filepath?: string }).filepath ??
            "Knowledge";
          const score = (r as { similarity?: number }).similarity;
          return { title, content, score };
        })
        .filter((r) => r.content) ?? []
    );
  } catch {
    return [];
  }
}

export async function syncKnowledgeToContainer(
  docId: string,
  title: string,
  content: string,
  containerTag: string,
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const result = await client.add({
      content: `# ${title}\n\n${content}`,
      containerTag,
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

export async function syncKnowledgeMemory(
  docId: string,
  title: string,
  content: string,
): Promise<string | null> {
  return syncKnowledgeToContainer(docId, title, content, LEGACY_KB_CONTAINER);
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
  const results = await hybridSearchContainer(query, LEGACY_KB_CONTAINER, limit);
  return results.map(({ title, content }) => ({ title, content }));
}
