import "@/app/figma-pages/blog.css";
import { BlogPage } from "@/components/figma-pages/blog/blog-page";
import { FigmaPageShell } from "@/components/figma-ui/figma-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Vested Nest",
  description:
    "Operator intel on DSCR loans, bridge financing, BRRRR strategy, foreign national investing, and market analysis.",
};

export default function BlogRoutePage() {
  return (
    <FigmaPageShell>
      <BlogPage />
    </FigmaPageShell>
  );
}
