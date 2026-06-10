import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import {
  PLATFORM_SETTING_BY_KEY,
  PLATFORM_SETTING_DEFINITIONS,
} from "./setting-definitions";
import type { PlatformSettingDefinition, PlatformSettingView } from "./types";

export const ADMIN_INTEGRATIONS_HINT =
  "Configure in Admin → Settings → Integrations (platform_settings in Supabase).";

function parseStoredValue(
  def: PlatformSettingDefinition,
  raw: unknown,
): string | number | boolean | null {
  if (raw === null || raw === undefined) return null;
  if (def.type === "boolean") {
    if (typeof raw === "boolean") return raw;
    if (typeof raw === "string") {
      return ["true", "1", "yes", "on"].includes(raw.toLowerCase());
    }
    return Boolean(raw);
  }
  if (def.type === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof raw === "string") return raw;
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
  return JSON.stringify(raw);
}

function envFallback(def: PlatformSettingDefinition, env: NodeJS.ProcessEnv): string | undefined {
  if (!def.envKey) return undefined;
  return env[def.envKey]?.trim() || undefined;
}

export async function getPlatformSettingRow(
  client: SupabaseClient,
  key: string,
): Promise<{ value: unknown; isSecret: boolean } | null> {
  const { data, error } = await client
    .from("platform_settings")
    .select("value, is_secret")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { value: data.value, isSecret: Boolean(data.is_secret) };
}

type PlatformSettingRow = { value: unknown; isSecret: boolean };

async function loadAllPlatformSettingRows(
  client: SupabaseClient,
): Promise<Map<string, PlatformSettingRow>> {
  const { data, error } = await client
    .from("platform_settings")
    .select("key, value, is_secret");
  if (error) throw error;
  return new Map(
    (data ?? []).map((row) => [
      row.key as string,
      { value: row.value, isSecret: Boolean(row.is_secret) },
    ]),
  );
}

function resolveStringFromRow(
  def: PlatformSettingDefinition,
  row: PlatformSettingRow | undefined,
  env: NodeJS.ProcessEnv,
): string | undefined {
  if (row?.value != null && row.value !== "") {
    const v = parseStoredValue(def, row.value);
    if (v != null) return String(v);
  }
  const fromEnv = envFallback(def, env);
  if (fromEnv) return fromEnv;
  if (def.defaultValue != null) return String(def.defaultValue);
  return undefined;
}

function resolveBooleanFromRow(
  def: PlatformSettingDefinition,
  row: PlatformSettingRow | undefined,
  env: NodeJS.ProcessEnv,
): boolean {
  if (row?.value !== null && row?.value !== undefined) {
    const v = parseStoredValue(def, row.value);
    if (typeof v === "boolean") return v;
  }
  if (def.envKey) {
    const raw = env[def.envKey]?.trim().toLowerCase();
    if (raw === "true" || raw === "1" || raw === "yes") return true;
    if (raw === "false" || raw === "0" || raw === "no") return false;
  }
  return Boolean(def.defaultValue);
}

