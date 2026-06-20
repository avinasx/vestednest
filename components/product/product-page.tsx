"use client";

import { useState } from "react";
import { CheckItem } from "@/components/landing/check-item";
import { SectionLabel } from "@/components/landing/section-label";
import { BridgeCalculatorBlock } from "@/components/product/bridge-calculator-block";
import type { ProductPageConfig, ProductSection } from "@/lib/product-pages/types";
import Link from "next/link";

function SectionBg({ bg, children }: { bg?: "muted" | "white"; children: React.ReactNode }) {
  if (bg === "muted") {
    return (
      <section className="product-section product-section--muted">{children}</section>
    );
  }
  return <section className="product-section">{children}</section>;
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
    <section className="product-section product-section--muted">
      <div className="landing-section-inner">
        <SectionLabel>{label}</SectionLabel>
        <h2 className="product-section-title">{title}</h2>
        <div className="product-faq">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`product-faq-item${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="product-faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {item.q}
                  <span className="product-faq-icon" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? <p className="product-faq-a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderSection(section: ProductSection, key: number) {
  switch (section.type) {
    case "hero":
      return (
        <section key={key} className="product-hero">
          <div className="product-hero-grid" aria-hidden />
          <div className="landing-section-inner product-hero-inner">
            {section.badge ? (
              <div className="landing-hero-badge">{section.badge}</div>
            ) : null}
            <h1 className="product-hero-title">
              {section.title}
              {section.titleAccent ? (
                <>
                  <br />
                  <em>{section.titleAccent}</em>
                </>
              ) : null}
            </h1>
            <p className="product-hero-lead">{section.lead}</p>
            <Link href="/" className="landing-final-cta-btn product-hero-cta">
              Start with an address
            </Link>
            {section.perks?.length ? (
              <div className="product-hero-perks">
                {section.perks.map((perk) => (
                  <CheckItem key={perk}>{perk}</CheckItem>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );

    case "intro":
      return (
        <SectionBg key={key} bg={section.bg}>
          <div className="landing-section-inner product-split">
            <div>
              <SectionLabel>{section.label}</SectionLabel>
              <h2 className="product-section-title">{section.title}</h2>
              <div className="product-prose">
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </SectionBg>
      );

    case "scale":
      return (
        <SectionBg key={key} bg={section.bg}>
          <div className="landing-section-inner">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
            {section.intro?.length ? (
              <div className="product-prose product-prose--narrow">
                {section.intro.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ) : null}
            <div className="product-scale-grid">
              {section.items.map((item) => (
                <article key={item.value} className="product-scale-card">
                  <p className="product-scale-value">{item.value}</p>
                  <span className="product-scale-tag">{item.tag}</span>
                  <p className="product-scale-body">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionBg>
      );

    case "personas":
      return (
        <section key={key} className="product-section">
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
            {section.lead ? <p className="landing-section-lead">{section.lead}</p> : null}
          </div>
          <div className="landing-section-inner product-persona-grid">
            {section.items.map((item) => (
              <article key={item.title} className="landing-feature-card product-persona-card">
                <p className="product-persona-type">{item.title}</p>
                <h3>{item.subtitle}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      );

    case "timeline":
      return (
        <SectionBg key={key} bg={section.bg}>
          <div className="landing-section-inner product-timeline-layout">
            <div>
              <SectionLabel>{section.label}</SectionLabel>
              <h2 className="product-section-title">{section.title}</h2>
              <ol className="product-steps">
                {section.steps.map((step) => (
                  <li key={step.title}>
                    <span className="product-step-time">{step.time}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {section.example ? (
              <aside className="product-example-card">
                <p className="product-example-label">{section.example.label}</p>
                <div className="product-example-stats">
                  {section.example.stats.map((stat) => (
                    <div key={stat.label}>
                      <p className="product-example-stat-label">{stat.label}</p>
                      <p className="product-example-stat-value">{stat.value}</p>
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
        <section key={key} className="product-section">
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
            {section.lead ? <p className="landing-section-lead">{section.lead}</p> : null}
          </div>
          <div className="landing-section-inner product-terms-wrap">
            <table className="product-terms-table">
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
              <p className="product-terms-footnote">{section.footnote}</p>
            ) : null}
          </div>
        </section>
      );

    case "comparison":
      return (
        <SectionBg key={key} bg={section.bg}>
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
          </div>
          <div className="landing-section-inner product-terms-wrap">
            <table className="product-terms-table product-comparison-table">
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
      const colClass =
        section.columns === 4
          ? "product-cards-grid--4"
          : section.columns === 2
            ? "product-cards-grid--2"
            : "product-cards-grid--3";
      return (
        <SectionBg key={key} bg={section.bg}>
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
            {section.lead ? <p className="landing-section-lead">{section.lead}</p> : null}
          </div>
          <div className={`landing-section-inner product-cards-grid ${colClass}`}>
            {section.items.map((item) => (
              <article key={item.title} className="landing-feature-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </SectionBg>
      );
    }

    case "pipeline":
      return (
        <section key={key} className="product-section">
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
          </div>
          <div className="landing-section-inner product-pipeline-grid">
            {section.deals.map((deal) => (
              <article key={`${deal.tag}-${deal.city}`} className="product-pipeline-card">
                <span className="product-pipeline-tag">{deal.tag}</span>
                <h3>{deal.city}</h3>
                {deal.amount ? <p className="product-pipeline-amount">{deal.amount}</p> : null}
                <p className="product-pipeline-caption">{deal.caption}</p>
                <div className="product-pipeline-stats">
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
        <section key={key} className="product-section">
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
          </div>
          <div className="landing-section-inner product-qual-grid">
            <div>
              <h3 className="product-qual-heading">What we look at</h3>
              <ul className="product-qual-list">
                {section.yes.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="product-qual-heading product-qual-heading--muted">
                What we don&apos;t look at
              </h3>
              <ul className="product-qual-list product-qual-list--muted">
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
        <section key={key} className="product-section product-section--muted">
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
          </div>
          <div className="landing-section-inner product-spectrum-grid">
            {section.items.map((item) => (
              <article key={item.tab} className="product-spectrum-card">
                <span className="product-spectrum-tab">{item.tab}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <dl className="product-spectrum-specs">
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
        <section key={key} className="product-section">
          <div className="landing-section-inner text-center">
            <SectionLabel>{section.label}</SectionLabel>
            <h2 className="product-section-title">{section.title}</h2>
            {section.lead ? <p className="landing-section-lead">{section.lead}</p> : null}
          </div>
          <div className="landing-section-inner product-journey-grid">
            {section.steps.map((step, i) => (
              <article key={step.title} className="product-journey-card">
                <span className="product-journey-num">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      );

    case "bridge-calculator":
      return (
        <div key={key}>
          <BridgeCalculatorBlock />
        </div>
      );

    case "worked-example":
      return (
        <section key={key} className="product-section product-section--muted">
          <div className="landing-section-inner product-worked-layout">
            <div>
              <SectionLabel>{section.label}</SectionLabel>
              <h2 className="product-section-title">{section.title}</h2>
              <div className="product-worked-rows">
                {section.rows.map((row) => (
                  <div
                    key={row.label}
                    className={`product-worked-row${row.highlight ? " product-worked-row--highlight" : ""}`}
                  >
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="product-example-card">
              <div className="product-example-stats product-example-stats--2x2">
                {section.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="product-example-stat-label">{stat.label}</p>
                    <p className="product-example-stat-value">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );

    case "faq":
      return <ProductFaq key={key} label={section.label} title={section.title} items={section.items} />;

    case "cta":
      return (
        <section key={key} className="landing-final-cta">
          <div className="landing-section-inner">
            <h2>{section.title}</h2>
            {section.lead ? <p className="landing-final-cta-lead">{section.lead}</p> : null}
            <Link href="/" className="landing-final-cta-btn">
              Start with an address
            </Link>
            {section.perks?.length ? (
              <div className="landing-final-cta-perks">
                {section.perks.map((perk) => (
                  <CheckItem key={perk} light>
                    {perk}
                  </CheckItem>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      );

    default:
      return null;
  }
}

export function ProductPage({ config }: { config: ProductPageConfig }) {
  return (
    <div className="product-page">
      <main>{config.sections.map((section, i) => renderSection(section, i))}</main>
    </div>
  );
}
