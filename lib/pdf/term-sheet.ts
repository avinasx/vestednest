import PDFDocument from "pdfkit";
import type { TermSheet } from "@/lib/dscr";

export type TermSheetPdfInput = {
  address: string;
  termSheet: TermSheet;
  monthlyRent: number;
  borrowerType: string;
  loanId?: string;
};

export function generateTermSheetPdf(input: TermSheetPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { address, termSheet: ts, monthlyRent, borrowerType, loanId } = input;

    doc
      .fontSize(22)
      .fillColor("#1F4D31")
      .text("vestednest", { continued: true })
      .fontSize(10)
      .fillColor("#666")
      .text("  ·  INDICATIVE TERM SHEET", { align: "right" });

    doc.moveDown(1.5);
    doc.fontSize(16).fillColor("#111").text(address);
    doc.fontSize(10).fillColor("#666").text("DSCR Loan · Generated " + new Date().toLocaleDateString());
    if (loanId) doc.text(`Reference: ${loanId}`);

    doc.moveDown(1);
    doc
      .fontSize(28)
      .fillColor("#1F4D31")
      .text(`${ts.rate.toFixed(2)}%`, { continued: true })
      .fontSize(12)
      .fillColor("#666")
      .text("  interest rate");

    doc.moveDown(0.5);
    const highlights = [
      ["DSCR", `${ts.dscr}x`],
      ["Monthly PITIA", `$${ts.monthlyPitia.toLocaleString()}`],
      ["Loan Amount", `$${ts.loanAmount.toLocaleString()}`],
      ["LTV", `${ts.ltv}%`],
      ["Cash to Close", `$${ts.cashToClose.toLocaleString()}`],
    ];

    highlights.forEach(([label, value]) => {
      doc.fontSize(10).fillColor("#666").text(`${label}: `, { continued: true });
      doc.fontSize(12).fillColor("#111").text(value);
    });

    doc.moveDown(1);
    doc.fontSize(10).fillColor("#666");
    const details = [
      ["Term", ts.termLabel],
      ["Prepay Penalty", ts.prepayLabel],
      ["Origination", `${ts.originationPts} pts ($${ts.originationFee.toLocaleString()})`],
      ["Est. Monthly Rent", `$${monthlyRent.toLocaleString()}`],
      ["Reserves", `$${ts.reserves.toLocaleString()} (${ts.reservesMonths} mo)`],
      ["Borrower Type", borrowerType],
      ["Qualifies", ts.qualifies ? "Yes (DSCR ≥ 1.0)" : "Below 1.0 DSCR threshold"],
    ];

    details.forEach(([k, v]) => {
      doc.text(`${k}: ${v}`);
    });

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        "This is an indicative term sheet only. Subject to appraisal, underwriting, and final approval. " +
          "Not a commitment to lend. Rates and terms may change.",
        { align: "center" },
      );

    doc.end();
  });
}
