"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, readUIMessageStream, type UIMessage } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { calculateTermSheet } from "@/lib/dscr";
import { ADDRESS_KIND } from "@/lib/chat-interactions";
import { ADDRESS_NONE_OPTION_ID, optionForSelectionAction } from "@/lib/chat-interactions/action-chips";
import type { SelectableOption } from "@/lib/chat-interactions/types";
import type { ChatMessage, CloseTrackerData, DealState } from "./types";
import { parseUIMessageChunkStream, uiMessageToChatMessage } from "./chat-adapter";
import { createLoanReference, getSessionId } from "./utils";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm Nest AI, your DSCR advisor. Drop a property address or tell me what you're working on. I'll pull rent comps, run the math, and quote your rate live. No W2. No hard pull.",
  actions: [],
};

export function useLoanFlow() {
  const [screen, setScreen] = useState(0);
  const [heroInput, setHeroInput] = useState("");
  const [heroState, setHeroState] = useState("GA");
  const [chatInput, setChatInput] = useState("");
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
  const [loanId, setLoanId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [closeTracker, setCloseTracker] = useState<CloseTrackerData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);

  const chatInit = useRef(false);
  const loadInit = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

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

  const {
    messages: uiMessages,
    sendMessage,
    status,
    setMessages: setUiMessages,
  } = useChat({
    id: getSessionId(),
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => {
        const last = messages[messages.length - 1];
        const text = last?.parts
          ?.filter((p) => p.type === "text")
          .map((p) => (p as { text: string }).text)
          .join("")
          .trim();
        return {
          body: {
            sessionId: getSessionId(),
            message: text,
          },
        };
      },
    }),
    onData: (part) => {
      if (part.type === "data-progress") {
        const msg = (part.data as { message?: string })?.message;
        if (msg) setProgressText(msg);
      }
      if (part.type === "data-property" && part.data) {
        const data = part.data as {
          formattedAddress: string;
          intel: DealState["intel"];
          termSheet: DealState["termSheet"];
        };
        if (data.formattedAddress && data.intel && data.termSheet) {
          applyProperty(data);
        }
      }
    },
    onFinish: () => {
      setProgressText(null);
    },
    onError: () => {
      setProgressText(null);
    },
  });

  const chatLoading = status === "submitted" || status === "streaming";

  const messages = useMemo(() => {
    const adapted = uiMessages.map(uiMessageToChatMessage);
    if (screen === 1 && chatInit.current) {
      return [GREETING, ...adapted];
    }
    return adapted;
  }, [uiMessages, screen]);

  useEffect(() => {
    setLoanId(createLoanReference());
  }, []);

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

  const sendChat = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || chatLoading) return;

      scrollChat();
      try {
        await sendMessage({ text: msg });
      } catch {
        setUiMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "Something didn't go through on my end. Want to try that again, or ask me something else about DSCR?",
              },
            ],
          },
        ]);
      } finally {
        scrollChat();
      }
    },
    [chatLoading, scrollChat, sendMessage, setUiMessages],
  );

  const onSelectInteractionOption = useCallback(
    async (kind: string, option: SelectableOption) => {
      if (chatLoading) return;

      setUiMessages((prev) => [
        ...prev,
        {
          id: `pick-${Date.now()}`,
          role: "user",
          parts: [{ type: "text", text: option.label }],
        },
      ]);
      scrollChat();
      setProgressText(null);

      try {
        const res = await fetch("/api/chat/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: getSessionId(),
            kind,
            optionId: option.id,
            optionMeta: option.meta,
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Resume failed");
        }

        const assistantMessage: UIMessage = {
          id: `resume-${Date.now()}`,
          role: "assistant",
          parts: [],
        };

        const stream = readUIMessageStream({
          message: assistantMessage,
          stream: parseUIMessageChunkStream(res.body),
          onError: (error) => {
            console.error("resume stream error", error);
          },
        });

        let finalMessage = assistantMessage;
        for await (const msg of stream) {
          finalMessage = msg;
          for (const part of msg.parts) {
            if (part.type === "data-property" && part.data) {
              const data = part.data as {
                formattedAddress: string;
                intel: DealState["intel"];
                termSheet: DealState["termSheet"];
              };
              if (data.formattedAddress && data.intel && data.termSheet) {
                applyProperty(data);
              }
            }
          }
        }

        if (
          kind === ADDRESS_KIND &&
          option.id !== ADDRESS_NONE_OPTION_ID &&
          finalMessage.parts.length === 0
        ) {
          const propertyMsg = messages.find((m) => m.role === "assistant" && m.content.includes("Estimated rent"));
          if (!propertyMsg) {
            finalMessage = {
              ...finalMessage,
              parts: [
                {
                  type: "text",
                  text: `Got it — working on ${option.label}.`,
                },
              ],
            };
          }
        }

        setUiMessages((prev) => [...prev, finalMessage]);
      } catch {
        setUiMessages((prev) => [
          ...prev,
          {
            id: `resume-err-${Date.now()}`,
            role: "assistant",
            parts: [
              {
                type: "text",
                text: "I couldn't complete that step just now. Mind trying again, or typing the address directly?",
              },
            ],
          },
        ]);
      } finally {
        scrollChat();
      }
    },
    [applyProperty, chatLoading, messages, scrollChat, setUiMessages],
  );

  const handleAction = useCallback(
    (action: string) => {
      const pendingSelection = [...messages]
        .reverse()
        .find(
          (m) =>
            m.role === "assistant" &&
            m.interaction?.status === "needs_selection" &&
            m.interaction.options?.length,
        );

      if (pendingSelection?.interaction) {
        const option = optionForSelectionAction(pendingSelection.interaction, action);
        if (option) {
          void onSelectInteractionOption(pendingSelection.interaction.kind, option);
          return;
        }
      }

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
    [deal, goTo, messages, onSelectInteractionOption, sendChat],
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
    setUiMessages([]);
    setHeroInput("");
    setLoadStep(-1);
    setLoadDone(false);
    setApplicationId(null);
    setCloseTracker(null);
    setEmailStatus(null);
    setProgressText(null);
    setLoanId(createLoanReference());
    goTo(0);
  }, [goTo, setUiMessages]);

  useEffect(() => {
    if (screen !== 1 || chatInit.current) return;
    chatInit.current = true;
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
    progressText,
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
