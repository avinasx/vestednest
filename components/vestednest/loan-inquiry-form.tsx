"use client";

import type { InquiryPayload } from "@/app/api/inquiries/route";
import type {
  BorrowerType,
  InvestmentHorizon,
  LoanStrategy,
} from "@/types/database";
import type { ChatInteraction } from "@/lib/chat-interactions/types";
import { useState } from "react";
import type { AddressSuggestion } from "@/lib/realie";
import { InteractionPicker } from "@/components/flow/interaction-picker";
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
  const [pendingInteraction, setPendingInteraction] = useState<
    Omit<ChatInteraction, "source"> | null
  >(null);
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
    setPendingInteraction(null);

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
      if (data.status === "needs_selection" && data.interaction) {
        setPendingInteraction(data.interaction);
        setError(null);
        return;
      }

      if (!res.ok) {
        setError(data.message ?? data.error ?? "Something went wrong");
        return;
      }

      if (data.status === "blocked") {
        setError(data.message ?? "This property is not eligible for funding.");
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
    <form id="loan-inquiry-form" onSubmit={handleSubmit} className="inquiry-form">
      <div className="inquiry-form-chrome">
        <span className="inquiry-dot inquiry-dot--red" />
        <span className="inquiry-dot inquiry-dot--yellow" />
        <span className="inquiry-dot inquiry-dot--green" />
      </div>
      <div className="inquiry-form-tabs">
        {tabs.map((tab, i) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`inquiry-tab${i === activeTab ? " inquiry-tab--active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
        <PendingBadge
          className="inquiry-pending-badge"
          label="loan strategy selection does not change pricing yet, implementation pending"
        />
      </div>
      <div className="inquiry-form-body">
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

        {pendingInteraction ? (
          <div className="inquiry-interaction">
            <p className="mb-2 text-sm text-black/80">{pendingInteraction.message}</p>
            <InteractionPicker
              interaction={pendingInteraction}
              disabled={loading}
              onSelect={async (kind, option) => {
                setLoading(true);
                setError(null);
                try {
                  const res = await fetch("/api/inquiries", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      loanStrategy: tabs[activeTab].value,
                      address: option.label,
                      downPaymentPct: mapDownPayment(downPaymentOptions[downPaymentIdx]),
                      ficoBand: ficoOptions[ficoIdx],
                      intendedHorizon: mapHorizon(strategyOptions[strategyIdx]),
                      borrowerType: borrowerOptions[borrowerIdx].value,
                      interactionKind: kind,
                      optionId: option.id,
                      optionMeta: option.meta,
                    }),
                  });
                  const data = await res.json();
                  if (data.status === "needs_selection" && data.interaction) {
                    setPendingInteraction(data.interaction);
                    return;
                  }
                  if (!res.ok || data.status === "blocked") {
                    setError(data.message ?? data.error ?? "Something went wrong");
                    setPendingInteraction(null);
                    return;
                  }
                  setPendingInteraction(null);
                  setResult({
                    property: data.property ?? null,
                    realieError: data.realieError ?? null,
                  });
                } catch {
                  setError("Network error. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        ) : null}

        {error ? <p className="secondary-error">{error}</p> : null}

        {result ? (
          <div className="inquiry-result">
            {result.property ? (
              <>
                <p className="inquiry-result-label">Property details</p>
                <PropertySummary property={result.property} />
              </>
            ) : (
              <p className="inquiry-result-empty">
                {result.realieError ??
                  "No property record found for this address. Try another address or refine the street and state."}
              </p>
            )}
          </div>
        ) : null}

        {result ? (
          <button type="button" onClick={resetForm} className="secondary-btn-primary">
            Search another property
          </button>
        ) : (
          <button type="submit" disabled={loading} className="secondary-btn-primary">
            {loading ? "Saving inquiry…" : "Get property details"}
          </button>
        )}
      </div>
      <div className="inquiry-form-foot">
        {checks.map((item) => (
          <span key={item} className="inquiry-check">
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
    <div className="inquiry-option-group">
      <p className="inquiry-option-label">
        {label}
        {pending ? <PendingBadge label={PRICING_PENDING_LABEL} /> : null}
      </p>
      <div className="inquiry-pills">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(i)}
            className={`inquiry-pill${i === active ? " inquiry-pill--active" : ""}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
