import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import type { RateSettings } from "@/lib/dscr";
import { getIntegrationStatus } from "@/lib/settings";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/types/database";

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
    state_eligibility?: unknown;
    feature_flags?: Record<string, boolean>;
  };

  const updatePayload: {
    rate_settings?: Json;
    funded_states?: string[];
    state_eligibility?: Json;
    feature_flags?: Json;
    updated_by: string;
  } = { updated_by: profile!.id };

  if (body.rate_settings !== undefined) {
    updatePayload.rate_settings = body.rate_settings as Json;
  }
  if (body.funded_states !== undefined) {
    updatePayload.funded_states = body.funded_states;
  }
  if (body.state_eligibility !== undefined) {
    updatePayload.state_eligibility = body.state_eligibility as Json;
  }
  if (body.feature_flags !== undefined) {
    updatePayload.feature_flags = body.feature_flags as Json;
  }

  const { data, error: updateError } = await service
    .from("admin_settings")
    .update(updatePayload)
    .eq("id", 1)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
