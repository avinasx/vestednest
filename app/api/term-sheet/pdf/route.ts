import { NextResponse } from "next/server";
import { getApplication } from "@/lib/applications";
import type { TermSheet } from "@/lib/dscr";
import { generateTermSheetPdf } from "@/lib/pdf/term-sheet";
import { termSheetFilename } from "@/components/flow/utils";

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
