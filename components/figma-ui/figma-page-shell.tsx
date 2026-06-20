import "@/app/figma-pages/shared.css";
import { AppHeader } from "@/components/landing/app-header";
import { Footer } from "@/components/landing/footer";

export function FigmaPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="product-page-shell">
      <AppHeader />
      <main className="product-page-main">{children}</main>
      <Footer />
    </div>
  );
}
