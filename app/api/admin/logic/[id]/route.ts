import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import { deleteLogicDocument, getLogicDocument } from "@/lib/logic-documents";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const { id } = await params;
  const doc = await getLogicDocument(id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ document: doc });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const { id } = await params;
  const ok = await deleteLogicDocument(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
