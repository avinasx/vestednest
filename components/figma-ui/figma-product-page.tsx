"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { BridgeCalculatorBlock } from "@/components/product/bridge-calculator-block";
import { ProductAddressBar } from "@/components/figma-ui/product-address-bar";
import type { ProductPageConfig, ProductSection } from "@/lib/product-pages/types";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="fn-label">{children}</span>;
}

function SectionBg({
  bg,
  children,
}: {
  bg?: "muted" | "white";
  children: React.ReactNode;
}) {
  const cls =
    bg === "muted" ? "fn-section fn-section--muted" : bg === "white" ? "fn-section fn-section--white" : "fn-section";
  return <section className={cls}>{children}</section>;
}

function ProductFaq({
  label,
  title,
  items,
}: {
  label: string;
  title: string;
  items: { q: string; a: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="fn-section fn-section--muted">
      <div className="fn-inner fn-text-center">
        <SectionLabel>{label}</SectionLabel>
        <h2 className="fn-section-title">
          {title.replace(/\.$/, "")}
          <em>.</em>
        </h2>
      </div>
      <div className="fn-inner" style={{ maxWidth: 880 }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="fn-faq-item">
              <button
                type="button"
                className="fn-faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
                <img
                  src={
                    isOpen
                      ? "/static-pages/faq/icon-accordion-open.svg"
                      : "/static-pages/faq/icon-accordion-closed.svg"
                  }
                  alt=""
                  aria-hidden
                />
              </button>
              {isOpen ? <p className="fn-faq-a">{item.a}</p> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function renderSection(section: ProductSection, key: number) {
  switch (section.type) {
    case "hero":
      return (
        <section key={key} className="fn-hero">
          <div className="fn-hero-grid" aria-hidden />
          <div className="fn-inner fn-hero-inner">
            {section.badge ? <div className="fn-badge">{section.badge}</div> : null}
            <h1 className="fn-hero-title">
              {section.title}
              {section.titleAccent ? (
                <>
                  <br />
                  <em>{section.titleAccent}</em>
                </>
              ) : null}
            </h1>
            <p className="fn-hero-lead">{section.lead}</p>
            <ProductAddressBar />
            {section.perks?.length ? (
              <div className="fn-perks">
                {section.perks.map((perk) => (
                  <span key={perk} className="fn-perk">
                    <img src="/figma-assets/imgCheckmarkCircle02.svg" alt="" aria-hidden />
                    {perk}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );

    case "scale":
      return (
        <SectionBg key={key} bg={section.bg === "muted" ? "muted" : "white"}>
          <div className="fn-inner">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">
              {section.title.replace(/\?$/, "")}
              {section.title.includes("?") ? <em>?</em> : null}
            </h2>
            {section.intro?.map((p) => (
              <p key={p} className="fn-section-lead" style={{ textAlign: "left", maxWidth: "100%" }}>
                {p}
              </p>
            ))}
            <div className="fn-scale-grid">
              {section.items.map((item) => (
                <article key={item.value} className="fn-scale-card">
                  <p className="fn-scale-value">{item.value}</p>
                  <span className="fn-scale-tag">{item.tag}</span>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionBg>
      );

    case "personas":
      return (
        <section key={key} className="fn-section fn-section--white">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
            {section.lead ? <p className="fn-section-lead">{section.lead}</p> : null}
          </div>
          <div className="fn-inner fn-persona-grid">
            {section.items.map((item) => (
              <article key={item.title} className="fn-persona-card">
                <p className="fn-persona-type">{item.title}</p>
                <h3>{item.subtitle}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      );

    case "timeline":
      return (
        <SectionBg key={key} bg={section.bg === "muted" ? "muted" : undefined}>
          <div className="fn-inner fn-timeline-layout">
            <div>
              <SectionLabel>{section.label}</SectionLabel>
              <h2 className="fn-section-title">{section.title}</h2>
              <ol className="fn-steps">
                {section.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="fn-step-num">{i + 1}</span>
                    <div>
                      <p className="fn-step-time">{step.time}</p>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {section.example ? (
              <aside className="fn-example-card">
                <p className="fn-example-label">{section.example.label}</p>
                <div className="fn-example-stats">
                  {section.example.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="fn-example-stat-label">{stat.label}</p>
                      <p className="fn-example-stat-value">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </SectionBg>
      );

    case "terms":
      return (
        <section key={key} className="fn-section fn-section--white">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">
              {section.title.split(".")[0]}
              <em>.</em>
            </h2>
            {section.lead ? <p className="fn-section-lead">{section.lead}</p> : null}
          </div>
          <div className="fn-inner fn-table-wrap">
            <table className="fn-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Range / Options</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.param}>
                    <td>{row.param}</td>
                    <td>{row.range}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {section.footnote ? (
              <p className="mt-4 text-sm opacity-60">{section.footnote}</p>
            ) : null}
          </div>
        </section>
      );

    case "comparison":
      return (
        <SectionBg key={key} bg="muted">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
          </div>
          <div className="fn-inner fn-table-wrap">
            <table className="fn-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>DSCR</th>
                  <th>Conventional</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.feature}>
                    <td>{row.feature}</td>
                    <td>{row.dscr}</td>
                    <td>{row.conventional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionBg>
      );

    case "cards": {
      const cols =
        section.columns === 4 ? 4 : section.columns === 2 ? 2 : 3;
      return (
        <SectionBg key={key} bg={section.bg === "muted" ? "muted" : "white"}>
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
            {section.lead ? <p className="fn-section-lead">{section.lead}</p> : null}
          </div>
          <div
            className="fn-inner fn-persona-grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {section.items.map((item) => (
              <article key={item.title} className="fn-persona-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </SectionBg>
      );
    }

    case "faq":
      return (
        <ProductFaq key={key} label={section.label} title={section.title} items={section.items} />
      );

    case "cta":
      return (
        <section key={key} className="fn-final-cta">
          <div className="fn-inner">
            <h2>
              {section.title.split(".")[0]}
              {section.title.includes(".") ? <em>.</em> : null}
            </h2>
            {section.lead ? <p className="fn-section-lead">{section.lead}</p> : null}
            <Link href="/" className="fn-cta-btn">
              Start with an address →
            </Link>
            {section.perks?.length ? (
              <div className="fn-perks mt-6">
                {section.perks.map((perk) => (
                  <span key={perk} className="fn-perk">
                    <img src="/figma-assets/imgCheckmarkCircle02.svg" alt="" aria-hidden />
                    {perk}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );

    case "bridge-calculator":
      return (
        <div key={key} className="fn-section fn-section--muted">
          <div className="fn-inner">
            <BridgeCalculatorBlock />
          </div>
        </div>
      );

    case "intro":
      return (
        <SectionBg key={key} bg={section.bg === "muted" ? "muted" : "white"}>
          <div className="fn-inner">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
            <div className="fn-prose">
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </SectionBg>
      );

    case "pipeline":
      return (
        <section key={key} className="fn-section fn-section--white">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
          </div>
          <div className="fn-inner fn-pipeline-grid">
            {section.deals.map((deal) => (
              <article key={`${deal.tag}-${deal.city}`} className="fn-pipeline-card">
                <span className="fn-pipeline-tag">{deal.tag}</span>
                <h3>{deal.city}</h3>
                {deal.amount ? <p className="fn-pipeline-amount">{deal.amount}</p> : null}
                <p className="fn-pipeline-caption">{deal.caption}</p>
                <div className="fn-pipeline-stats">
                  {deal.stats.map((stat) => (
                    <div key={stat.label}>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      );

    case "qualification":
      return (
        <section key={key} className="fn-section fn-section--white">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
          </div>
          <div className="fn-inner fn-qual-grid">
            <div>
              <h3 className="fn-qual-heading">What we look at</h3>
              <ul className="fn-qual-list">
                {section.yes.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="fn-qual-heading fn-qual-heading--muted">What we don&apos;t look at</h3>
              <ul className="fn-qual-list fn-qual-list--muted">
                {section.no.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      );

    case "spectrum":
      return (
        <section key={key} className="fn-section fn-section--muted">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
          </div>
          <div className="fn-inner fn-spectrum-grid">
            {section.items.map((item) => (
              <article key={item.tab} className="fn-spectrum-card">
                <span className="fn-spectrum-tab">{item.tab}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <dl className="fn-spectrum-specs">
                  {item.specs.map((spec) => (
                    <div key={spec.label}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </section>
      );

    case "journey":
      return (
        <section key={key} className="fn-section fn-section--white">
          <div className="fn-inner fn-text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="fn-section-title">{section.title}</h2>
            {section.lead ? <p className="fn-section-lead">{section.lead}</p> : null}
          </div>
          <div className="fn-inner fn-journey-grid">
            {section.steps.map((step, i) => (
              <article key={step.title} className="fn-journey-card">
                <span className="fn-journey-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      );

    case "worked-example":
      return (
        <section key={key} className="fn-section fn-section--muted">
          <div className="fn-inner fn-worked-layout">
            <div>
              <SectionLabel>{section.label}</SectionLabel>
              <h2 className="fn-section-title">{section.title}</h2>
              <p className="fn-section-lead" style={{ textAlign: "left", margin: "0 0 24px" }}>
                {section.subtitle}
              </p>
              <div className="fn-worked-rows">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className={`fn-worked-row${row.highlight ? " fn-worked-row--highlight" : ""}`}
                  >
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <aside className="fn-example-card">
              <div className="fn-example-stats">
                {section.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="fn-example-stat-label">{stat.label}</p>
                    <p className="fn-example-stat-value">{stat.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      );

    default:
      return null;
  }
}

export function FigmaProductPage({ config }: { config: ProductPageConfig }) {
  return <>{config.sections.map((section, i) => renderSection(section, i))}</>;
}
