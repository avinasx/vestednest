import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import {
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  updateKnowledgeDocument,
} from "@/lib/knowledge-base";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const { id } = await params;
  const doc = await getKnowledgeDocument(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ document: doc });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    content?: string;
    source_url?: string;
  };

  const doc = await updateKnowledgeDocument(id, body);
  if (!doc) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ document: doc });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const { id } = await params;
  const ok = await deleteKnowledgeDocument(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
