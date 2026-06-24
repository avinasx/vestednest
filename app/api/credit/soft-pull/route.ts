import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getApplication, updateApplicationAfterSoftPull } from "@/lib/applications";
import { runISoftpullSoftPull } from "@/lib/credit/isoftpull";
import { getClientIp } from "@/lib/rate-limit";
import { dealToEngineInput } from "@/lib/deal/map-to-engine";
import { solve } from "@/lib/vn-engine";
import type { DealState } from "@/lib/deal/types";
import type { Json } from "@/types/database";

const schema = z.object({
  applicationId: z.string().uuid(),
  consent: z.literal(true),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zip: z.string().min(5),
  ssn: z.string().optional(),
  dateOfBirth: z.string().optional(),
  deal: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required before soft pull" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const app = await getApplication(parsed.data.applicationId);
    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (app.user_id && app.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pull = await runISoftpullSoftPull({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      zip: parsed.data.zip,
      ssn: parsed.data.ssn,
      dateOfBirth: parsed.data.dateOfBirth,
    });

    const deal = parsed.data.deal as DealState | undefined;
    const priorFico = app.fico;
    let quote = null;

    if (pull.fico && deal) {
      const engineIn = dealToEngineInput({ ...deal, fico: pull.fico, ficoUnknown: false });
      quote = solve(engineIn);
    }

    const dealSnapshot: Json | undefined = deal
      ? JSON.parse(JSON.stringify(deal && quote ? { ...deal, fico: pull.fico, quote } : deal))
      : undefined;

    await updateApplicationAfterSoftPull(parsed.data.applicationId, {
      fico: pull.fico,
      termSheet: quote ? (JSON.parse(JSON.stringify(quote)) as Json) : undefined,
      dealSnapshot,
      vendorRef: pull.vendorRef,
      consentIp: getClientIp(request),
    });

    return NextResponse.json({
      ok: true,
      fico: pull.fico,
      quote,
      reportLink: pull.reportLink,
      repriced: quote ? { rate: quote.rate, priorFico } : null,
      message:
        pull.fico && priorFico && pull.fico !== priorFico
          ? `Verified FICO ${pull.fico} — we'll update your quote if the rate shifts.`
          : pull.fico
            ? "Soft pull complete — no impact to your credit score."
            : "Soft pull completed — score pending vendor report.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Soft pull failed";
    const status = message.includes("not configured") ? 503 : 502;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
