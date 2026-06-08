import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/service";
import type { RateSettings } from "@/lib/dscr";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const { data } = await service.from("admin_settings").select("*").eq("id", 1).single();

  return NextResponse.json({
    settings: data,
    envStatus: {
      supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      realie: Boolean(process.env.REALIE_API_KEY),
      rentcast: Boolean(process.env.RENTCAST_API_KEY),
      gemini: Boolean(process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY),
      supermemory: Boolean(process.env.SUPERMEMORY_API_KEY),
      sendgrid: Boolean(process.env.SENDGRID_API_KEY),
      twilio: Boolean(process.env.TWILIO_ACCOUNT_SID),
      creditVendor: Boolean(process.env.CREDIT_VENDOR_API_KEY),
    },
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
