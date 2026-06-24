"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentUpload } from "@/components/quote/document-upload";
import { QuoteFlowShell } from "@/components/quote/quote-flow-shell";
import { useDeal } from "@/lib/deal/context";
import { trackEvent } from "@/lib/analytics/events";

const DOCS = [
  { type: "id", label: "Government-issued ID" },
  { type: "entity", label: "Entity documents (LLC/Corp)" },
  { type: "bank", label: "Bank statements (2 months)" },
  { type: "lease", label: "Lease agreement or rent roll" },
];

export default function PrequalifyPage() {
  const router = useRouter();
  const { deal, setDeal, saveDraft } = useDeal();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [step, setStep] = useState<"email" | "code" | "consent" | "docs">("email");
  const [consent, setConsent] = useState(false);
  const [phone, setPhone] = useState("");
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [ficoResult, setFicoResult] = useState<number | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const blocked =
    deal.fundingLane === "ecc-referral" || deal.fundingLane === "excluded";

  useEffect(() => {
    if (!deal.quote) void router.replace("/quote/term-sheet");
    else trackEvent("prequal_started", { loan_amount: deal.quote?.loan });
  }, [deal.quote, router]);

  useEffect(() => {
    if (blocked) return;
    void fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.user?.email) {
          setEmail(j.user.email);
          setAuthenticated(true);
          setStep("consent");
        }
      })
      .catch(() => null);
  }, [blocked]);

  if (blocked) {
    return (
      <QuoteFlowShell step={7}>
        <h1 className="quote-h1">Pre-qualification not available here</h1>
        <p style={{ color: "var(--slate)", marginBottom: 16 }}>
          This property is in a state where we connect you with a licensed partner. Your loan advisor
          will follow up with next steps.
        </p>
        <Link href="/quote/term-sheet" className="quote-btn secondary">
          ← Back to term sheet
        </Link>
      </QuoteFlowShell>
    );
  }

  async function sendCode() {
    setMsg(null);
    const res = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (res.ok) setStep("code");
    else setMsg(json.error ?? "Could not send code — try again.");
  }

  async function verifyCode() {
    setMsg(null);
    const applicationId = deal.applicationId ?? (await saveDraft());
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, applicationId }),
    });
    const json = await res.json();
    if (res.ok) {
      setAuthenticated(true);
      setStep("consent");
    } else setMsg(json.error ?? "Invalid code.");
  }

  async function runSoftPull() {
    if (!consent || !firstName.trim() || !lastName.trim()) {
      setMsg("Enter your legal name and consent to continue.");
      return;
    }
    setMsg("Running soft pull…");
    const applicationId = deal.applicationId ?? (await saveDraft());
    if (!applicationId) {
      setMsg("Could not save application.");
      return;
    }

    const street = deal.intel?.addressLine ?? deal.formattedAddress?.split(",")[0] ?? "";
    const res = await fetch("/api/credit/soft-pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: street,
        city: deal.intel?.city,
        state: deal.intel?.state,
        zip: deal.intel?.zip,
        consent: true,
        deal,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error ?? "Soft pull failed.");
      return;
    }
    if (json.fico) {
      setFicoResult(json.fico);
      setDeal({
        fico: json.fico,
        ficoUnknown: false,
        ...(json.quote ? { quote: json.quote } : {}),
      });
      trackEvent("soft_pull_completed", { loan_amount: deal.quote?.loan, fico: json.fico });
    }
    if (!deal.applicationId) await saveDraft();
    setStep("docs");
    setMsg(json.message);
  }

  async function submitApp() {
    const applicationId = deal.applicationId ?? (await saveDraft());
    if (!applicationId) {
      setMsg("Could not save application — try again.");
      return;
    }
    const allUploaded = DOCS.every((d) => uploads[d.type]);
    if (!allUploaded) {
      setMsg("Upload all required documents before submitting.");
      return;
    }
    if (!phone.trim()) {
      setMsg("Enter a phone number.");
      return;
    }

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        email,
        phone,
        consent: true,
        deal,
      }),
    });
    const json = await res.json();
    if (res.ok) {
      trackEvent("application_submitted", { loan_amount: deal.quote?.loan });
      await router.push("/portal");
    } else setMsg(json.error ?? "Submit failed.");
  }

  return (
    <QuoteFlowShell step={7}>
      <h1 className="quote-h1">Get pre-qualified</h1>
      <p style={{ color: "var(--slate)", marginBottom: 16 }}>
        Soft pull only — won&apos;t affect your credit. You already saw your numbers first.
      </p>

      {step === "email" && !authenticated && (
        <div className="quote-card">
          <div className="quote-label">Email (passwordless login)</div>
          <input className="quote-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="button" className="quote-btn" onClick={() => void sendCode()}>
            Send 6-digit code
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="quote-card">
          <div className="quote-label">Enter code</div>
          <input className="quote-input" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="button" className="quote-btn" onClick={() => void verifyCode()}>
            Verify
          </button>
        </div>
      )}

      {step === "consent" && (
        <div className="quote-card">
          <p style={{ fontSize: 14, marginBottom: 12 }}>{deal.formattedAddress}</p>
          <div className="quote-label">Legal name (as on credit report)</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input className="quote-input" placeholder="First" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="quote-input" placeholder="Last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <label style={{ display: "flex", gap: 8, fontSize: 14, marginBottom: 12 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I authorize a soft credit check — it won&apos;t affect my credit score.
          </label>
          <button type="button" className="quote-btn" onClick={() => void runSoftPull()} disabled={!consent}>
            Run soft pull
          </button>
        </div>
      )}

      {step === "docs" && deal.applicationId && (
        <>
          {ficoResult && (
            <div className="quote-card">
              <div className="quote-label">Verified FICO</div>
              <p style={{ fontSize: 24, fontWeight: 700 }}>{ficoResult}</p>
            </div>
          )}
          <div className="quote-card">
            <div className="quote-label">Documents</div>
            {DOCS.map((d) => (
              <DocumentUpload
                key={d.type}
                applicationId={deal.applicationId!}
                docType={d.type}
                label={d.label}
                onUploaded={(type) => setUploads((u) => ({ ...u, [type]: true }))}
              />
            ))}
          </div>
          <div className="quote-card">
            <div className="quote-label">Phone</div>
            <input className="quote-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button type="button" className="quote-btn" onClick={() => void submitApp()}>
            Submit application →
          </button>
        </>
      )}

      {step === "docs" && !deal.applicationId && (
        <p style={{ color: "var(--slate)" }}>Saving application…</p>
      )}

      {msg && <p style={{ marginTop: 12, fontSize: 14 }}>{msg}</p>}
      <Link href="/quote/term-sheet" className="quote-btn secondary">
        ← Back
      </Link>
    </QuoteFlowShell>
  );
}
