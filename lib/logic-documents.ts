import { sanitizeContent, sanitizeTitle } from "@/lib/sanitize";
import { createServiceClient } from "@/lib/supabase/service";
import { invalidateLogicCache } from "@/lib/logic";
import type { LogicDocument, LogicSourceType, ParsedLogicRules } from "@/lib/logic/types";

export async function listLogicDocuments(): Promise<LogicDocument[]> {
  const service = createServiceClient();
  if (!service) return [];

  const { data } = await service
    .from("logic_documents")
    .select("*")
    .order("updated_at", { ascending: false });

  return (data ?? []) as LogicDocument[];
}

export async function getLogicDocument(id: string): Promise<LogicDocument | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data } = await service.from("logic_documents").select("*").eq("id", id).single();
  return (data as LogicDocument) ?? null;
}

export async function createLogicDocument(input: {
  title: string;
  source_type: LogicSourceType;
  sanitized_content: string;
  file_path?: string | null;
  parsed_rules?: ParsedLogicRules | null;
  version?: string;
}): Promise<LogicDocument | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data, error } = await service
    .from("logic_documents")
    .insert({
      title: sanitizeTitle(input.title),
      source_type: input.source_type,
      sanitized_content: sanitizeContent(input.sanitized_content),
      file_path: input.file_path ?? null,
      parsed_rules: input.parsed_rules ?? null,
      version: input.version ?? "1.0",
    })
    .select()
    .single();

  if (error || !data) return null;
  invalidateLogicCache();
  return data as LogicDocument;
}

export async function updateLogicDocument(
  id: string,
  input: Partial<{
    title: string;
    sanitized_content: string;
    parsed_rules: ParsedLogicRules;
    version: string;
  }>,
): Promise<LogicDocument | null> {
  const service = createServiceClient();
  if (!service) return null;

  const { data, error } = await service
    .from("logic_documents")
    .update({
      ...(input.title ? { title: sanitizeTitle(input.title) } : {}),
      ...(input.sanitized_content
        ? { sanitized_content: sanitizeContent(input.sanitized_content) }
        : {}),
      ...(input.parsed_rules ? { parsed_rules: input.parsed_rules as never } : {}),
      ...(input.version ? { version: input.version } : {}),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  invalidateLogicCache();
  return data as LogicDocument;
}

export async function deleteLogicDocument(id: string): Promise<boolean> {
  const service = createServiceClient();
  if (!service) return false;

  const { error } = await service.from("logic_documents").delete().eq("id", id);
  if (!error) invalidateLogicCache();
  return !error;
}

export async function syncLogicToAdminSettings(
  rules: ParsedLogicRules,
): Promise<boolean> {
  const service = createServiceClient();
  if (!service) return false;

  const { error } = await service
    .from("admin_settings")
    .update({
      state_eligibility: rules.stateMatrix,
      rate_settings: rules.rateSettings,
      funded_states: rules.stateMatrix
        .filter((s) => s.status !== "blocked")
        .map((s) => s.state),
    })
    .eq("id", 1);

  if (!error) invalidateLogicCache();
  return !error;
}
