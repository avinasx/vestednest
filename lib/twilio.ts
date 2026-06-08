import twilio from "twilio";

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER,
  );
}

export function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function initiateCallTransfer(input: {
  to: string;
  loanOfficerPhone?: string;
  applicationId?: string;
}): Promise<{ ok: boolean; callSid?: string; error?: string }> {
  if (!isTwilioConfigured()) {
    return { ok: false, error: "Twilio is not configured" };
  }

  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER!;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const call = await client!.calls.create({
      to: input.to,
      from,
      url: `${baseUrl}/api/calls/twiml?lo=${encodeURIComponent(input.loanOfficerPhone ?? "")}`,
      statusCallback: `${baseUrl}/api/calls/status`,
      statusCallbackEvent: ["completed"],
    });
    return { ok: true, callSid: call.sid };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Call failed",
    };
  }
}
