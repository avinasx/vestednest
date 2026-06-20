"use client";

import Link from "next/link";
import { CheckItem } from "@/components/landing/check-item";
import { SectionLabel } from "@/components/landing/section-label";
import {
  ABOUT_BELIEFS,
  ABOUT_DIFFERENTIATORS,
  ABOUT_PRESS,
  ABOUT_STATS,
  ABOUT_TEAM,
} from "@/lib/static-pages/content/about";

export function AboutPage() {
  return (
    <>
      <section className="static-hero static-hero--about">
        <div className="product-hero-grid" aria-hidden />
        <div className="landing-section-inner static-hero-inner">
          <div className="landing-hero-badge">Founded 2019 · Now funding in 38 states</div>
          <h1 className="static-hero-title">
            Most lenders qualify you. <em>We qualify the property.</em>
          </h1>
          <p className="static-hero-lead">
            Vested Nest is an agentic DSCR financing platform built for serious operators. We use
            AI to eliminate the paperwork, compress the timeline, and put your rate on screen in 60
            seconds — so you can move as fast as the market does.
          </p>
          <div className="static-stats">
            {ABOUT_STATS.map((stat) => (
              <div key={stat.label} className="static-stat">
                <p className="static-stat-value">{stat.value}</p>
                <p className="static-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="static-section">
        <div className="landing-section-inner static-mission-grid">
          <div>
            <SectionLabel>Our mission</SectionLabel>
            <h2 className="product-section-title">We built the lender we always wished existed.</h2>
            <div className="product-prose">
              <p>
                The team behind Vested Nest has spent years watching real estate operators — smart,
                analytical people with strong deals — get turned down by conventional lenders because
                their W2 didn&apos;t look right on paper.
              </p>
              <p>
                The property was cash-flowing. The DSCR was solid. The deal was good. But the form
                said no.
              </p>
              <p>
                We built Vested Nest to fix that. A financing platform that reads the property, not
                the borrower — and uses AI to do it in 60 seconds instead of 30 days.
              </p>
            </div>
            <blockquote className="static-quote">
              <p>&ldquo;The property does the qualifying. Your W2 is irrelevant.&rdquo;</p>
              <cite>Vested Nest founding principle</cite>
            </blockquote>
          </div>
          <aside className="static-beliefs-card">
            <h3>What we believe</h3>
            <ul>
              {ABOUT_BELIEFS.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="static-section static-section--muted">
        <div className="landing-section-inner text-center">
          <SectionLabel>What makes us different</SectionLabel>
          <h2 className="product-section-title">Not just faster. Fundamentally different.</h2>
        </div>
        <div className="landing-section-inner static-diff-grid">
          {ABOUT_DIFFERENTIATORS.map((item) => (
            <article key={item.title} className="landing-feature-card static-diff-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="static-section">
        <div className="landing-section-inner text-center">
          <SectionLabel>The team</SectionLabel>
          <h2 className="product-section-title">Operators building for operators.</h2>
          <p className="landing-section-lead">
            Being specific here matters. If you see yourself in one of these scenarios, you&apos;re
            exactly who this product was built for.
          </p>
        </div>
        <div className="landing-section-inner static-team-grid">
          {ABOUT_TEAM.map((member) => (
            <article key={member.name} className="static-team-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.photo} alt={member.name} className="static-team-photo" />
              <div>
                <h3>{member.name}</h3>
                <p className="static-team-title">{member.title}</p>
                <p>{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="static-section static-section--muted static-press-section">
        <div className="landing-section-inner text-center">
          <SectionLabel>As seen in</SectionLabel>
          <h2 className="product-section-title">Coverage & recognition.</h2>
          <div className="static-press-row">
            {ABOUT_PRESS.map((name) => (
              <span key={name} className="landing-press-logo">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="static-section">
        <div className="landing-section-inner static-contact-grid">
          <div>
            <SectionLabel>Get in touch</SectionLabel>
            <h2 className="product-section-title">
              We pick up the <em>phone.</em>
            </h2>
            <p className="landing-section-lead">
              Enjoy personalized service and direct access — no phone tags, just solutions.
            </p>
          </div>
          <div className="static-contact-cards">
            <a href="mailto:viraj@theagentfactory.io" className="static-contact-card">
              viraj@theagentfactory.io
            </a>
            <a href="tel:+15166619018" className="static-contact-card">
              +1 (516) 661-9018
            </a>
            <p className="static-contact-card">New York, NY</p>
          </div>
        </div>
      </section>

      <section className="static-section static-section--muted static-final-cta">
        <div className="landing-section-inner text-center">
          <h2 className="product-section-title">
            Ready to work <em>with us?</em>
          </h2>
          <Link href="/" className="landing-final-cta-btn">
            Start with an address →
          </Link>
          <div className="static-cta-perks">
            {["No SSN", "No PII", "No credit pull", "30-day close"].map((perk) => (
              <CheckItem key={perk}>{perk}</CheckItem>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
