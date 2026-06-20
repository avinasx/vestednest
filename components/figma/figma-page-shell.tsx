import { AppHeader } from "@/components/landing/app-header";
import { Footer } from "@/components/landing/footer";

/** Wraps Figma-exported page content at 1440px design width with site chrome. */
export function FigmaPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="figma-page-shell">
      <AppHeader />
      <main className="figma-page-main">
        <div className="figma-page-viewport">
          <div className="figma-page-canvas">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
