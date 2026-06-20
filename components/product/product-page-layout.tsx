import { AppHeader } from "@/components/landing/app-header";
import { Footer } from "@/components/landing/footer";
import { ProductPage } from "@/components/product/product-page";
import type { ProductPageConfig } from "@/lib/product-pages/types";

export function ProductPageLayout({ config }: { config: ProductPageConfig }) {
  return (
    <div className="product-page-shell">
      <AppHeader />
      <main className="product-page-main">
        <ProductPage config={config} />
      </main>
      <Footer />
    </div>
  );
}
