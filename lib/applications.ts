import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/types/database";

export type ApplicationStatus =
  | "draft"
  | "property_loaded"
  | "term_sheet"
  | "prequal_submitted"
  | "under_review"
  | "closed";

export type ApplicationRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  address: string;
  property_intel: Json | null;
  term_sheet: Json | null;
  fico: number | null;
  borrower_type: string | null;
  purpose: string | null;
  status: string;
  prequal_consent_at: string | null;
  loan_officer_id: string | null;
  created_at: string;
  updated_at: string;
};

async function getWriteClient() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (user) return { client: userClient, userId: user.id };

  const service = createServiceClient();
  return { client: service, userId: null as string | null };
}

export async function upsertApplication(input: {
  sessionId: string;
  address: string;
  propertyIntel?: Json;
  termSheet?: Json;
  fico?: number;
  borrowerType?: string;
  purpose?: string;
  status?: ApplicationStatus;
  applicationId?: string;
}): Promise<ApplicationRow | null> {
  const { client, userId } = await getWriteClient();
  if (!client) return null;

  if (input.applicationId) {
    const { data, error } = await client
      .from("applications")
      .update({
        address: input.address,
        property_intel: input.propertyIntel,
        term_sheet: input.termSheet,
        fico: input.fico,
        borrower_type: input.borrowerType,
        purpose: input.purpose,
        status: input.status,
        user_id: userId,
      })
      .eq("id", input.applicationId)
      .select()
      .single();

    return error ? null : (data as ApplicationRow);
  }

  const { data: existing } = await client
    .from("applications")
    .select("id")
    .eq("session_id", input.sessionId)
    .in("status", ["draft", "property_loaded", "term_sheet"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await client
      .from("applications")
      .update({
        address: input.address,
        property_intel: input.propertyIntel,
        term_sheet: input.termSheet,
        fico: input.fico,
        borrower_type: input.borrowerType,
        purpose: input.purpose,
        status: input.status ?? "property_loaded",
        user_id: userId,
      })
      .eq("id", existing.id)
      .select()
      .single();

    return error ? null : (data as ApplicationRow);
  }

  const { data, error } = await client
    .from("applications")
    .insert({
      session_id: input.sessionId,
      user_id: userId,
      address: input.address,
      property_intel: input.propertyIntel,
      term_sheet: input.termSheet,
      fico: input.fico,
      borrower_type: input.borrowerType,
      purpose: input.purpose,
      status: input.status ?? "draft",
    })
    .select()
    .single();

  return error ? null : (data as ApplicationRow);
}

export async function getApplication(id: string): Promise<ApplicationRow | null> {
  const service = createServiceClient();
  const client = service ?? (await createClient());

  const { data } = await client
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  return (data as ApplicationRow) ?? null;
}

export async function submitPrequal(
  id: string,
  consentIp: string,
): Promise<ApplicationRow | null> {
  const { client } = await getWriteClient();
  if (!client) return null;

  const { data, error } = await client
    .from("applications")
    .update({
      status: "prequal_submitted",
      prequal_consent_at: new Date().toISOString(),
      prequal_consent_ip: consentIp,
    })
    .eq("id", id)
    .select()
    .single();

  return error ? null : (data as ApplicationRow);
}

export async function getCloseTrackerData(applicationId: string) {
  const app = await getApplication(applicationId);
  if (!app) return null;

  const service = createServiceClient();
  let loanOfficer = null;

  if (app.loan_officer_id && service) {
    const { data } = await service
      .from("loan_officers")
      .select("name, email, phone, title, avatar_initials")
      .eq("id", app.loan_officer_id)
      .single();
    loanOfficer = data;
  }

  if (!loanOfficer && service) {
    const { data } = await service
      .from("loan_officers")
      .select("name, email, phone, title, avatar_initials")
      .eq("active", true)
      .limit(1)
      .maybeSingle();
    loanOfficer = data;
  }

  const statusSteps: Record<string, { label: string; pct: number; status: string }[]> = {
    prequal_submitted: [
      { label: "Submitted", pct: 100, status: "Done ✓" },
      { label: "Appraisal", pct: 30, status: "Day 1–3" },
      { label: "Underwriting", pct: 15, status: "Parallel" },
      { label: "Clear to close", pct: 0, status: "Day 10–12" },
      { label: "Wire + Close", pct: 0, status: "Day 14" },
    ],
    under_review: [
      { label: "Submitted", pct: 100, status: "Done ✓" },
      { label: "Appraisal", pct: 60, status: "In progress" },
      { label: "Underwriting", pct: 40, status: "In progress" },
      { label: "Clear to close", pct: 0, status: "Pending" },
      { label: "Wire + Close", pct: 0, status: "Day 14" },
    ],
    default: [
      { label: "Submitted", pct: 100, status: "Done ✓" },
      { label: "Appraisal", pct: 30, status: "Day 1–3" },
      { label: "Underwriting", pct: 15, status: "Parallel" },
      { label: "Clear to close", pct: 0, status: "Day 10–12" },
      { label: "Wire + Close", pct: 0, status: "Day 14" },
    ],
  };

  return {
    application: app,
    steps: statusSteps[app.status] ?? statusSteps.default,
    daysToClose: 14,
    loanOfficer: loanOfficer ?? {
      name: "Marcus Rodriguez",
      email: "marcus@vestednest.com",
      phone: null,
      title: "Senior Underwriter",
      avatar_initials: "MR",
    },
    twilioEnabled: Boolean(process.env.TWILIO_ACCOUNT_SID),
  };
}
