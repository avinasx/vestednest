import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const name =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email ??
      "Account";

    return (
      <div className="flex items-center gap-4">
        <span className="hidden max-w-[140px] truncate text-sm text-black/70 sm:inline">
          {name}
        </span>
        <SignOutButton />
      </div>
    );
  }

  return (
    <Link href="/login" className="hidden text-base text-black sm:inline">
      Sign in
    </Link>
  );
}
