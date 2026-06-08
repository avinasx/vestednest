import { NextResponse } from "next/server";
import { getApplication } from "@/lib/applications";
import type { TermSheet } from "@/lib/dscr";
import { generateTermSheetPdf } from "@/lib/pdf/term-sheet";
import { sendTermSheetEmail } from "@/lib/sendgrid";
import { termSheetFilename } from "@/components/flow/utils";
import { ensureServerSettings } from "@/lib/settings";

export async function POST(request: Request) {
  await ensureServerSettings();

  try {
    const body = (await request.json()) as { id?: string; email?: string };
    const { id, email } = body;

    if (!id || !email?.includes("@")) {
      return NextResponse.json(
        { error: "id and valid email are required" },
        { status: 400 },
      );
    }

    const app = await getApplication(id);
    if (!app?.term_sheet) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const termSheet = app.term_sheet as unknown as TermSheet;
    const filename = termSheetFilename(app.address);
    const pdf = await generateTermSheetPdf({
      address: app.address,
      termSheet,
      monthlyRent:
        (app.property_intel as { estimatedRent?: number } | null)?.estimatedRent ?? 0,
      borrowerType: app.borrower_type ?? "llc",
      loanId: app.id.slice(0, 8).toUpperCase(),
    });

    const result = await sendTermSheetEmail({
      to: email,
      address: app.address,
      pdfBuffer: pdf,
      filename,
    });

    return NextResponse.json({
      ok: result.sent || result.queued,
      sent: result.sent,
      queued: result.queued,
      message: result.sent
        ? "Term sheet emailed"
        : result.queued
          ? "Email queued — SendGrid not configured"
          : result.error ?? "Email failed",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email failed" },
      { status: 500 },
    );
  }
}
