"use client";

import { BridgeCalculatorSection } from "@/components/landing/bridge-calculator-section";
import { navigateToNestChat } from "@/lib/nest-chat-launch";
import { useRouter } from "next/navigation";

export function BridgeCalculatorBlock() {
  const router = useRouter();
  return (
    <BridgeCalculatorSection
      onStart={(text) => {
        navigateToNestChat(router.push, { message: text });
      }}
    />
  );
}
