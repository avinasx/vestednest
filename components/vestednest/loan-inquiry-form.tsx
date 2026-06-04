"use client";

import type { InquiryPayload } from "@/app/api/inquiries/route";
import type {
  BorrowerType,
  InvestmentHorizon,
  LoanStrategy,
} from "@/types/database";
import { useState } from "react";
import { PropertySummary } from "./property-summary";

const tabs: { label: string; value: LoanStrategy }[] = [
  { label: "Purchase New Deal", value: "purchase" },
  { label: "Refi Rate & term", value: "refi_rate_term" },
  { label: "Cash-out Pull equity", value: "cash_out" },
  { label: "Bridge → DSCR Balloon exit", value: "bridge_to_dscr" },
];

const ficoOptions = ["660-679", "680-699", "700-719", "720-739", "740+"];
const downPaymentOptions = ["20%", "Short-term", "Mid-term"];
const strategyOptions = ["Long-term", "Short-term", "Mid-term"];
const borrowerOptions: { label: string; value: BorrowerType }[] = [
  { label: "US Citizen", value: "us_citizen" },
  { label: "US Resident", value: "us_resident" },
  { label: "Foreign National", value: "foreign_national" },
];

const checks = ["✓ No SSN", "✓ No credit pull", "✓ No account needed"];

function mapHorizon(label: string): InvestmentHorizon {
  if (label === "Short-term") return "short_term";
  if (label === "Mid-term") return "mid_term";
  return "long_term";
}

function mapDownPayment(label: string): number | null {
  const match = label.match(/^(\d+)%$/);
  return match ? Number(match[1]) : null;
}

export function LoanInquiryForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [address, setAddress] = useState(
    "1234 Gulf Pine Drive, Sarasota, FL 34236",
  );
  const [downPaymentIdx, setDownPaymentIdx] = useState(0);
  const [ficoIdx, setFicoIdx] = useState(3);
  const [strategyIdx, setStrategyIdx] = useState(0);
  const [borrowerIdx, setBorrowerIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    property: Record<string, unknown> | null;
    realieError: string | null;
    inquiryId: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload: InquiryPayload = {
      loanStrategy: tabs[activeTab].value,
      address,
      downPaymentPct: mapDownPayment(downPaymentOptions[downPaymentIdx]),
      ficoBand: ficoOptions[ficoIdx],
      intendedHorizon: mapHorizon(strategyOptions[strategyIdx]),
      borrowerType: borrowerOptions[borrowerIdx].value,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult({
        inquiryId: data.inquiryId,
        property: data.property ?? null,
        realieError: data.realieError ?? null,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      id="loan-inquiry-form"
      onSubmit={handleSubmit}
      className="relative mt-10 overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#fcfcfc] px-4 py-3">
        <span className="size-3 rounded-full bg-[#9a9a9a]/40" />
        <span className="size-3 rounded-full bg-[#9a9a9a]/30" />
        <span className="size-3 rounded-full bg-[#9a9a9a]/20" />
      </div>
      <div className="flex flex-wrap gap-2 border-b border-black/5 bg-[#f3f3f3] px-4 py-3">
        {tabs.map((tab, i) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`rounded-md px-3 py-1.5 text-[13px] ${
              i === activeTab
                ? "bg-white font-semibold text-black shadow-sm"
                : "font-light text-black/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-6 p-6">
        <div>
          <label
            htmlFor="property-address"
            className="mb-2 block text-lg text-black"
          >
            Property address
          </label>
          <input
            id="property-address"
            name="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="1234 Gulf Pine Drive, Sarasota, FL 34236"
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-light text-black outline-none focus:border-vn-green focus:ring-1 focus:ring-vn-green"
          />
          <p className="mt-1 text-xs text-black/50">
            Street, city, and state required for property lookup via{" "}
            <a
              href="https://docs.realie.ai/introduction"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Realie
            </a>
            .
          </p>
        </div>
        <div className="text-sm text-black">
          <span className="rounded border border-black/10 bg-white px-3 py-2">
            🇺🇸 United States
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <OptionGroup
            label="Target down payment"
            options={downPaymentOptions}
            active={downPaymentIdx}
            onSelect={setDownPaymentIdx}
          />
          <OptionGroup
            label="Self-reported FICO"
            options={ficoOptions}
            active={ficoIdx}
            onSelect={setFicoIdx}
          />
          <OptionGroup
            label="Intended strategy"
            options={strategyOptions}
            active={strategyIdx}
            onSelect={setStrategyIdx}
          />
        </div>
        <OptionGroup
          label="Borrower type"
          options={borrowerOptions.map((b) => b.label)}
          active={borrowerIdx}
          onSelect={setBorrowerIdx}
        />

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="rounded-lg border border-black/10 p-4">
            <p className="text-sm font-medium text-vn-green">
              Inquiry saved · {result.inquiryId.slice(0, 8)}…
            </p>
            {result.property ? (
              <>
                <p className="mt-2 text-sm text-black">
                  Property data from Realie:
                </p>
                <PropertySummary property={result.property} />
              </>
            ) : (
              <p className="mt-2 text-sm text-black/70">
                {result.realieError ??
                  "No property record found. Your inquiry was still saved."}
              </p>
            )}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-vn-green text-base font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {loading ? "Looking up property…" : "Get property details"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-6 border-t border-black/5 px-6 py-4">
        {checks.map((item) => (
          <span key={item} className="text-base font-medium text-vn-green">
            {item}
          </span>
        ))}
      </div>
    </form>
  );
}

function OptionGroup({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-lg text-black">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(i)}
            className={`rounded-md px-3 py-1.5 text-xs ${
              i === active
                ? "bg-vn-green font-semibold text-white"
                : "bg-[#f3f3f3] font-light text-black"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
