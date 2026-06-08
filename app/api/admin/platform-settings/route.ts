import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import {
  listPlatformSettingsForAdmin,
  PLATFORM_SETTING_BY_KEY,
  seedPlatformSettings,
  upsertPlatformSetting,
} from "@/lib/settings";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required to load platform settings." },
      { status: 503 },
    );
  }

  const settings = await listPlatformSettingsForAdmin(service, { revealSecrets: true });
  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const { profile, error } = await requireSuperadmin();
  if (error) return error;

  const body = (await request.json().catch(() => ({}))) as { overwrite?: boolean };
  const service = createServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY required to seed platform settings." },
      { status: 503 },
    );
  }

  const result = await seedPlatformSettings(service, process.env, {
    onlyMissing: !body.overwrite,
    overwrite: Boolean(body.overwrite),
    updatedBy: profile!.id,
  });
  const settings = await listPlatformSettingsForAdmin(service, { revealSecrets: true });
  return NextResponse.json({ result, settings });
}

export async function PATCH(request: Request) {
  const { profile, error } = await requireSuperadmin();
  if (error) return error;

  const body = (await request.json().catch(() => ({}))) as {
    settings?: Array<{ key: string; value: string | number | boolean | null }>;
  };

  if (!Array.isArray(body.settings)) {
    return NextResponse.json({ error: "settings array required" }, { status: 400 });
  }

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  for (const item of body.settings) {
    const def = PLATFORM_SETTING_BY_KEY[item.key];
    if (!def) {
      return NextResponse.json({ error: `Unknown key: ${item.key}` }, { status: 400 });
    }

    if (
      def.isSecret &&
      (item.value === "••••••••" ||
        item.value === "•••••••• (env)" ||
        item.value === "" ||
        item.value === null)
    ) {
      continue;
    }

    let value = item.value;
    if (def.type === "boolean" && typeof value === "string") {
      value = ["true", "1", "yes"].includes(value.toLowerCase());
    }

    await upsertPlatformSetting(service, item.key, value, profile!.id);
  }

  const settings = await listPlatformSettingsForAdmin(service, { revealSecrets: true });
  return NextResponse.json({ settings });
}
