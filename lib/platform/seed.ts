import { existsSync, readFileSync } from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import { PLATFORM_SETTING_DEFINITIONS } from "./setting-definitions";
import type { PlatformSettingDefinition } from "./types";
import { getPlatformSettingRow, upsertPlatformSetting } from "./settings-repository";

function parseEnvRaw(def: PlatformSettingDefinition, raw: string): string | number | boolean | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (def.type === "boolean") {
    return ["true", "1", "yes", "on"].includes(trimmed.toLowerCase());
  }
  if (def.type === "number") {
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return trimmed;
}

export function resolveSeedValue(
  def: PlatformSettingDefinition,
  env: NodeJS.ProcessEnv,
): string | number | boolean | null {
  if (def.key === "ai.gemini_api_key") {
    const gemini = env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim();
    if (gemini) return gemini;
  }

  if (def.envKey) {
    const raw = env[def.envKey]?.trim();
    if (raw) {
      const parsed = parseEnvRaw(def, raw);
      if (parsed !== null) return parsed;
    }
  }

  if (def.key === "app.base_url") {
    const pub = env.NEXT_PUBLIC_APP_URL?.trim() || env.VERCEL_URL?.trim();
    if (pub) return pub.startsWith("http") ? pub.replace(/\/+$/, "") : `https://${pub}`;
  }

  if (def.defaultValue !== undefined) return def.defaultValue;
  return null;
}

export interface SeedPlatformSettingsResult {
  inserted: number;
  updated: number;
  skipped: number;
}

export async function seedPlatformSettings(
  client: SupabaseClient,
  env: NodeJS.ProcessEnv = process.env,
  options: { onlyMissing?: boolean; overwrite?: boolean; updatedBy?: string } = {},
): Promise<SeedPlatformSettingsResult> {
  const onlyMissing = options.onlyMissing !== false && !options.overwrite;
  const updatedBy = options.updatedBy;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const def of PLATFORM_SETTING_DEFINITIONS) {
    const value = resolveSeedValue(def, env);
    if (value === null) {
      skipped += 1;
      continue;
    }

    if (onlyMissing) {
      const existing = await getPlatformSettingRow(client, def.key);
      if (existing?.value != null && existing.value !== "") {
        skipped += 1;
        continue;
      }
    }

    const had = await getPlatformSettingRow(client, def.key);
    await upsertPlatformSetting(client, def.key, value, updatedBy);
    if (had?.value != null && had.value !== "") updated += 1;
    else inserted += 1;
  }

  return { inserted, updated, skipped };
}

let seedInFlight: Promise<SeedPlatformSettingsResult | null> | null = null;

export async function ensurePlatformSettingsSeeded(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SeedPlatformSettingsResult | null> {
  const client = createServiceClient();
  if (!client) return null;

  if (!seedInFlight) {
    seedInFlight = seedPlatformSettings(client, env, { onlyMissing: true }).finally(() => {
      seedInFlight = null;
    });
  }
  return seedInFlight;
}

export function loadDotEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function applyDotEnvToProcess(
  envPath: string,
  options?: { force?: boolean },
): void {
  const vars = loadDotEnvFile(envPath);
  for (const [k, v] of Object.entries(vars)) {
    if (options?.force || process.env[k] === undefined || process.env[k] === "") {
      process.env[k] = v;
    }
  }
}
