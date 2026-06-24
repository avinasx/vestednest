import type { ReactNode } from "react";

export default function QuoteLayout({ children }: { children: ReactNode }) {
  return <div className="h-full overflow-y-auto">{children}</div>;
}
