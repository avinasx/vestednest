/**
 * Seed logic documents and knowledge base from stakeholder docs folder.
 * Reads PDFs externally, sanitizes, stores extracts in Supabase — never commits raw PDFs.
 *
 * Usage: DOCS_DIR=/path/to/vestednest-docs npx tsx scripts/seed-stakeholder-docs.ts
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { buildDefaultParsedRules } from "../lib/logic/defaults";
import { sanitizeContent, sanitizeTitle } from "../lib/sanitize";

const DOCS_DIR =
  process.env.DOCS_DIR ??
  path.join(path.dirname(new URL(import.meta.url).pathname), "../../vestednest-docs");

const PASSWORD = process.env.RATE_SHEET_PASSWORD ?? "fund21";

const LOGIC_DOC_MAP: Record<string, { type: string; title: string }> = {
  "Main Guidelines.pdf": { type: "guidelines", title: "DSCR Underwriting Guidelines" },
  "Activator Prime Guidelines.pdf": { type: "guidelines", title: "Consumer Alt-Doc Guidelines" },
  "Ally No Ratio Guidelines.pdf": { type: "guidelines", title: "No Ratio Guidelines" },
  "Accelerator 1-4 Units.pdf": { type: "program_matrix", title: "DSCR 1-4 Unit Matrix" },
  "Accelerator 5-8 Units.pdf": { type: "program_matrix", title: "DSCR 5-8 Unit Matrix" },
  "Accelerator-Activator Alt Doc.pdf": { type: "program_matrix", title: "Business Purpose Alt Doc Matrix" },
  "Accelerator-Activator Full Doc.pdf": { type: "program_matrix", title: "Business Purpose Full Doc Matrix" },
  "FN-Ambassador-DSCR.pdf": { type: "program_matrix", title: "Foreign National DSCR Matrix" },
  "FN-Ambassador-2nd-Full-Alt.pdf": { type: "program_matrix", title: "Foreign National 2nd Matrix" },
  "ITIN DSCR.pdf": { type: "program_matrix", title: "ITIN DSCR Matrix" },
  "State Licensing Survey (Business Purpose).pdf": {
    type: "state_licensing",
    title: "State Licensing Matrix",
  },
  "Prepayment Penalty Licensing Chart (Business Purpose).pdf": {
    type: "prepay_licensing",
    title: "Prepayment Penalty Licensing",
  },
  "theLender_Business-Purpose-Rate-Sheet_6.8.2026.pdf": {
    type: "rate_sheet",
    title: "Business Purpose Rate Sheet (Jun 2026)",
  },
  "theLender_NONI58_6.8.2026.pdf": { type: "rate_sheet", title: "DSCR Rate Sheet NONI58 (Jun 2026)" },
  "ITIN-Rate-Sheet_6.8.2026.pdf": { type: "rate_sheet", title: "ITIN Rate Sheet (Jun 2026)" },
};

const KB_DOC_MAP: Record<string, string> = {
  "Main Guidelines.pdf": "DSCR Product FAQ — Underwriting Overview",
  "State Licensing Survey (Business Purpose).pdf": "State Eligibility FAQ",
  "Prepayment Penalty Licensing Chart (Business Purpose).pdf": "Prepayment Penalty FAQ by State",
};

async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      password: PASSWORD,
    });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: { str: string }) => item.str).join(" ") + "\n";
    }
    return text;
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`Docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const parsedRules = buildDefaultParsedRules();
  let logicCount = 0;
  let kbCount = 0;

  for (const [filename, meta] of Object.entries(LOGIC_DOC_MAP)) {
    const fullPath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Skip missing: ${filename}`);
      continue;
    }

    console.log(`Logic: ${filename}`);
    const raw = await extractPdfText(fullPath);
    const sanitized = sanitizeContent(raw).slice(0, 500_000);

    const includeRules =
      meta.type === "guidelines" ||
      meta.type === "state_licensing" ||
      meta.type === "rate_sheet";

    const title = sanitizeTitle(meta.title);
    const { data: existing } = await supabase
      .from("logic_documents")
      .select("id")
      .eq("title", title)
      .maybeSingle();

    const row = {
      title,
      source_type: meta.type,
      file_path: `external:${filename}`,
      sanitized_content: sanitized,
      parsed_rules: includeRules ? parsedRules : null,
      version: parsedRules.docVersions[meta.type] ?? "1.0",
    };

    if (existing?.id) {
      await supabase.from("logic_documents").update(row).eq("id", existing.id);
    } else {
      await supabase.from("logic_documents").insert(row);
    }
    logicCount++;
  }

  await supabase
    .from("admin_settings")
    .update({
      state_eligibility: parsedRules.stateMatrix,
      rate_settings: parsedRules.rateSettings,
      funded_states: parsedRules.stateMatrix
        .filter((s) => s.status !== "blocked")
        .map((s) => s.state),
    })
    .eq("id", 1);

  for (const [filename, kbTitle] of Object.entries(KB_DOC_MAP)) {
    const fullPath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(fullPath)) continue;

    console.log(`KB: ${filename}`);
    const raw = await extractPdfText(fullPath);
    const sanitized = sanitizeContent(raw).slice(0, 50_000);

    const { data: existing } = await supabase
      .from("knowledge_documents")
      .select("id")
      .eq("title", kbTitle)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("knowledge_documents")
        .update({ content: sanitized, source_type: "pdf" })
        .eq("id", existing.id);
    } else {
      await supabase.from("knowledge_documents").insert({
        title: kbTitle,
        source_type: "pdf",
        content: sanitized,
        file_path: `external:${filename}`,
      });
    }
    kbCount++;
  }

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "active-logic-rules.json"),
    JSON.stringify(parsedRules, null, 2),
  );

  console.log(`Done: ${logicCount} logic docs, ${kbCount} KB docs, admin_settings synced`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
