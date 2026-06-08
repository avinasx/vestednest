import { NextResponse } from "next/server";
import { getSessionProfile, isSuperadmin } from "./session";
import { promoteSuperadminIfEligible } from "./superadmin";

export async function requireSuperadmin() {
  await promoteSuperadminIfEligible();

  const profile = await getSessionProfile();
  if (!profile || !isSuperadmin(profile.role)) {
    return {
      profile: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { profile, error: null };
}

export async function requireAuth() {
  const profile = await getSessionProfile();
  if (!profile) {
    return {
      profile: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { profile, error: null };
}
