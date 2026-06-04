"use client";

import type { InquiryPayload } from "@/app/api/inquiries/route";
import type {
  BorrowerType,
  InvestmentHorizon,
  LoanStrategy,
} from "@/types/database";
import { useState } from "react";
import type { AddressSuggestion } from "@/lib/realie";
import { AddressAutocomplete } from "./address-autocomplete";
import { PendingBadge } from "./pending-badge";
import { PropertySummary } from "./property-summary";

const tabs: { label: string; value: LoanStrategy }[] = [
  { label: "Purchase New Deal", value: "purchase" },
  { label: "Refi Rate & term", value: "refi_rate_term" },
  { label: "Cash-out Pull equity", value: "cash_out" },
  { label: "Bridge → DSCR Balloon exit", value: "bridge_to_dscr" },
];

const ficoOptions = ["660-679", "680-699", "700-719", "720-739", "740+"];
const downPaymentOptions = ["15%", "20%", "25%", "30%"];
const strategyOptions = ["Long-term", "Short-term", "Mid-term"];

const PRICING_PENDING_LABEL =
  "saved to your inquiry, but pricing logic is implementation pending";
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
  const [address, setAddress] = useState("");
  const [stateCode, setStateCode] = useState("FL");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AddressSuggestion | null>(null);
  const [downPaymentIdx, setDownPaymentIdx] = useState(1);
  const [ficoIdx, setFicoIdx] = useState(3);
  const [strategyIdx, setStrategyIdx] = useState(0);
  const [borrowerIdx, setBorrowerIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    property: Record<string, unknown> | null;
    realieError: string | null;
  } | null>(null);

  function resetForm() {
    setAddress("");
    setSelectedSuggestion(null);
    setResult(null);
    setError(null);
    const field = document.getElementById("property-address");
    if (field instanceof HTMLInputElement) field.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const submitAddress =
      selectedSuggestion?.label ||
      address.trim() ||
      "";

    if (!submitAddress) {
      setError("Enter a property address.");
      setLoading(false);
      return;
    }

    const payload: InquiryPayload = {
      loanStrategy: tabs[activeTab].value,
      address: submitAddress,
      ...(selectedSuggestion
        ? {
            selectedProperty: selectedSuggestion.property,
            structuredAddress: {
              streetAddress: selectedSuggestion.streetAddress,
              city: selectedSuggestion.city,
              county: selectedSuggestion.county,
              state: selectedSuggestion.state,
              zip: selectedSuggestion.zip,
            },
          }
        : {}),
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
      <div className="flex flex-wrap items-center gap-2 border-b border-black/5 bg-[#f3f3f3] px-4 py-3">
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
        <PendingBadge
          className="ml-auto"
          label="loan strategy selection does not change pricing yet, implementation pending"
        />
      </div>
      <div className="space-y-6 p-6">
        <AddressAutocomplete
          value={address}
          stateCode={stateCode}
          onValueChange={(v) => {
            setAddress(v);
            setSelectedSuggestion(null);
          }}
          onStateChange={setStateCode}
          onSelect={setSelectedSuggestion}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <OptionGroup
            label="Target down payment"
            options={downPaymentOptions}
            active={downPaymentIdx}
            onSelect={setDownPaymentIdx}
            pending
          />
          <OptionGroup
            label="Self-reported FICO"
            options={ficoOptions}
            active={ficoIdx}
            onSelect={setFicoIdx}
            pending
          />
          <OptionGroup
            label="Intended strategy"
            options={strategyOptions}
            active={strategyIdx}
            onSelect={setStrategyIdx}
            pending
          />
        </div>
        <OptionGroup
          label="Borrower type"
          options={borrowerOptions.map((b) => b.label)}
          active={borrowerIdx}
          onSelect={setBorrowerIdx}
          pending
        />

        {error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="rounded-lg border border-black/10 p-4">
            {result.property ? (
              <>
                <p className="text-sm font-medium text-vn-green">
                  Property details
                </p>
                <PropertySummary property={result.property} />
              </>
            ) : (
              <p className="mt-2 text-sm text-black/70">
                {result.realieError ??
                  "No property record found for this address. Try another address or refine the street and state."}
              </p>
            )}
          </div>
        ) : null}

        {result ? (
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-vn-green text-base font-semibold text-white sm:w-auto sm:px-8"
          >
            Search another property
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-vn-green text-base font-semibold text-white disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {loading ? "Saving inquiry…" : "Get property details"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-6 border-t border-black/5 px-6 py-4">
        {checks.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 text-base font-medium text-vn-green"
          >
            {item}
            {item.includes("No account needed") ? (
              <PendingBadge label="sign-in is currently required, implementation pending" />
            ) : null}
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
  pending = false,
}: {
  label: string;
  options: string[];
  active: number;
  onSelect: (index: number) => void;
  pending?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-lg text-black">
        {label}
        {pending ? <PendingBadge label={PRICING_PENDING_LABEL} /> : null}
      </p>
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
