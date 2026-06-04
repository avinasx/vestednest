import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] bg-vn-bg text-black">{children}</div>
  );
}

export function Section({
  children,
  className = "",
  surface = false,
}: {
  children: ReactNode;
  className?: string;
  surface?: boolean;
}) {
  return (
    <section
      className={`${surface ? "bg-vn-surface" : ""} ${className}`}
    >
      <div className="mx-auto w-full max-w-[1240px] px-6 md:px-[100px]">{children}</div>
    </section>
  );
}

export function SectionWide({
  children,
  className = "",
  surface = false,
}: {
  children: ReactNode;
  className?: string;
  surface?: boolean;
}) {
  return (
    <section className={`${surface ? "bg-vn-surface" : ""} ${className}`}>
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-[100px]">
        {children}
      </div>
    </section>
  );
}
