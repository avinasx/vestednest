import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { getMemoryContext, storeConversation } from "@/lib/supermemory";
import {
  clearLastPropertyLookup,
  getLastPropertyLookup,
  nestTools,
} from "./tools";

const SYSTEM_PROMPT = `You are Nest AI, the DSCR lending advisor for Vested Nest — a production DSCR lender.

Your job:
- Help investors get DSCR purchase, cash-out refi, or bridge-to-DSCR quotes
- When the user gives a property address, ALWAYS call lookup_property first
- For policy, product, or FAQ questions, call search_knowledge_base before answering
- For state eligibility questions, call check_state_eligibility with the two-letter state code
- Explain results clearly: rent estimate, DSCR, rate, PITIA — no W2, no DTI, soft pull only
- Be concise, confident, and operator-friendly
- Suggest 2-3 short follow-up actions as a JSON array in your final line like: ACTIONS:["action1","action2"]

Product facts:
- Median close: 14 days
- LLC/entity borrowers preferred
- Foreign nationals eligible with US LLC
- Bridge appraisal reuse saves ~$650
- Use knowledge base for current funded states and rate policy details`;

function getModel() {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured");
  }
  const model =
    process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  return new ChatGoogleGenerativeAI({
    model,
    temperature: 0.3,
    apiKey,
  });
}

function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const last = messages[messages.length - 1] as AIMessage;
  if (last.tool_calls?.length) return "tools";
  return "__end__";
}

function buildGraph(memoryContext: string) {
  const model = getModel().bindTools(nestTools);
  const toolNode = new ToolNode(nestTools);

  async function callModel(state: typeof MessagesAnnotation.State) {
    const system = memoryContext
      ? `${SYSTEM_PROMPT}\n\nUser memory context:\n${memoryContext}`
      : SYSTEM_PROMPT;

    const response = await model.invoke([
      new SystemMessage(system),
      ...state.messages,
    ]);
    return { messages: [response] };
  }

  return new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue, {
      tools: "tools",
      __end__: "__end__",
    })
    .addEdge("tools", "agent")
    .compile();
}

function parseActions(content: string): string[] {
  const match = content.match(/ACTIONS:\s*(\[[^\]]+\])/i);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]) as string[];
    return parsed.filter((a) => typeof a === "string").slice(0, 4);
  } catch {
    return [];
  }
}

function cleanContent(content: string): string {
  return content.replace(/\n?ACTIONS:\s*\[[^\]]+\]\s*$/i, "").trim();
}

export type AgentResponse = {
  message: string;
  actions: string[];
  propertyLookup: ReturnType<typeof getLastPropertyLookup>;
};

export async function runNestAgent(
  sessionId: string,
  userMessage: string,
  history: { role: "user" | "assistant"; content: string }[] = [],
): Promise<AgentResponse> {
  clearLastPropertyLookup();

  try {
    const memoryContext = await getMemoryContext(sessionId, userMessage);
    const app = buildGraph(memoryContext);

    const messages = [
      ...history.map((m) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      ),
      new HumanMessage(userMessage),
    ];

    const result = await app.invoke({ messages });
    const lastMsg = result.messages[result.messages.length - 1] as AIMessage;
    const raw =
      typeof lastMsg.content === "string"
        ? lastMsg.content
        : JSON.stringify(lastMsg.content);

    const message = cleanContent(raw);
    const actions = parseActions(raw);
    const propertyLookup = getLastPropertyLookup();

    await storeConversation(sessionId, userMessage, message);

    return {
      message,
      actions: actions.length
        ? actions
        : propertyLookup
          ? ["Yes — open term sheet", "Adjust loan structure", "Download PDF now"]
          : ["Get a DSCR quote", "Refi out of bridge", "Check my DSCR"],
      propertyLookup,
    };
  } catch (err) {
    const { runFallbackAgent } = await import("./fallback");
    const fallback = await runFallbackAgent(userMessage);
    await storeConversation(sessionId, userMessage, fallback.message);
    return fallback;
  }
}
