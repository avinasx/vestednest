import { NextResponse } from "next/server";
import { initiateCallTransfer, isTwilioConfigured } from "@/lib/twilio";

export async function POST(request: Request) {
  if (!isTwilioConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Twilio not configured",
        hint: "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER",
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      to?: string;
      loanOfficerPhone?: string;
      applicationId?: string;
    };

    if (!body.to) {
      return NextResponse.json({ error: "to phone number is required" }, { status: 400 });
    }

    const result = await initiateCallTransfer({
      to: body.to,
      loanOfficerPhone: body.loanOfficerPhone,
      applicationId: body.applicationId,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, callSid: result.callSid });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Call transfer failed" },
      { status: 500 },
    );
  }
}
