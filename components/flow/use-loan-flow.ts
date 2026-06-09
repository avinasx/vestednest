"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateTermSheet } from "@/lib/dscr";
import { ADDRESS_KIND } from "@/lib/chat-interactions";
import type { SelectableOption } from "@/lib/chat-interactions/types";
import type { ChatMessage, CloseTrackerData, DealState } from "./types";
import { getSessionId } from "./utils";

export function useLoanFlow() {
  const [screen, setScreen] = useState(0);
  const [heroInput, setHeroInput] = useState("");
  const [heroState, setHeroState] = useState("GA");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(-1);
  const [loadDone, setLoadDone] = useState(false);
  const [deal, setDeal] = useState<DealState | null>(null);
  const [downPaymentPct, setDownPaymentPct] = useState(25);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [interestOnly, setInterestOnly] = useState(false);
  const [loanTerm, setLoanTerm] = useState<DealState["loanTerm"]>("30yr");
  const [prepay, setPrepay] = useState<DealState["prepay"]>("3yr");
  const [purpose, setPurpose] = useState<DealState["purpose"]>("purchase");
  const [monthlyRent, setMonthlyRent] = useState(0);
  const [fico, setFico] = useState(752);
  const [borrowerType, setBorrowerType] = useState<DealState["borrowerType"]>("llc");
  const [advOpen, setAdvOpen] = useState(false);
  const [classicMode, setClassicMode] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loanId] = useState(() => `VN-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [closeTracker, setCloseTracker] = useState<CloseTrackerData | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const chatInit = useRef(false);
  const loadInit = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  const liveTermSheet = useMemo(() => {
    const price = purchasePrice || deal?.intel.arv || deal?.intel.marketValue || 0;
    if (!price || !monthlyRent) return null;
    return calculateTermSheet({
      purchasePrice: price,
      downPaymentPct,
      monthlyRent,
      annualTax: deal?.intel.annualTax ?? 3420,
      purpose,
      term: loanTerm,
      prepay,
      interestOnly,
      fico,
      borrowerType,
      state: deal?.intel.state,
    });
  }, [
    deal,
    purchasePrice,
    downPaymentPct,
    monthlyRent,
    purpose,
    loanTerm,
    prepay,
    interestOnly,
    fico,
    borrowerType,
  ]);

  const dscrPct = liveTermSheet
    ? Math.min(100, Math.round((liveTermSheet.dscr / 1.5) * 100))
    : 0;

  const saveApplication = useCallback(
    async (overrides?: {
      status?: string;
      propertyIntel?: DealState["intel"];
      termSheet?: ReturnType<typeof calculateTermSheet>;
    }) => {
      const address = deal?.formattedAddress ?? heroInput;
      if (!address.trim()) return null;

      const body = {
        sessionId: getSessionId(),
        applicationId: applicationId ?? undefined,
        address,
        propertyIntel: overrides?.propertyIntel ?? deal?.intel,
        termSheet: overrides?.termSheet ?? liveTermSheet ?? deal?.termSheet,
        fico,
        borrowerType,
        purpose,
        status: overrides?.status,
      };

      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok && data.application?.id) {
          setApplicationId(data.application.id);
          return data.application.id as string;
        }
      } catch {
        // Persistence is best-effort during flow
      }
      return applicationId;
    },
    [applicationId, borrowerType, deal, fico, heroInput, liveTermSheet, purpose],
  );

  const goTo = useCallback((n: number) => {
    if (n < 0 || n > 7) return;
    setScreen(n);
    window.scrollTo(0, 0);
  }, []);

  const goNext = useCallback(() => goTo(screen + 1), [goTo, screen]);

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }, []);

  const applyProperty = useCallback(
    (data: {
      formattedAddress: string;
      intel: DealState["intel"];
      termSheet: DealState["termSheet"];
    }) => {
      const price = data.intel.arv || data.intel.marketValue || 300000;
      setDeal({
        formattedAddress: data.formattedAddress,
        intel: data.intel,
        termSheet: data.termSheet,
        monthlyRent: data.intel.estimatedRent,
        fico: 752,
        borrowerType: "llc",
        downPaymentPct: 25,
        interestOnly: false,
        loanTerm: "30yr",
        prepay: "3yr",
        purpose: "purchase",
      });
      setMonthlyRent(data.intel.estimatedRent);
      setPurchasePrice(price);
      if (data.intel.state) setHeroState(data.intel.state);

      void (async () => {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            applicationId: applicationId ?? undefined,
            address: data.formattedAddress,
            propertyIntel: data.intel,
            termSheet: data.termSheet,
            status: "property_loaded",
          }),
        });
        const json = await res.json();
        if (json.application?.id) setApplicationId(json.application.id);
      })();
    },
    [applicationId],
  );

  const sendChat = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || chatLoading) return;

      setMessages((m) => [...m, { role: "user", content: msg }]);
      setChatLoading(true);
      scrollChat();

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            message: msg,
            history,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Chat failed");

        const needsSelection =
          data.interaction?.status === "needs_selection" ||
          Boolean(data.addressSuggestions?.length);

        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.message,
            actions: data.actions,
            interaction: data.interaction ?? undefined,
            addressSuggestions: data.addressSuggestions ?? undefined,
          },
        ]);

        if (data.property && !needsSelection) {
          applyProperty(data.property);
        }
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              err instanceof Error ? err.message : "Something went wrong. Try again.",
            actions: ["Get a DSCR quote"],
          },
        ]);
      } finally {
        setChatLoading(false);
        scrollChat();
      }
    },
    [applyProperty, chatLoading, messages, scrollChat],
  );

  const onSelectInteractionOption = useCallback(
    async (kind: string, option: SelectableOption) => {
      if (chatLoading) return;

      setMessages((m) => [...m, { role: "user", content: option.label }]);
      setChatLoading(true);
      scrollChat();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            interactionKind: kind,
            optionId: option.id,
            optionMeta: option.meta,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? data.message ?? "Request failed");

        const needsSelection = data.interaction?.status === "needs_selection";

        if (kind === ADDRESS_KIND && data.property && !needsSelection) {
          applyProperty(data.property);
          const rent = data.property.intel?.estimatedRent ?? 0;
          const dscr = data.property.termSheet?.dscr ?? "—";
          const rate = data.property.termSheet?.rate?.toFixed(2) ?? "—";

          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: `Got it — ${data.property.formattedAddress}.\n\n✓ Estimated rent: $${Number(rent).toLocaleString()}/mo\n✓ DSCR at 25% down: ${dscr}x\n✓ Rate: ${rate}% · 30yr Fixed\n\nReady to see the full interactive term sheet?`,
              actions: [
                "Yes — open term sheet",
                "Adjust loan structure",
                "Download PDF now",
              ],
              interaction: data.interaction,
            },
          ]);
          return;
        }

        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.message,
            actions: data.actions,
            interaction: data.interaction,
            addressSuggestions: data.addressSuggestions,
          },
        ]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              err instanceof Error
                ? err.message
                : "Something went wrong. Try again.",
            actions: ["Get a DSCR quote"],
          },
        ]);
      } finally {
        setChatLoading(false);
        scrollChat();
      }
    },
    [applyProperty, chatLoading, scrollChat],
  );

  const handleAction = useCallback(
    (action: string) => {
      const lower = action.toLowerCase();
      if (
        lower.includes("term sheet") ||
        lower.includes("yes") ||
        lower.includes("open")
      ) {
        sendChat(action);
        if (deal) {
          setTimeout(() => goTo(2), 1200);
        }
        return;
      }
      sendChat(action);
    },
    [deal, goTo, sendChat],
  );

  const startFromHero = useCallback(
    (value?: string) => {
      const v = (value ?? heroInput).trim();
      if (v) setHeroInput(v);
      chatInit.current = false;
      goTo(1);
    },
    [goTo, heroInput],
  );

  const downloadPdf = useCallback(async () => {
    let id = applicationId;
    if (!id) {
      id = await saveApplication({ status: "term_sheet", termSheet: liveTermSheet ?? undefined });
    } else {
      await saveApplication({ status: "term_sheet", termSheet: liveTermSheet ?? undefined });
    }
    if (!id) return;
    window.open(`/api/term-sheet/pdf?id=${id}`, "_blank");
  }, [applicationId, liveTermSheet, saveApplication]);

  const emailTermSheet = useCallback(async () => {
    if (!emailInput.includes("@")) {
      setEmailStatus("Enter a valid email address");
      return;
    }
    let id = applicationId;
    if (!id) {
      id = await saveApplication({ status: "term_sheet", termSheet: liveTermSheet ?? undefined });
    } else {
      await saveApplication({ status: "term_sheet" });
    }
    if (!id) {
      setEmailStatus("Save the application first");
      return;
    }

    setEmailStatus("Sending…");
    try {
      const res = await fetch("/api/term-sheet/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, email: emailInput }),
      });
      const data = await res.json();
      setEmailStatus(data.message ?? (data.ok ? "Sent!" : "Failed to send"));
    } catch {
      setEmailStatus("Failed to send email");
    }
  }, [applicationId, emailInput, liveTermSheet, saveApplication]);

  const submitPrequal = useCallback(async () => {
    setSubmitting(true);
    try {
      let id = applicationId;
      if (!id) {
        id = await saveApplication({
          status: "term_sheet",
          termSheet: liveTermSheet ?? undefined,
        });
      }
      if (!id) throw new Error("Could not save application");

      const res = await fetch(`/api/applications/${id}/prequal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");

      setApplicationId(id);
      goTo(7);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [applicationId, goTo, liveTermSheet, saveApplication]);

  const initiateCall = useCallback(async () => {
    if (!closeTracker?.loanOfficer?.phone) return;
    try {
      await fetch("/api/calls/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: closeTracker.loanOfficer.phone,
          applicationId: applicationId ?? undefined,
        }),
      });
    } catch {
      // Call stub — user may need to dial manually
    }
  }, [applicationId, closeTracker]);

  const resetFlow = useCallback(() => {
    chatInit.current = false;
    loadInit.current = false;
    setDeal(null);
    setMessages([]);
    setHeroInput("");
    setLoadStep(-1);
    setLoadDone(false);
    setApplicationId(null);
    setCloseTracker(null);
    setEmailStatus(null);
    goTo(0);
  }, [goTo]);

  useEffect(() => {
    if (screen !== 1 || chatInit.current) return;
    chatInit.current = true;
    setMessages([
      {
        role: "assistant",
        content:
          "Hi — I'm Nest AI, your DSCR advisor. Drop a property address or tell me what you're working on. I'll pull rent comps, run the math, and quote your rate live. No W2. No hard pull.",
        actions: [],
      },
    ]);
    if (heroInput.trim()) {
      setTimeout(() => sendChat(heroInput.trim()), 400);
    }
  }, [screen, heroInput, sendChat]);

  useEffect(() => {
    if (screen !== 2 || loadInit.current || !deal) return;
    loadInit.current = true;
    setLoadStep(-1);
    setLoadDone(false);

    for (let i = 0; i < 5; i++) {
      setTimeout(() => setLoadStep(i), i * 650);
    }
    setTimeout(() => setLoadDone(true), 5 * 650 + 400);
  }, [screen, deal]);

  useEffect(() => {
    if (screen === 4 && liveTermSheet && deal) {
      void saveApplication({ status: "term_sheet", termSheet: liveTermSheet });
    }
  }, [screen, liveTermSheet, deal, saveApplication]);

  useEffect(() => {
    if (screen !== 7 || !applicationId) return;
    fetch(`/api/close-tracker?id=${applicationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.application) setCloseTracker(data);
      })
      .catch(() => {});
  }, [screen, applicationId]);

  const addressLabel = deal?.formattedAddress ?? heroInput;

  return {
    screen,
    goTo,
    goNext,
    heroInput,
    setHeroInput,
    heroState,
    setHeroState,
    chatInput,
    setChatInput,
    messages,
    chatLoading,
    loadStep,
    loadDone,
    deal,
    downPaymentPct,
    setDownPaymentPct,
    purchasePrice,
    setPurchasePrice,
    interestOnly,
    setInterestOnly,
    loanTerm,
    setLoanTerm,
    prepay,
    setPrepay,
    purpose,
    setPurpose,
    monthlyRent,
    setMonthlyRent,
    fico,
    setFico,
    borrowerType,
    setBorrowerType,
    advOpen,
    setAdvOpen,
    classicMode,
    setClassicMode,
    loanId,
    applicationId,
    logRef,
    liveTermSheet,
    dscrPct,
    addressLabel,
    sendChat,
    onSelectInteractionOption,
    handleAction,
    startFromHero,
    resetFlow,
    downloadPdf,
    emailInput,
    setEmailInput,
    emailTermSheet,
    emailStatus,
    submitPrequal,
    submitting,
    closeTracker,
    initiateCall,
  };
}
