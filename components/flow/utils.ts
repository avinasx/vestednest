import type { DealState } from "./types";

export function fmtMoney(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function createLoanReference() {
  return `VN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  const key = "vn-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 100) + "px";
}

export function borrowerLabel(t: DealState["borrowerType"]) {
  if (t === "llc") return "LLC / Entity";
  if (t === "foreign") return "Foreign National";
  return "Individual";
}

export function termSheetFilename(address: string) {
  const slug = address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return `vestednest_termsheet_${slug || "property"}.pdf`;
}
