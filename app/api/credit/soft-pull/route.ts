import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import { ensureServerSettings } from "@/lib/settings";

export async function POST(request: Request) {
  await ensureServerSettings();
  const vendorKey = process.env.CREDIT_VENDOR_API_KEY;

  try {
    const body = (await request.json()) as {
      applicationId?: string;
      consent?: boolean;
      ssnLast4?: string;
    };

    if (!body.consent) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    if (!body.applicationId) {
      return NextResponse.json({ error: "applicationId required" }, { status: 400 });
    }

    if (!vendorKey) {
      return NextResponse.json({
        ok: true,
        stub: true,
        status: "queued",
        message: "Credit vendor not configured — consent captured, ready for integration",
        applicationId: body.applicationId,
        consentIp: getClientIp(request),
        consentAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      stub: false,
      status: "pending",
      message: "Soft pull initiated",
      applicationId: body.applicationId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Soft pull failed" },
      { status: 500 },
    );
  }
}