export async function resolvePlatformString(
  client: SupabaseClient | null,
  key: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<string | undefined> {
  const def = PLATFORM_SETTING_BY_KEY[key];
  if (!def) return undefined;

  if (client) {
    const row = await getPlatformSettingRow(client, key);
    if (row?.value != null && row.value !== "") {
      const v = parseStoredValue(def, row.value);
      if (v != null) return String(v);
    }
  }

  const fromEnv = envFallback(def, env);
  if (fromEnv) return fromEnv;
  if (def.defaultValue != null) return String(def.defaultValue);
  return undefined;
}

export async function resolvePlatformBoolean(
  client: SupabaseClient | null,
  key: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<boolean> {
  const def = PLATFORM_SETTING_BY_KEY[key];
  if (!def) return false;

  if (client) {
    const row = await getPlatformSettingRow(client, key);
    if (row?.value !== null && row?.value !== undefined) {
      const v = parseStoredValue(def, row.value);
      if (typeof v === "boolean") return v;
    }
  }

  if (def.envKey) {
    const raw = env[def.envKey]?.trim().toLowerCase();
    if (raw === "true" || raw === "1" || raw === "yes") return true;
    if (raw === "false" || raw === "0" || raw === "no") return false;
  }

  return Boolean(def.defaultValue);
}

async function envStringForDefinition(
  client: SupabaseClient | null,
  def: PlatformSettingDefinition,
  baseEnv: NodeJS.ProcessEnv,
): Promise<string | undefined> {
  if (!def.envKey) return undefined;

  if (def.type === "boolean") {
    const b = await resolvePlatformBoolean(client, def.key, baseEnv);
    return b ? "true" : "false";
  }
  return resolvePlatformString(client, def.key, baseEnv);
}

/** Build merged env: DB values override env for mapped keys. */
export async function buildEffectiveEnv(
  client: SupabaseClient | null,
  baseEnv: NodeJS.ProcessEnv = process.env,
): Promise<NodeJS.ProcessEnv> {
  const merged = { ...baseEnv } as Record<string, string | undefined>;
  const rowsByKey = client ? await loadAllPlatformSettingRows(client) : null;

  for (const def of PLATFORM_SETTING_DEFINITIONS) {
    if (!def.envKey) continue;
    const val =
      rowsByKey != null
        ? def.type === "boolean"
          ? resolveBooleanFromRow(def, rowsByKey.get(def.key), baseEnv)
            ? "true"
            : "false"
          : resolveStringFromRow(def, rowsByKey.get(def.key), baseEnv)
        : await envStringForDefinition(client, def, baseEnv);
    if (val !== undefined) merged[def.envKey] = val;
  }

  // LangChain reads GOOGLE_API_KEY; mirror from GEMINI_API_KEY when set.
  const gemini = merged.GEMINI_API_KEY ?? baseEnv.GEMINI_API_KEY ?? baseEnv.GOOGLE_API_KEY;
  if (gemini) {
    merged.GEMINI_API_KEY = gemini;
    merged.GOOGLE_API_KEY = gemini;
  }

  // LangSmith tracing — auto-enable when API key is present.
  const langsmithKey = merged.LANGSMITH_API_KEY ?? baseEnv.LANGSMITH_API_KEY;
  if (langsmithKey?.trim()) {
    merged.LANGSMITH_API_KEY = langsmithKey.trim();
    merged.LANGSMITH_TRACING = "true";
  }

  return merged as NodeJS.ProcessEnv;
}

const SETTINGS_CACHE_TTL_MS = 60_000;

let settingsLoadInFlight: Promise<NodeJS.ProcessEnv> | null = null;
let cachedServerEnv: { env: NodeJS.ProcessEnv; expiresAt: number } | null = null;

function applyMergedEnvToProcess(merged: NodeJS.ProcessEnv): void {
  for (const def of PLATFORM_SETTING_DEFINITIONS) {
    if (!def.envKey) continue;
    const val = merged[def.envKey];
    if (val !== undefined) {
      (process.env as Record<string, string | undefined>)[def.envKey] = val;
    }
  }
  const gemini = merged.GEMINI_API_KEY;
  if (gemini) {
    (process.env as Record<string, string | undefined>).GOOGLE_API_KEY = gemini;
  }
  if (merged.LANGSMITH_API_KEY?.trim()) {
    (process.env as Record<string, string | undefined>).LANGSMITH_TRACING = "true";
  }
}

/** Drop cached platform settings (call after admin updates). */
export function invalidateServerSettingsCache(): void {
  cachedServerEnv = null;
}

/**
 * Load platform settings via service role and sync into process.env.
 * Safe to call on every server request (deduped + short TTL cache).
 */
export async function buildEffectiveEnvForServer(
  baseEnv: NodeJS.ProcessEnv = process.env,
): Promise<NodeJS.ProcessEnv> {
  const now = Date.now();
  if (cachedServerEnv && cachedServerEnv.expiresAt > now) {
    applyMergedEnvToProcess(cachedServerEnv.env);
    return cachedServerEnv.env;
  }

  if (!settingsLoadInFlight) {
    settingsLoadInFlight = (async () => {
      const client = createServiceClient();
      if (!client) return baseEnv;
      const merged = await buildEffectiveEnv(client, baseEnv);
      applyMergedEnvToProcess(merged);
      cachedServerEnv = {
        env: merged,
        expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
      };
      return merged;
    })().finally(() => {
      settingsLoadInFlight = null;
    });
  }
  return settingsLoadInFlight;
}

/** Alias used at the top of API routes before reading integration env vars. */
export async function ensureServerSettings(): Promise<void> {
  await buildEffectiveEnvForServer(process.env);
}

export async function getIntegrationStatus(
  env: NodeJS.ProcessEnv = process.env,
): Promise<Record<string, boolean>> {
  const effective = await buildEffectiveEnvForServer(env);
  return {
    supabase: Boolean(effective.NEXT_PUBLIC_SUPABASE_URL),
    realie: Boolean(effective.REALIE_API_KEY),
    rentcast: Boolean(effective.RENTCAST_API_KEY),
    gemini: Boolean(effective.GOOGLE_API_KEY ?? effective.GEMINI_API_KEY),
    langsmith: Boolean(effective.LANGSMITH_API_KEY),
    supermemory: Boolean(effective.SUPERMEMORY_API_KEY),
    sendgrid: Boolean(effective.SENDGRID_API_KEY),
    twilio: Boolean(effective.TWILIO_ACCOUNT_SID),
    creditVendor: Boolean(effective.CREDIT_VENDOR_API_KEY),
  };
}

export async function listPlatformSettingsForAdmin(
  client: SupabaseClient,
  options?: { revealSecrets?: boolean },
): Promise<PlatformSettingView[]> {
  const revealSecrets = options?.revealSecrets === true;
  const { data: rows, error } = await client.from("platform_settings").select("key, value, is_secret");
  if (error) throw error;
  const byKey = new Map((rows ?? []).map((r) => [r.key as string, r]));

  return PLATFORM_SETTING_DEFINITIONS.map((def) => {
    const row = byKey.get(def.key);
    let value: string | number | boolean | null = null;
    let source: PlatformSettingView["source"] = "unset";
    let hasValue = false;

    const dbRaw = row?.value;
    const dbHasValue =
      dbRaw !== null &&
      dbRaw !== undefined &&
      !(typeof dbRaw === "string" && dbRaw.trim() === "");
    if (dbHasValue) {
      value = parseStoredValue(def, dbRaw);
      source = "database";
      hasValue = value !== null && value !== "";
    } else if (def.envKey && process.env[def.envKey]?.trim()) {
      const raw = process.env[def.envKey]!.trim();
      if (def.type === "boolean") {
        value = ["true", "1", "yes"].includes(raw.toLowerCase());
      } else if (def.type === "number") {
        value = Number(raw);
      } else {
        value = raw;
      }
      source = "environment";
      hasValue = true;
    } else if (def.defaultValue !== undefined) {
      value = def.defaultValue;
      source = "default";
      hasValue = true;
    }

    if (!revealSecrets && def.isSecret && hasValue && source === "database") {
      value = "••••••••";
    } else if (!revealSecrets && def.isSecret && hasValue && source === "environment") {
      value = "•••••••• (env)";
    }

    return {
      key: def.key,
      label: def.label,
      description: def.description ?? "",
      type: def.type,
      category: def.category,
      isSecret: Boolean(def.isSecret),
      value,
      source,
      hasValue,
    };
  });
}

export async function upsertPlatformSetting(
  client: SupabaseClient,
  key: string,
  value: string | number | boolean | null,
  updatedBy?: string | null,
): Promise<void> {
  const def = PLATFORM_SETTING_BY_KEY[key];
  if (!def) throw new Error(`Unknown platform setting: ${key}`);

  if (value === null || value === "") {
    const { error } = await client.from("platform_settings").delete().eq("key", key);
    if (error) throw error;
    return;
  }

  const { error } = await client.from("platform_settings").upsert(
    {
      key,
      value: value as unknown,
      is_secret: Boolean(def.isSecret),
      updated_at: new Date().toISOString(),
      updated_by: updatedBy ?? null,
    },
    { onConflict: "key" },
  );
  if (error) throw error;
}
