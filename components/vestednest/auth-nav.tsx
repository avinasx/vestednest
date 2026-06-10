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
      <div className="secondary-auth-user">
        <span className="secondary-auth-name">{name}</span>
        <SignOutButton />
      </div>
    );
  }

  return (
    <Link href="/login" className="landing-nav-signin">
      Sign in
    </Link>
  );
}
