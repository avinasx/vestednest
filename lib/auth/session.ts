import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Enums"]["user_role"];

export type SessionProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
};

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? null,
      fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      role: "user",
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
  };
}

export function isSuperadmin(role: UserRole): boolean {
  return role === "superadmin";
}

export function isAdminOrSuperadmin(role: UserRole): boolean {
  return role === "admin" || role === "superadmin";
}
