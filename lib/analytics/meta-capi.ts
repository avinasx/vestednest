const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;

export async function sendMetaConversionEvent(
  eventName: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  const email = typeof payload.email === "string" ? payload.email : undefined;

  await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: email
            ? { em: [await sha256(email.toLowerCase().trim())] }
            : {},
          custom_data: payload,
        },
      ],
      access_token: ACCESS_TOKEN,
    }),
  });
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
