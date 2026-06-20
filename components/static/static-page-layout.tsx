import { AppHeader } from "@/components/landing/app-header";
import { Footer } from "@/components/landing/footer";

export function StaticPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="static-page-shell">
      <AppHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
