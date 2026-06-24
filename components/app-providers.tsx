"use client";

import type { ReactNode } from "react";
import { DealProvider } from "@/lib/deal/context";
import { AnalyticsInit } from "@/components/analytics/analytics-init";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <DealProvider>
      <AnalyticsInit />
      {children}
    </DealProvider>
  );
}
