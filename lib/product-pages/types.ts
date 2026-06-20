export type TermsRow = {
  param: string;
  range: string;
  notes: string;
};

export type PipelineDeal = {
  tag: string;
  city: string;
  amount: string;
  caption: string;
  stats: { label: string; value: string }[];
};

export type ProductSection =
  | {
      type: "hero";
      badge?: string;
      title: string;
      titleAccent?: string;
      lead: string;
      perks?: string[];
    }
  | {
      type: "intro";
      label: string;
      title: string;
      paragraphs: string[];
      bg?: "muted" | "white";
    }
  | {
      type: "scale";
      label: string;
      title: string;
      intro?: string[];
      items: { value: string; tag: string; body: string }[];
      bg?: "muted" | "white";
    }
  | {
      type: "personas";
      label: string;
      title: string;
      lead?: string;
      items: { title: string; subtitle: string; body: string }[];
    }
  | {
      type: "timeline";
      label: string;
      title: string;
      steps: { time: string; title: string; body: string }[];
      example?: {
        label: string;
        stats: { label: string; value: string }[];
      };
      bg?: "muted" | "white";
    }
  | {
      type: "terms";
      label: string;
      title: string;
      lead?: string;
      footnote?: string;
      rows: TermsRow[];
    }
  | {
      type: "comparison";
      label: string;
      title: string;
      rows: { feature: string; dscr: string; conventional: string }[];
      bg?: "muted" | "white";
    }
  | {
      type: "cards";
      label: string;
      title: string;
      lead?: string;
      items: { title: string; body: string }[];
      columns?: 2 | 3 | 4;
      bg?: "muted" | "white";
    }
  | {
      type: "pipeline";
      label: string;
      title: string;
      deals: PipelineDeal[];
    }
  | {
      type: "qualification";
      label: string;
      title: string;
      yes: { title: string; body: string }[];
      no: { title: string; body: string }[];
    }
  | {
      type: "spectrum";
      label: string;
      title: string;
      items: {
        tab: string;
        title: string;
        body: string;
        specs: { label: string; value: string }[];
      }[];
    }
  | {
      type: "journey";
      label: string;
      title: string;
      lead?: string;
      steps: { title: string; body: string }[];
    }
  | { type: "bridge-calculator" }
  | {
      type: "worked-example";
      label: string;
      title: string;
      subtitle: string;
      rows: { label: string; value: string; highlight?: boolean }[];
      stats: { label: string; value: string }[];
    }
  | {
      type: "faq";
      label: string;
      title: string;
      items: { q: string; a: string }[];
    }
  | {
      type: "cta";
      title: string;
      titleAccent?: string;
      lead?: string;
      perks?: string[];
    };

export type ProductPageConfig = {
  slug: string;
  meta: { title: string; description: string };
  sections: ProductSection[];
};
