import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import type { RateSettings } from "@/lib/dscr";
import { getIntegrationStatus } from "@/lib/settings";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const [{ data }, envStatus] = await Promise.all([
    service.from("admin_settings").select("*").eq("id", 1).single(),
    getIntegrationStatus(),
  ]);

  return NextResponse.json({
    settings: data,
    envStatus,
  });
}

export async function PATCH(request: Request) {
  const { profile, error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const body = (await request.json()) as {
    rate_settings?: RateSettings;
    funded_states?: string[];
    feature_flags?: Record<string, boolean>;
  };

  const { data, error: updateError } = await service
    .from("admin_settings")
    .update({
      rate_settings: body.rate_settings,
      funded_states: body.funded_states,
      feature_flags: body.feature_flags,
      updated_by: profile!.id,
    })
    .eq("id", 1)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
