import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";

type ApplyLinkProps = {
  className?: string;
  children: ReactNode;
};

export async function ApplyLink({ className, children }: ApplyLinkProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const href = user ? "/apply" : "/login?next=/apply";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
