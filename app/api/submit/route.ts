import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { submitApplicationFull } from "@/lib/applications";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEccReferralEmail } from "@/lib/referral/ecc";

const schema = z.object({
  applicationId: z.string().uuid(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  consent: z.boolean(),
  deal: z.record(z.string(), z.unknown()).optional(),
  referralPartner: z.string().optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/submit", 10);
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required to submit" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (!parsed.data.consent) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    const deal = parsed.data.deal as { fundingLane?: string } | undefined;
    const referralPartner =
      parsed.data.referralPartner ??
      (deal?.fundingLane === "ecc-referral" ? "ECC" : undefined);

    const app = await submitApplicationFull({
      applicationId: parsed.data.applicationId,
      email: parsed.data.email ?? user.email ?? undefined,
      phone: parsed.data.phone,
      dealSnapshot: parsed.data.deal as never,
      referralPartner,
    });

    if (!app) {
      return NextResponse.json({ error: "Submit failed" }, { status: 500 });
    }

    if (referralPartner === "ECC") {
      await sendEccReferralEmail({
        applicationId: app.id,
        address: app.address,
        dealSnapshot: parsed.data.deal,
        email: parsed.data.email ?? user.email ?? undefined,
      });
    }

    return NextResponse.json({
      applicationId: app.id,
      status: "submitted",
      message: "Application submitted successfully.",
      referralPartner: referralPartner ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Submit failed" },
      { status: 500 },
    );
  }
}
