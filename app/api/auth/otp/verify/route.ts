import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { linkApplicationToUser } from "@/lib/applications";

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(8),
  applicationId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const limited = checkRateLimit(request, "/api/auth/otp/verify", 10);
  if (limited) return limited;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });

  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  if (parsed.data.applicationId) {
    await linkApplicationToUser(parsed.data.applicationId, data.user.id, parsed.data.email);
  }

  return NextResponse.json({
    ok: true,
    user: { id: data.user.id, email: data.user.email },
  });
}
