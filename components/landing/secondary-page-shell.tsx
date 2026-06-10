import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { Footer } from "./footer";

type SecondaryPageShellProps = {
  children: ReactNode;
  /** Center content vertically (login card) */
  centered?: boolean;
  narrow?: boolean;
};

export function SecondaryPageShell({
  children,
  centered = false,
  narrow = false,
}: SecondaryPageShellProps) {
  return (
    <div className="secondary-page">
      <AppHeader />
      <div className="secondary-grid" aria-hidden />
      <main
        className={`secondary-main${centered ? " secondary-main--center" : ""}${narrow ? " secondary-main--narrow" : ""}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
