"use client";

import { navigateToNestChat, type NestChatInit } from "@/lib/nest-chat-launch";
import { useRouter } from "next/navigation";

type NestChatLaunchButtonProps = {
  className?: string;
  init?: NestChatInit;
  children: React.ReactNode;
};

/** Opens the home Nest AI chat flow (same as the hero address bar). */
export function NestChatLaunchButton({ className, init, children }: NestChatLaunchButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => navigateToNestChat(router.push, init)}
    >
      {children}
    </button>
  );
}
