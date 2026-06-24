"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DealState } from "./types";
import { getSessionId } from "@/components/flow/utils";

const STORAGE_KEY = "vn-deal-draft";

type DealContextValue = {
  deal: DealState;
  setDeal: (patch: Partial<DealState> | ((prev: DealState) => DealState)) => void;
  saveDraft: () => Promise<string | undefined>;
  loading: boolean;
};

const DealContext = createContext<DealContextValue | null>(null);

function loadDraft(): DealState {
  if (typeof window === "undefined") return { sessionId: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DealState;
  } catch {
    /* ignore */
  }
  return { sessionId: getSessionId() };
}

export function DealProvider({ children }: { children: ReactNode }) {
  const [deal, setDealState] = useState<DealState>(() => loadDraft());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!deal.sessionId) {
      setDealState((d) => ({ ...d, sessionId: getSessionId() }));
    }
  }, [deal.sessionId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deal));
    } catch {
      /* ignore */
    }
  }, [deal]);

  const setDeal = useCallback(
    (patch: Partial<DealState> | ((prev: DealState) => DealState)) => {
      setDealState((prev) => (typeof patch === "function" ? patch(prev) : { ...prev, ...patch }));
    },
    [],
  );

  const saveDraft = useCallback(async (): Promise<string | undefined> => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: deal.sessionId ?? getSessionId(),
          applicationId: deal.applicationId,
          address: deal.formattedAddress,
          propertyIntel: deal.intel,
          termSheet: deal.quote,
          status: "draft",
          dealSnapshot: deal,
          fico: deal.fico,
          borrowerType: deal.borrowerType,
          purpose: deal.purpose,
          utm: deal.utm,
        }),
      });
      const json = await res.json();
      if (json.application?.id) {
        setDealState((d) => ({ ...d, applicationId: json.application.id }));
        return json.application.id as string;
      }
      return deal.applicationId;
    } finally {
      setLoading(false);
    }
  }, [deal]);

  const value = useMemo(
    () => ({ deal, setDeal, saveDraft, loading }),
    [deal, setDeal, saveDraft, loading],
  );

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useDeal() {
  const ctx = useContext(DealContext);
  if (!ctx) throw new Error("useDeal must be used within DealProvider");
  return ctx;
}
