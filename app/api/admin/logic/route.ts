import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/admin";
import { getActiveLogicRules } from "@/lib/logic";
import {
  createLogicDocument,
  listLogicDocuments,
  syncLogicToAdminSettings,
} from "@/lib/logic-documents";
import { buildDefaultParsedRules } from "@/lib/logic/defaults";
import { sanitizeContent } from "@/lib/sanitize";
import type { LogicSourceType } from "@/lib/logic/types";

export async function GET() {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const [documents, activeRules] = await Promise.all([
    listLogicDocuments(),
    getActiveLogicRules(),
  ]);

  return NextResponse.json({ documents, activeRules });
}

export async function POST(request: Request) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      title?: string;
      source_type?: LogicSourceType;
      content?: string;
      file_path?: string;
      version?: string;
      sync_settings?: boolean;
    };

    if (!body.title || !body.source_type || !body.content?.trim()) {
      return NextResponse.json(
        { error: "title, source_type, and content are required" },
        { status: 400 },
      );
    }

    const parsed_rules =
      body.source_type === "state_licensing" ||
      body.source_type === "rate_sheet" ||
      body.source_type === "guidelines"
        ? buildDefaultParsedRules()
        : null;

    const doc = await createLogicDocument({
      title: body.title,
      source_type: body.source_type,
      sanitized_content: sanitizeContent(body.content),
      file_path: body.file_path ?? null,
      parsed_rules,
      version: body.version ?? "1.0",
    });

    if (!doc) {
      return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
    }

    if (body.sync_settings && parsed_rules) {
      await syncLogicToAdminSettings(parsed_rules);
    }

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { error } = await requireSuperadmin();
  if (error) return error;

  const body = (await request.json()) as {
    state_eligibility?: unknown;
    rate_settings?: unknown;
  };

  const rules = await getActiveLogicRules();
  if (body.state_eligibility) {
    rules.stateMatrix = body.state_eligibility as typeof rules.stateMatrix;
  }
  if (body.rate_settings) {
    rules.rateSettings = {
      ...rules.rateSettings,
      ...(body.rate_settings as typeof rules.rateSettings),
    };
  }

  const ok = await syncLogicToAdminSettings(rules);
  if (!ok) {
    return NextResponse.json({ error: "Failed to sync settings" }, { status: 500 });
  }

  return NextResponse.json({ activeRules: rules });
}
