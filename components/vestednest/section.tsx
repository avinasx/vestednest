import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-vn-bg font-sans text-black">{children}</div>
  );
}
