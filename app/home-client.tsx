"use client";

import dynamic from "next/dynamic";
import { getNestChatInit, type NestChatInit } from "@/lib/nest-chat-launch";

const AppFlow = dynamic(
  () => import("@/components/flow/app-flow").then((m) => m.AppFlow),
  { ssr: false },
);

export function HomeClient() {
  const pendingInit: NestChatInit | null =
    typeof window === "undefined" ? null : getNestChatInit();

  return <AppFlow pendingChatInit={pendingInit} />;
}
