"use client";

import { useEffect } from "react";
import { captureUtmFromUrl, getStoredUtm } from "@/lib/analytics/events";

const STORAGE_KEY = "vn-deal-draft";

export function AnalyticsInit() {
  useEffect(() => {
    captureUtmFromUrl();
    try {
      const utm = getStoredUtm();
      if (!Object.keys(utm).length) return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const deal = JSON.parse(raw) as { utm?: Record<string, string> };
      deal.utm = utm;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deal));
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
