import { NextResponse } from "next/server";
import { promoteSuperadminIfEligible } from "@/lib/auth/superadmin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await promoteSuperadminIfEligible();
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Keep the popup flow intact on failure so it can report back and close.
  if (next.startsWith("/auth/popup-done")) {
    return NextResponse.redirect(`${origin}/auth/popup-done?error=auth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
