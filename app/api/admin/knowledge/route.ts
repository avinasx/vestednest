import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import {
  createKnowledgeDocument,
  fetchUrlContent,
  listKnowledgeDocuments,
} from "@/lib/knowledge-base";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const docs = await listKnowledgeDocuments();
  return NextResponse.json({ documents: docs });
}

export async function POST(request: Request) {
  const { profile, error } = await requireSuperadmin();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      title?: string;
      source_type?: "markdown" | "pdf" | "url" | "docx";
      content?: string;
      source_url?: string;
    };

    if (!body.title || !body.source_type) {
      return NextResponse.json(
        { error: "title and source_type are required" },
        { status: 400 },
      );
    }

    let content = body.content ?? "";

    if (body.source_type === "url" && body.source_url) {
      content = await fetchUrlContent(body.source_url);
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const doc = await createKnowledgeDocument({
      title: body.title,
      source_type: body.source_type,
      content,
      source_url: body.source_url ?? null,
      created_by: profile!.id,
    });

    if (!doc) {
      return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 500 },
    );
  }
}
