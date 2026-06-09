import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import { reindexKnowledgeDocument } from "@/lib/knowledge-base";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const { id } = await params;
  const doc = await reindexKnowledgeDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Reindex failed" }, { status: 500 });
  }

  return NextResponse.json({ document: doc });
}
