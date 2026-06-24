import { NextResponse } from "next/server";
import { getApplication } from "@/lib/applications";
import type { TermSheet } from "@/lib/dscr";
import { quoteToTermSheet } from "@/lib/deal/map-to-engine";
import { generateTermSheetPdf } from "@/lib/pdf/term-sheet";
import { termSheetFilename } from "@/components/flow/utils";
import type { QuoteResult } from "@/lib/vn-engine";
import type { DealState } from "@/lib/deal/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      deal?: DealState;
      quote?: QuoteResult;
    };

    const { deal, quote } = body;
    if (!deal?.formattedAddress || !quote) {
      return NextResponse.json({ error: "deal and quote are required" }, { status: 400 });
    }

    const termSheet = quoteToTermSheet(quote) as unknown as TermSheet;
    const pdf = await generateTermSheetPdf({
      address: deal.formattedAddress,
      termSheet,
      monthlyRent: deal.monthlyRent ?? deal.intel?.estimatedRent ?? 0,
      borrowerType: deal.borrowerType ?? "llc",
      loanId: deal.applicationId?.slice(0, 8).toUpperCase(),
    });

    const filename = termSheetFilename(deal.formattedAddress);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PDF generation failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const app = await getApplication(id);
  if (!app?.term_sheet) {
    return NextResponse.json({ error: "Application or term sheet not found" }, { status: 404 });
  }

  const termSheet = app.term_sheet as unknown as TermSheet;
  const pdf = await generateTermSheetPdf({
    address: app.address,
    termSheet,
    monthlyRent:
      (app.property_intel as { estimatedRent?: number } | null)?.estimatedRent ?? 0,
    borrowerType: app.borrower_type ?? "llc",
    loanId: app.id.slice(0, 8).toUpperCase(),
  });

  const filename = termSheetFilename(app.address);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
