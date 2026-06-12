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

    const brandGreen = "#24933E";
    const textDark = "#0F0E0C";
    const textMuted = "#555554";
    const borderGray = "#E5E2DF";

    // Header
    doc.font("Helvetica-Bold").fontSize(26).fillColor(brandGreen).text("vestednest", 50, 50);
    
    doc.font("Helvetica-Bold").fontSize(10).fillColor(textMuted).text("INDICATIVE TERM SHEET", 0, 60, { align: "right", width: 560 });

    doc.moveTo(50, 90).lineTo(562, 90).lineWidth(1).strokeColor(brandGreen).stroke();

    // Property Title
    doc.moveDown(1.5);
    doc.font("Helvetica-Bold").fontSize(18).fillColor(textDark).text(address, 50, 110);
    doc.font("Helvetica").fontSize(10).fillColor(textMuted).text(`Generated ${new Date().toLocaleDateString()}${loanId ? `  •  Ref: ${loanId}` : ""}`);

    // Highlight Box
    doc.roundedRect(50, 160, 512, 100, 8).fillColor("#F2F2ED").fill();

    // Rate
    doc.font("Helvetica-Bold").fontSize(32).fillColor(brandGreen).text(`${ts.rate.toFixed(2)}%`, 70, 185);
    doc.font("Helvetica").fontSize(10).fillColor(textMuted).text("INTEREST RATE", 70, 225);

    // DSCR
    doc.font("Helvetica-Bold").fontSize(24).fillColor(textDark).text(`${ts.dscr}x`, 250, 192);
    doc.font("Helvetica").fontSize(10).fillColor(textMuted).text("DSCR", 250, 225);

    // LTV
    doc.font("Helvetica-Bold").fontSize(24).fillColor(textDark).text(`${ts.ltv}%`, 350, 192);
    doc.font("Helvetica").fontSize(10).fillColor(textMuted).text("LTV", 350, 225);

    // Cash to close
    doc.font("Helvetica-Bold").fontSize(24).fillColor(textDark).text(`$${(ts.cashToClose / 1000).toFixed(1)}k`, 450, 192);
    doc.font("Helvetica").fontSize(10).fillColor(textMuted).text("EST. TO CLOSE", 450, 225);

    // Details Header
    doc.font("Helvetica-Bold").fontSize(14).fillColor(textDark).text("Loan Details", 50, 300);
    doc.moveTo(50, 325).lineTo(562, 325).lineWidth(1).strokeColor(borderGray).stroke();

    // Two-column layout for details
    const col1X = 50;
    const col2X = 320;
    let yPos = 345;
    const rowHeight = 35;

    const drawDetail = (label: string, value: string, x: number, y: number) => {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(textMuted).text(label.toUpperCase(), x, y);
      doc.font("Helvetica").fontSize(12).fillColor(textDark).text(value, x, y + 12);
    };

    drawDetail("Loan Amount", `$${ts.loanAmount.toLocaleString()}`, col1X, yPos);
    drawDetail("Est. Monthly Rent", `$${monthlyRent.toLocaleString()}`, col2X, yPos);
    
    yPos += rowHeight;
    drawDetail("Monthly PITIA", `$${ts.monthlyPitia.toLocaleString()}`, col1X, yPos);
    drawDetail("Term", ts.termLabel, col2X, yPos);
    
    yPos += rowHeight;
    drawDetail("Prepay Penalty", ts.prepayLabel, col1X, yPos);
    drawDetail("Borrower Type", borrowerType, col2X, yPos);
    
    yPos += rowHeight;
    drawDetail("Origination", `${ts.originationPts} pts ($${ts.originationFee.toLocaleString()})`, col1X, yPos);
    drawDetail("Reserves", `$${ts.reserves.toLocaleString()} (${ts.reservesMonths} mo)`, col2X, yPos);
    
    yPos += rowHeight;
    drawDetail("Qualifies", ts.qualifies ? "Yes (DSCR ≥ 1.0)" : "Below 1.0 DSCR threshold", col1X, yPos);

    // Footer
    doc.moveTo(50, 710).lineTo(562, 710).lineWidth(1).strokeColor(borderGray).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(textMuted)
       .text("This is an indicative term sheet only. Subject to appraisal, underwriting, and final approval.", 50, 730, { align: "center", width: 512 })
       .text("Not a commitment to lend. Rates and terms may change.", 50, 745, { align: "center", width: 512 });

    doc.end();
  });
}
