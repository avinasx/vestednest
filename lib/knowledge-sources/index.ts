import { adminKbSource } from "./admin-kb";
import { logicDocsSource } from "./logic-docs";
import { registerKnowledgeSource } from "./registry";

let registered = false;

export function ensureKnowledgeSourcesRegistered(): void {
  if (registered) return;
  registerKnowledgeSource(adminKbSource);
  registerKnowledgeSource(logicDocsSource);
  registered = true;
}

ensureKnowledgeSourcesRegistered();

export * from "./registry";
export * from "./admin-kb";
export * from "./logic-docs";
