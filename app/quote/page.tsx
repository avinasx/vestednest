"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddressAutocomplete } from "@/components/vestednest/address-autocomplete";
import type { AddressSuggestion } from "@/lib/realie";
import { QuoteFlowShell } from "@/components/quote/quote-flow-shell";
import { fetchPropertyLookup } from "@/lib/deal/api";
import { useDeal } from "@/lib/deal/context";
import { trackEvent } from "@/lib/analytics/events";

const PENDING_KEY = "vn-pending-address";

export default function QuoteAddressPage() {
  const router = useRouter();
  const { setDeal } = useDeal();
  const [address, setAddress] = useState("");
  const [stateCode, setStateCode] = useState("NY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_KEY);
      if (pending) {
        setAddress(pending);
        sessionStorage.removeItem(PENDING_KEY);
      }
    } catch {
      /* ignore */
    }
    trackEvent("address_entered");
  }, []);

  async function onAddressSelect(suggestion: AddressSuggestion) {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPropertyLookup({
        address: suggestion.label,
        state: suggestion.state ?? stateCode,
      });
      setDeal({
        formattedAddress: result.formattedAddress,
        intel: result.intel,
        value: result.valueRange.mid,
        monthlyRent: result.rentRange.mid,
        insuranceAnnual: 2400,
        fundingLane: result.fundingLane,
        lenderId: result.funding.lenderId ?? undefined,
        downPaymentPct: 25,
        fico: 752,
        borrowerType: "llc",
        purpose: "purchase",
      });
      await router.push("/quote/property");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <QuoteFlowShell step={1}>
      <h1 className="quote-h1">What property are you financing?</h1>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>
        Enter the address — we&apos;ll pull value, rent, and taxes from market data.
      </p>
      <div className="quote-card">
        <AddressAutocomplete
          value={address}
          stateCode={stateCode}
          onValueChange={setAddress}
          onStateChange={setStateCode}
          onSelect={onAddressSelect}
          placeholder="Start typing an address…"
        />
        {loading && <p style={{ marginTop: 12 }}>Pulling property data…</p>}
        {error && <p style={{ marginTop: 12, color: "var(--red, #b3382c)" }}>{error}</p>}
      </div>
    </QuoteFlowShell>
  );
}
