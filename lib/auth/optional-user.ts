import { createClient } from "@/lib/supabase/server";

/** Best-effort session read — never throws; returns null when unauthenticated. */
export async function getOptionalUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export type ChatIdentity = {
  sessionId: string;
  userId: string | null;
  threadId: string;
  memoryContainer: string;
};

export function resolveChatIdentity(
  sessionId: string,
  userId?: string | null,
): ChatIdentity {
  const sid = sessionId.trim() || "anonymous";
  const uid = userId?.trim() || null;
  return {
    sessionId: sid,
    userId: uid,
    threadId: uid ?? sid,
    memoryContainer: uid ? `vestednest-user-${uid}` : `vestednest-${sid}`,
  };
}
