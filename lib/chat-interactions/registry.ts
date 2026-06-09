import type { ChatInteraction } from "./types";

/**
 * Register a new chat integration kind:
 * 1. Implement InteractionHandler (resolve, resolveSelection, formatError).
 * 2. Call registerInteractionHandler(handler) from lib/chat-interactions/index.ts.
 * 3. Wire agent tool or API route to resolveInteraction(handler.kind, input).
 */
export type InteractionHandler = {
  kind: string;
  resolve: (input: unknown, context?: unknown) => Promise<ChatInteraction>;
  resolveSelection?: (
    optionId: string,
    meta: Record<string, unknown> | undefined,
    context?: unknown,
  ) => Promise<ChatInteraction>;
  formatError: (err: unknown) => string;
};

const handlers = new Map<string, InteractionHandler>();

export function registerInteractionHandler(handler: InteractionHandler): void {
  handlers.set(handler.kind, handler);
}

export function getInteractionHandler(kind: string): InteractionHandler | undefined {
  return handlers.get(kind);
}

export function listInteractionKinds(): string[] {
  return [...handlers.keys()];
}

function fallbackError(kind: string, message: string): ChatInteraction {
  return { status: "error", kind, message };
}

export async function resolveInteraction(
  kind: string,
  input: unknown,
  context?: unknown,
): Promise<ChatInteraction> {
  const handler = handlers.get(kind);
  if (!handler) {
    return fallbackError(kind, "Something went wrong. Please try again.");
  }
  try {
    return await handler.resolve(input, context);
  } catch (err) {
    return {
      status: "error",
      kind,
      message: handler.formatError(err),
      source: kind,
    };
  }
}

export async function resolveInteractionSelection(
  kind: string,
  optionId: string,
  meta?: Record<string, unknown>,
  context?: unknown,
): Promise<ChatInteraction> {
  const handler = handlers.get(kind);
  if (!handler?.resolveSelection) {
    return fallbackError(kind, "Selection is not supported for this request.");
  }
  try {
    return await handler.resolveSelection(optionId, meta, context);
  } catch (err) {
    return {
      status: "error",
      kind,
      message: handler.formatError(err),
      source: kind,
    };
  }
}
