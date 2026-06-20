/* eslint-disable @next/next/no-img-element */
import { imgContainer, imgSvg } from "@/lib/figma/assets";

type FigmaHeroBackgroundProps = {
  /** Product pages use stronger green glow; content pages (FAQ, privacy) use white band */
  variant?: "product" | "content";
};

export function FigmaHeroBackground({ variant = "product" }: FigmaHeroBackgroundProps) {
  return (
    <>
      <div className="figma-hero-grid" aria-hidden />
      <div className="figma-hero-cells" aria-hidden />
      <div
        className={`figma-hero-glow${variant === "content" ? " figma-hero-glow--soft" : ""}`}
        aria-hidden
      />
      <img src={imgSvg} alt="" aria-hidden className="figma-hero-svg" />
      <div
        className="figma-hero-mask"
        aria-hidden
        style={{
          WebkitMaskImage: `url(${imgContainer})`,
          maskImage: `url(${imgContainer})`,
        }}
      />
    </>
  );
}
