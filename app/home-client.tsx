"use client";

import dynamic from "next/dynamic";

const AppFlow = dynamic(
  () => import("@/components/flow/app-flow").then((m) => m.AppFlow),
  { ssr: false },
);

export function HomeClient() {
  return <AppFlow />;
}
