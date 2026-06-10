import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { createAgent, toolStrategy } from "langchain";
import { ensureKnowledgeSourcesRegistered } from "@/lib/knowledge-sources";
import { PLATFORM_SETTING_BY_KEY } from "@/lib/platform/setting-definitions";
import { agentContextSchema, memoryContextMiddleware } from "./memory-middleware";
import { nestAgentMiddleware } from "./middleware";
import { nestResponseSchema } from "./response-schema";
import { nestAgentStateSchema } from "./state";
import { nestTools } from "./tools";

const GEMINI_MODEL_DEFAULT = String(
  PLATFORM_SETTING_BY_KEY["ai.gemini_model"].defaultValue ?? "gemini-2.0-flash",
);

/** Strip accidental quote wrapping from admin / jsonb values. */
export function normalizeGeminiModelId(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim() || undefined;
  }
  return trimmed;
}

export function getGeminiModelConfig() {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  const model =
    normalizeGeminiModelId(process.env.GEMINI_MODEL) ?? GEMINI_MODEL_DEFAULT;
  return { apiKey, model };
}

function modelSignature(config: { apiKey: string; model: string }) {
  return `${config.model}::${config.apiKey}`;
}

let compiledAgent: ReturnType<typeof createAgent> | null = null;
let cachedModelSignature: string | null = null;
let checkpointer: MemorySaver | null = null;

/** Dev: in-memory threads. Prod: swap for PostgresSaver with SUPABASE_DB_URL / LANGGRAPH_CHECKPOINT_URI. */
export function getCheckpointer(): MemorySaver {
  if (!checkpointer) {
    checkpointer = new MemorySaver();
  }
  return checkpointer;
}

/** Drop cached LangGraph agent so the next request picks up env / DB model changes. */
export function invalidateNestAgentCache() {
  compiledAgent = null;
  cachedModelSignature = null;
}

export function getNestAgent() {
  const config = getGeminiModelConfig();
  const signature = modelSignature(config);

  if (!compiledAgent || cachedModelSignature !== signature) {
    ensureKnowledgeSourcesRegistered();

    compiledAgent = createAgent({
      model: new ChatGoogleGenerativeAI({
        model: config.model,
        temperature: 0.3,
        apiKey: config.apiKey,
      }),
      tools: nestTools,
      contextSchema: agentContextSchema,
      stateSchema: nestAgentStateSchema,
      checkpointer: getCheckpointer(),
      middleware: [memoryContextMiddleware, nestAgentMiddleware],
      responseFormat: toolStrategy(nestResponseSchema),
      version: "v2",
    });
    cachedModelSignature = signature;

    if (process.env.NODE_ENV === "development") {
      console.info("[nest-agent] Gemini model:", config.model);
    }
  }

  return compiledAgent.withConfig({ recursionLimit: 10 });
}

export function resetNestAgentForTests() {
  invalidateNestAgentCache();
  checkpointer = null;
}
