import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

function getSuperadminEmails(): string[] {
  const raw = process.env.SUPERADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Promote configured emails to superadmin on login. */
export async function promoteSuperadminIfEligible(): Promise<void> {
  const emails = getSuperadminEmails();
  if (emails.length === 0) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return;

  const email = user.email.toLowerCase();
  if (!emails.includes(email)) return;

  const service = createServiceClient();
  if (!service) return;

  await service
    .from("profiles")
    .update({ role: "superadmin" })
    .eq("id", user.id)
    .neq("role", "superadmin");
}
