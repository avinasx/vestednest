import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMetaConversionEvent } from "@/lib/analytics/meta-capi";

const schema = z.object({
  event: z.string(),
}).passthrough();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[analytics]", parsed.data.event, parsed.data);
    }

    await sendMetaConversionEvent(parsed.data.event, parsed.data as Record<string, unknown>);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
