/**
 * Seed platform_settings from .env + definition defaults.
 *
 *   npx tsx scripts/seed-platform-settings.ts
 *   npx tsx scripts/seed-platform-settings.ts --overwrite
 */
import { createClient } from "@supabase/supabase-js";
import { applyDotEnvToProcess, seedPlatformSettings } from "../lib/platform/seed";
import { resolve } from "node:path";

const cwd = process.cwd();
applyDotEnvToProcess(resolve(cwd, ".env"));
applyDotEnvToProcess(resolve(cwd, ".env.local"), { force: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const overwrite = process.argv.includes("--overwrite");

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

async function main() {
  const client = createClient(url!, key!);
  const result = await seedPlatformSettings(client, process.env, {
    onlyMissing: !overwrite,
    overwrite,
  });
  console.log("Platform settings seed complete:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
