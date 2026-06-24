import { NextResponse } from "next/server";
import { getApplication } from "@/lib/applications";
import type { TermSheet } from "@/lib/dscr";
import { quoteToTermSheet } from "@/lib/deal/map-to-engine";
import { generateTermSheetPdf } from "@/lib/pdf/term-sheet";
import { sendTermSheetEmail } from "@/lib/sendgrid";
import { termSheetFilename } from "@/components/flow/utils";
import { ensureServerSettings } from "@/lib/settings";
import type { QuoteResult } from "@/lib/vn-engine";
import type { DealState } from "@/lib/deal/types";

export async function POST(request: Request) {
  await ensureServerSettings();

  try {
    const body = (await request.json()) as {
      id?: string;
      email?: string;
      deal?: DealState;
      quote?: QuoteResult;
    };
    const { id, email, deal, quote } = body;

    if (!email?.includes("@")) {
      return NextResponse.json({ error: "valid email is required" }, { status: 400 });
    }

    let address: string;
    let termSheet: TermSheet;
    let monthlyRent: number;
    let borrowerType: string;
    let loanId: string | undefined;

    if (deal && quote) {
      address = deal.formattedAddress ?? "Property";
      termSheet = quoteToTermSheet(quote) as unknown as TermSheet;
      monthlyRent = deal.monthlyRent ?? deal.intel?.estimatedRent ?? 0;
      borrowerType = deal.borrowerType ?? "llc";
      loanId = deal.applicationId?.slice(0, 8).toUpperCase();
    } else if (id) {
      const app = await getApplication(id);
      if (!app?.term_sheet) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }
      address = app.address;
      termSheet = app.term_sheet as unknown as TermSheet;
      monthlyRent =
        (app.property_intel as { estimatedRent?: number } | null)?.estimatedRent ?? 0;
      borrowerType = app.borrower_type ?? "llc";
      loanId = app.id.slice(0, 8).toUpperCase();
    } else {
      return NextResponse.json(
        { error: "id or deal+quote are required" },
        { status: 400 },
      );
    }

    const filename = termSheetFilename(address);
    const pdf = await generateTermSheetPdf({
      address,
      termSheet,
      monthlyRent,
      borrowerType,
      loanId,
    });

    const result = await sendTermSheetEmail({
      to: email,
      address,
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
