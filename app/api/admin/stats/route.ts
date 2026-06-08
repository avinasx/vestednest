import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const service = createServiceClient();
  if (!service) {
    return NextResponse.json({
      applications: 0,
      inquiries: 0,
      knowledgeDocs: 0,
      loanOfficers: 0,
    });
  }

  const [apps, inquiries, kb, lo] = await Promise.all([
    service.from("applications").select("id", { count: "exact", head: true }),
    service.from("loan_inquiries").select("id", { count: "exact", head: true }),
    service.from("knowledge_documents").select("id", { count: "exact", head: true }),
    service.from("loan_officers").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    applications: apps.count ?? 0,
    inquiries: inquiries.count ?? 0,
    knowledgeDocs: kb.count ?? 0,
    loanOfficers: lo.count ?? 0,
  });
}
