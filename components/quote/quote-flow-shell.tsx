"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VestedNestLogo } from "@/components/vestednest/logo";
import { NestChatPanel } from "./nest-chat-panel";

const STEPS = [
  { href: "/quote/property", label: "Property" },
  { href: "/quote/numbers", label: "Your numbers" },
  { href: "/quote/scenario", label: "Structure" },
  { href: "/quote/rate", label: "Choose rate" },
  { href: "/quote/term-sheet", label: "Term sheet" },
];

export function QuoteFlowShell({ children, step }: { children: React.ReactNode; step?: number }) {
  const pathname = usePathname();

  return (
    <div className="quote-flow">
      <header className="quote-topbar">
        <Link href="/" className="quote-brand">
          <VestedNestLogo />
        </Link>
        {step != null && (
          <span className="quote-step">
            Step {step} of 7 · {STEPS[step - 2]?.label ?? "Quote"}
          </span>
        )}
      </header>

      <nav className="quote-progress" aria-label="Quote progress">
        {STEPS.map((s, i) => {
          const active = pathname === s.href;
          const done = STEPS.findIndex((x) => x.href === pathname) > i;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={`quote-progress-item${active ? " active" : ""}${done ? " done" : ""}`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      <main className="quote-main">{children}</main>
      <NestChatPanel />
    </div>
  );
}

export function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
