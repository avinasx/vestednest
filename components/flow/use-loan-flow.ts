"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateTermSheet } from "@/lib/dscr";
import type { ChatMessage, DealState } from "./types";
import { getSessionId } from "./utils";

export function useLoanFlow() {
  const [screen, setScreen] = useState(0);
  const [heroInput, setHeroInput] = useState("");
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
  const [loanId] = useState(() => `VN-2026-${Math.floor(1000 + Math.random() * 9000)}`);

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
    },
    [],
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

        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.message, actions: data.actions },
        ]);

        if (data.property) {
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

  const handleAction = useCallback(
    (action: string) => {
      const lower = action.toLowerCase();
      if (
        lower.includes("term sheet") ||
        lower.includes("yes") ||
        lower.includes("open")
      ) {
        sendChat(action);
        setTimeout(() => goTo(2), 1200);
        return;
      }
      sendChat(action);
    },
    [goTo, sendChat],
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

  const resetFlow = useCallback(() => {
    chatInit.current = false;
    loadInit.current = false;
    setDeal(null);
    setMessages([]);
    setHeroInput("");
    setLoadStep(-1);
    setLoadDone(false);
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
    if (screen !== 2 || loadInit.current) return;
    loadInit.current = true;
    setLoadStep(-1);
    setLoadDone(false);

    const addr = deal?.formattedAddress ?? heroInput;
    if (addr && !deal) {
      fetch(`/api/property?address=${encodeURIComponent(addr)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.intel) applyProperty(data);
        })
        .catch(() => {});
    }

    for (let i = 0; i < 5; i++) {
      setTimeout(() => setLoadStep(i), i * 650);
    }
    setTimeout(() => setLoadDone(true), 5 * 650 + 400);
  }, [screen, deal, heroInput, applyProperty]);

  const addressLabel = deal?.formattedAddress ?? heroInput;

  return {
    screen,
    goTo,
    goNext,
    heroInput,
    setHeroInput,
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
    logRef,
    liveTermSheet,
    dscrPct,
    addressLabel,
    sendChat,
    handleAction,
    startFromHero,
    resetFlow,
  };
}
