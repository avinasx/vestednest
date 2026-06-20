import type { ProductPageConfig, ProductSection } from "./types";

export function getPageSection<T extends ProductSection["type"]>(
  config: ProductPageConfig,
  type: T,
): Extract<ProductSection, { type: T }> {
  const section = config.sections.find((s) => s.type === type);
  if (!section || section.type !== type) {
    throw new Error(`Missing "${type}" section on ${config.slug}`);
  }
  return section as Extract<ProductSection, { type: T }>;
}

export function findPageSection<T extends ProductSection["type"]>(
  config: ProductPageConfig,
  type: T,
  predicate?: (section: Extract<ProductSection, { type: T }>) => boolean,
): Extract<ProductSection, { type: T }> {
  for (const section of config.sections) {
    if (section.type !== type) continue;
    const typed = section as Extract<ProductSection, { type: T }>;
    if (!predicate || predicate(typed)) return typed;
  }
  throw new Error(`Missing "${type}" section on ${config.slug}`);
}
