import { getSessionProfile, isSuperadmin } from "@/lib/auth/session";
import { promoteSuperadminIfEligible } from "@/lib/auth/superadmin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function wantsAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const dest = searchParams.get("dest") ?? "/apply";
  const next = searchParams.get("next") ?? "/auth/popup-done";
  const isPopupFlow = next.startsWith("/auth/popup-done");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await promoteSuperadminIfEligible();

      if (wantsAdminPath(dest)) {
        const profile = await getSessionProfile();
        if (!profile || !isSuperadmin(profile.role)) {
          return NextResponse.redirect(`${origin}/auth/popup-done?error=denied`);
        }
      }

      if (isPopupFlow) {
        return NextResponse.redirect(`${origin}/auth/popup-done`);
      }

      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  // Keep the popup flow intact on failure so it can report back and close.
  if (isPopupFlow) {
    return NextResponse.redirect(`${origin}/auth/popup-done?error=auth`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
