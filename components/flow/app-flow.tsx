"use client";

import { useEffect, useState } from "react";
import { AddressAutocomplete } from "@/components/vestednest/address-autocomplete";
import { VestedNestLogo } from "@/components/vestednest/logo";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPage } from "@/components/landing/landing-page";
import { ChatMarkdown } from "./chat-markdown";
import { FlowChrome } from "./flow-chrome";
import { useLoanFlow } from "./use-loan-flow";
import { borrowerLabel, fmtMoney, termSheetFilename } from "./utils";

const LOAD_STEPS = [
  {
    title: "Pulling parcel data & property attributes",
    sub: "Beds, baths, sqft, year built, lot size, property type",
  },
  {
    title: "Reading rent comps (Realie market data)",
    sub: "Nearby rentals used to estimate your monthly income",
  },
  {
    title: "Estimating ARV & current market value",
    sub: "AVM-based valuation — After Repair Value vs current",
  },
  {
    title: "Checking zip market trends & days on market",
    sub: "YoY rent movement, avg DOM for zip",
  },
  {
    title: "Calculating DSCR, rate & term sheet",
    sub: "Rate, points, PITIA, cash to close, reserve requirement",
  },
];

function BorrowerOption({
  label,
  selected,
  recommended,
  onClick,
  flex,
}: {
  label: string;
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
  flex?: boolean;
}) {
  return (
    <div
      className="row ic gap8"
      onClick={onClick}
      style={{
        padding: "9px 13px",
        border: `1.5px solid ${selected ? "var(--fr)" : "var(--brl)"}`,
        borderRadius: 9,
        background: selected ? "rgba(31,77,49,.05)" : "transparent",
        cursor: "pointer",
        flex: flex ? 1 : undefined,
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: selected ? "var(--f)" : "transparent",
          border: selected ? "none" : "2px solid var(--br)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          color: "var(--w)",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {selected ? "✓" : ""}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      {recommended && (
        <span style={{ fontSize: 10, color: "var(--g)", marginLeft: "auto", fontWeight: 600 }}>
          recommended
        </span>
      )}
    </div>
  );
}

function TogglePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`togpill${active ? " on" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}

export function AppFlow() {
  const f = useLoanFlow();
  const [flowReady, setFlowReady] = useState(false);
  const ts = f.liveTermSheet;
  const intel = f.deal?.intel;
  const shortAddr = intel
    ? `${intel.addressLine}, ${intel.city}`
    : f.addressLabel;

  useEffect(() => {
    setFlowReady(true);
  }, []);

  return (
    <>
      <div className="app-top-nav">
        <LandingNav
          onHomeNavigate={() => f.goTo(0)}
          onGetPreQualified={() => f.startFromHero()}
          onSectionNavigate={(sectionId) => {
            const scrollToSection = () => {
              document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
            };
            if (f.screen !== 0) {
              f.goTo(0);
              requestAnimationFrame(scrollToSection);
            } else {
              scrollToSection();
            }
          }}
        />
      </div>

      {/* S0 Landing page (Figma v1) */}
      <div className={`screen landing${f.screen === 0 ? " active" : ""}`}>
        <LandingPage f={f} />
      </div>

      {flowReady ? (
      <>
      {/* S1 Chat */}
      <div className={`screen flowbg${f.screen === 1 ? " active" : ""}`}>
        <FlowChrome f={f}>
          <div className="flow-chat-panel">
            <div className="flow-chat-hd">
              <button
                type="button"
                className="flow-chat-logo-home"
                onClick={() => f.goTo(0)}
                aria-label="Vested Nest home"
              >
                <VestedNestLogo variant="light" />
              </button>
            </div>
            <div className="flow-chat-bd">
              <div className="flow-clog" ref={f.logRef}>
                {f.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flow-msg ${m.role === "user" ? "u" : "ai"}`}
                    style={{ animation: "fadeUp .3s ease both" }}
                  >
                    <div className={`flow-avatar ${m.role === "user" ? "user" : "ai"}`}>
                      {m.role === "user" ? "U" : null}
                    </div>
                    <div>
                      <div className="cb">
                        {m.role === "assistant" ? (
                          <ChatMarkdown content={m.content} />
                        ) : (
                          m.content
                        )}
                      </div>
                      {m.actions && m.actions.length > 0 && (
                        <div className="cacts">
                          {m.actions.map((a) => (
                            <button
                              key={a}
                              type="button"
                              className="cact"
                              disabled={f.chatLoading}
                              onClick={() => f.handleAction(a)}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {f.chatLoading && (
                  <div style={{ fontSize: 12, color: "var(--flow-muted)" }}>
                    {f.progressText ?? "Nest AI is thinking…"}
                  </div>
                )}
              </div>
              <div className="flow-chat-inp">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/landing/icon-stars.svg" alt="" className="flow-inp-stars" aria-hidden />
                <AddressAutocomplete
                  compact
                  plainInput
                  value={f.chatInput}
                  stateCode={f.heroState}
                  onValueChange={f.setChatInput}
                  onStateChange={f.setHeroState}
                  onSelect={(s) => {
                    f.setChatInput(s.label);
                    if (s.state) f.setHeroState(s.state);
                  }}
                  placeholder="Drop an address, or ask — e.g. I want to refi out of my bridge loan"
                  inputClassName="landing-aibar-input"
                  onSubmit={() => {
                    const v = f.chatInput;
                    f.setChatInput("");
                    f.sendChat(v);
                  }}
                />
                <button
                  type="button"
                  className="landing-aibar-send"
                  onClick={() => {
                    const v = f.chatInput;
                    f.setChatInput("");
                    f.sendChat(v);
                  }}
                  aria-label="Send"
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M3.5 10h13m0 0-5-5m5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <p className="flow-chat-footnote">
                No hard pull · No W2 · Soft credit only when you proceed
              </p>
            </div>
          </div>
        </FlowChrome>
      </div>

      {/* S2 Loading */}
      <div className={`screen flowbg${f.screen === 2 ? " active" : ""}`}>
        <FlowChrome f={f}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div className="flow-loading-card">
            <div className="badge gn mb16">
              <span className="bdot" />
              Realie API · Live
            </div>
            <h2 className="h2 dk mb8">
              {f.addressLabel || "Looking up property…"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--flow-muted)", marginBottom: 36 }}>
              Pulling parcel data, rent comps, and running your DSCR — takes about 3
              seconds.
            </p>
            <div style={{ borderLeft: "2px solid var(--flow-border)", paddingLeft: 26 }}>
              {LOAD_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`lline${f.loadStep >= i ? " vis" : ""}`}
                >
                  <div
                    className={`lico${
                      f.loadStep > i ? " done" : f.loadStep === i ? " spin" : ""
                    }`}
                  >
                    {f.loadStep > i ? "✓" : ""}
                  </div>
                  <div>
                    <div className="lth">{step.title}</div>
                    <div className="lts">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                opacity: f.loadDone ? 1 : 0,
                transition: "opacity .5s",
                marginTop: 28,
              }}
            >
              <div className="card row ic gap13" style={{ padding: "16px 22px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(46,204,113,.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--g)",
                    fontSize: 19,
                  }}
                >
                  ✓
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--dk)" }}>
                    Property data ready.
                  </div>
                  <div style={{ fontSize: 12, color: "var(--dt)" }}>
                    Parcel data pulled · Rent comps verified · Term sheet generated
                  </div>
                </div>
                <button type="button" className="btn g sm" onClick={() => f.goTo(3)}>
                  View results →
                </button>
              </div>
            </div>
          </div>
          </div>
        </FlowChrome>
      </div>

      {/* S3 Property Intel */}
      {intel && (
        <div className={`screen flowbg${f.screen === 3 ? " active" : ""}`}>
          <FlowChrome f={f}>
          <div className="flow-main-scroll">
            <div className="flow-content-inner pgsm" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
              <div className="row jb ic mb16">
                <div className="row ic gap8">
                  <div className="badge gn">
                    <span className="bdot" />
                    Property intelligence
                  </div>
                  <span style={{ fontSize: 12, color: "var(--flow-muted)" }}>{f.deal?.formattedAddress}</span>
                </div>
                <button type="button" className="btn g sm" onClick={() => f.goTo(4)}>
                  Structure loan →
                </button>
              </div>
              <div className="lgsec muted mb12">STEP 3 OF 8 · PROPERTY INTELLIGENCE</div>
              <h2 className="h2 dk mb8">We know your deal.</h2>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--dm)",
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                Here&apos;s what we read from the property. Verify the rent estimate before
                structuring your loan.
              </p>
              <div className="g2 mb18">
                <div className="card">
                  <div className="clbl mb14">PROPERTY SNAPSHOT</div>
                  <div
                    className="serif"
                    style={{ fontSize: 19, fontWeight: 700, color: "var(--dk)", marginBottom: 3 }}
                  >
                    {intel.addressLine}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--dt)", marginBottom: 18 }}>
                    {intel.city}, {intel.state} {intel.zip}
                    {intel.county ? ` · ${intel.county} County` : ""}
                  </div>
                  <div className="g2" style={{ gap: 9 }}>
                    <div className="surf">
                      <div className="clbl" style={{ marginBottom: 3 }}>
                        TYPE
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{intel.propertyType}</div>
                    </div>
                    <div className="surf">
                      <div className="clbl" style={{ marginBottom: 3 }}>
                        YEAR BUILT
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {intel.yearBuilt ?? "—"}
                      </div>
                    </div>
                    <div className="surf">
                      <div className="clbl" style={{ marginBottom: 3 }}>
                        BEDS / BATHS
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {intel.beds ?? "—"} bd / {intel.baths ?? "—"} ba
                      </div>
                    </div>
                    <div className="surf">
                      <div className="clbl" style={{ marginBottom: 3 }}>
                        SQFT / LOT
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {intel.sqft?.toLocaleString() ?? "—"}
                        {intel.acres ? ` / ${intel.acres} ac` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--brl)", paddingTop: 13, marginTop: 14 }}>
                    {intel.lastSalePrice && (
                      <div className="litem">
                        <span className="ll">Last sale</span>
                        <span className="lv">
                          {fmtMoney(intel.lastSalePrice)}
                          {intel.lastSaleDate ? ` · ${intel.lastSaleDate}` : ""}
                        </span>
                      </div>
                    )}
                    <div className="litem">
                      <span className="ll">Property taxes (annual)</span>
                      <span className="lv">{fmtMoney(intel.annualTax ?? 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="flow-card-dark-rent">
                  <div
                    style={{
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle,rgba(46,204,113,.1) 0%,transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div className="lgsec" style={{ color: "var(--g)", marginBottom: 14 }}>
                    REALIE · ESTIMATED RENT
                  </div>
                  <div className="flow-rent-big mb4">{fmtMoney(f.monthlyRent)}</div>
                  <div style={{ fontSize: 12, color: "var(--td)", marginBottom: 22 }}>
                    per month · long-term rental
                  </div>
                  <div
                    className="row gap28 mb18"
                    style={{ paddingBottom: 18, borderBottom: "1px solid var(--bi)" }}
                  >
                    <div>
                      <div className="lgsec" style={{ color: "var(--td)", marginBottom: 3 }}>
                        ARV
                      </div>
                      <div className="serif" style={{ fontSize: 23, fontWeight: 700, color: "var(--w)" }}>
                        {fmtMoney(intel.arv)}
                      </div>
                    </div>
                    <div>
                      <div className="lgsec" style={{ color: "var(--td)", marginBottom: 3 }}>
                        MKT VALUE
                      </div>
                      <div className="serif" style={{ fontSize: 23, fontWeight: 700, color: "var(--w)" }}>
                        {fmtMoney(intel.marketValue)}
                      </div>
                    </div>
                  </div>
                  <div className="row ic gap8 mb14">
                    <span className="serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--gh)" }}>
                      +{intel.yoyRentChange}%
                    </span>
                    <span style={{ fontSize: 12, color: "var(--td)" }}>
                      YoY rent · {intel.zip || "zip"} · avg DOM: {intel.avgDom} days
                    </span>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,.07)",
                      border: "1px solid var(--bih)",
                      borderRadius: 9,
                      padding: 13,
                    }}
                  >
                    <div className="lgsec" style={{ color: "var(--td)", marginBottom: 7 }}>
                      OVERRIDE ESTIMATED RENT
                    </div>
                    <div className="row ic gap7">
                      <span style={{ color: "var(--td)", fontSize: 17 }}>$</span>
                      <input
                        type="number"
                        value={f.monthlyRent}
                        onChange={(e) => f.setMonthlyRent(Number(e.target.value) || 0)}
                        style={{
                          background: "rgba(255,255,255,.1)",
                          border: "1px solid rgba(255,255,255,.2)",
                          color: "var(--w)",
                          fontSize: 15,
                          fontWeight: 600,
                          padding: "7px 11px",
                          borderRadius: 7,
                          width: 100,
                          outline: "none",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "var(--td)" }}>
                        /mo · edit if you disagree
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mb18">
                <div className="row jb ic mb14">
                  <div className="clbl">
                    RENT COMPS — HOW WE ARRIVED AT {fmtMoney(f.monthlyRent)}
                  </div>
                  <span style={{ fontSize: 12, color: "var(--dt)" }}>
                    {intel.rentComps.length} nearby rentals · last 90 days
                  </span>
                </div>
                <div className="col gap7">
                  {intel.rentComps.map((c) => (
                    <div key={c.address} className="comprow">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ti)" }}>
                          {c.address}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--td)" }}>{c.details}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="serif" style={{ fontSize: 19, fontWeight: 700, color: "var(--g)" }}>
                          {fmtMoney(c.rent)}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--td)" }}>
                          rented {c.daysAgo} days ago
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="clbl mb14">TWO MORE QUESTIONS</div>
                <div className="g2 gap20">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--dk)", marginBottom: 3 }}>
                      What&apos;s your FICO range?
                    </div>
                    <p style={{ fontSize: 12, color: "var(--dt)", marginBottom: 11 }}>
                      No hard pull — self-reported only
                    </p>
                    <input
                      type="range"
                      min={600}
                      max={840}
                      value={f.fico}
                      className="rng"
                      onChange={(e) => f.setFico(Number(e.target.value))}
                    />
                    <div className="row jb mt4">
                      <span style={{ fontSize: 11, color: "var(--dt)" }}>600</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--fr)" }}>
                        {f.fico}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--dt)" }}>840+</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--dk)", marginBottom: 3 }}>
                      Who is the borrower?
                    </div>
                    <p style={{ fontSize: 12, color: "var(--dt)", marginBottom: 11 }}>
                      Determines entity docs required
                    </p>
                    <div className="col gap7">
                      <BorrowerOption
                        label="LLC / entity"
                        selected={f.borrowerType === "llc"}
                        recommended
                        onClick={() => f.setBorrowerType("llc")}
                      />
                      <div className="row gap7">
                        <BorrowerOption
                          label="Individual"
                          selected={f.borrowerType === "individual"}
                          onClick={() => f.setBorrowerType("individual")}
                          flex
                        />
                        <BorrowerOption
                          label="Foreign"
                          selected={f.borrowerType === "foreign"}
                          onClick={() => f.setBorrowerType("foreign")}
                          flex
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </FlowChrome>
        </div>
      )}

      {/* S4 Calculator */}
      {intel && ts && (
        <div className={`screen flowbg${f.screen === 4 ? " active" : ""}`}>
          <FlowChrome f={f}>
          <div className="row jb ic mb12">
            <span style={{ fontSize: 12, color: "var(--flow-muted)" }}>{shortAddr}</span>
            <button type="button" className="btn g sm" onClick={() => { f.downloadPdf(); f.goTo(5); }}>
              Download term sheet →
            </button>
          </div>
          <div className="flow-csplit">
            <div className="flow-cleft">
              <div className="lgsec muted mb8">STEP 4 OF 8</div>
              <div className="serif" style={{ fontSize: 24, fontWeight: 700, color: "var(--dk)", marginBottom: 3 }}>
                Structure your DSCR loan.
              </div>
              <p style={{ fontSize: 13, color: "var(--dt)", marginBottom: 24 }}>
                Adjust the levers — the term sheet updates live.
              </p>
              <div className="clbl mb7">LOAN PURPOSE</div>
              <div className="toggrp">
                <TogglePill label="Purchase" active={f.purpose === "purchase"} onClick={() => f.setPurpose("purchase")} />
                <TogglePill label="Cash-out refi" active={f.purpose === "cashout"} onClick={() => f.setPurpose("cashout")} />
                <TogglePill label="Bridge → DSCR" active={f.purpose === "bridge"} onClick={() => f.setPurpose("bridge")} />
              </div>
              <div className="clbl mb7">PURCHASE PRICE</div>
              <input
                className="cinpf"
                type="text"
                value={fmtMoney(f.purchasePrice)}
                onChange={(e) => {
                  const n = Number(e.target.value.replace(/[^0-9]/g, ""));
                  if (n) f.setPurchasePrice(n);
                }}
              />
              <div className="row jb ic mb7">
                <div className="clbl">DOWN PAYMENT</div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--fr)" }}>
                  {f.downPaymentPct}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={40}
                step={5}
                value={f.downPaymentPct}
                className="rng"
                onChange={(e) => f.setDownPaymentPct(Number(e.target.value))}
              />
              <div className="rlbls">
                <span>20%</span>
                <span>25%</span>
                <span>30%</span>
                <span>35%</span>
                <span>40%</span>
              </div>
              <div className="clbl mb7">LOAN TERM</div>
              <div className="toggrp">
                <TogglePill label="30yr Fixed" active={f.loanTerm === "30yr"} onClick={() => f.setLoanTerm("30yr")} />
                <TogglePill label="5/1 ARM" active={f.loanTerm === "5/1"} onClick={() => f.setLoanTerm("5/1")} />
                <TogglePill label="7/1 ARM" active={f.loanTerm === "7/1"} onClick={() => f.setLoanTerm("7/1")} />
              </div>
              <div className="row jb ic mb7">
                <div className="clbl">PREPAY PENALTY</div>
                <span style={{ fontSize: 11, color: "var(--g)", fontWeight: 600 }}>
                  Longer = lower rate
                </span>
              </div>
              <div className="toggrp">
                <TogglePill label="None" active={f.prepay === "none"} onClick={() => f.setPrepay("none")} />
                <TogglePill label="3 year" active={f.prepay === "3yr"} onClick={() => f.setPrepay("3yr")} />
                <TogglePill label="5 year" active={f.prepay === "5yr"} onClick={() => f.setPrepay("5yr")} />
              </div>
              <div className="iotog">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--dk)" }}>
                    Interest only period
                  </div>
                  <div style={{ fontSize: 11, color: "var(--dt)" }}>
                    Lower initial payment, improves DSCR
                  </div>
                </div>
                <div
                  className="iobg"
                  onClick={() => f.setInterestOnly(!f.interestOnly)}
                  style={{ background: f.interestOnly ? "var(--g)" : "var(--brl)" }}
                >
                  <div className="ioth" style={{ left: f.interestOnly ? 23 : 3 }} />
                </div>
              </div>
              <button type="button" className="advbtn" onClick={() => f.setAdvOpen(!f.advOpen)}>
                <span>{f.advOpen ? "▼" : "▶"}</span> Advanced structuring
              </button>
              <div className={`advp${f.advOpen ? " open" : ""}`}>
                <div className="card" style={{ background: "var(--cr2)", marginTop: 11 }}>
                  <div className="col gap10">
                    {[
                      ["No-Ratio DSCR", "For properties where rent does not cover 1.0x"],
                      ["Asset depletion qualifier", "Use liquid assets to supplement DSCR"],
                      ["Short-term rental (STR)", "AirDNA or self-reported STR income"],
                    ].map(([title, sub]) => (
                      <label key={title} className="row ic gap9" style={{ cursor: "pointer", fontSize: 13 }}>
                        <input type="checkbox" style={{ accentColor: "var(--f)" }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{title}</div>
                          <div style={{ fontSize: 11, color: "var(--dt)" }}>{sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flow-cright">
              <div className="lgsec" style={{ color: "var(--g)", marginBottom: 7 }}>
                LIVE TERM SHEET
              </div>
              <div style={{ fontSize: 12, color: "var(--td)", marginBottom: 22 }}>
                Updates as you adjust · {shortAddr}
              </div>
              <div className="tsbig3">
                <div className="tsb">
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--td)", marginBottom: 5 }}>
                    INTEREST RATE
                  </div>
                  <div className="tsbig">{ts.rate.toFixed(2)}%</div>
                  <div style={{ fontSize: 10, color: "var(--td)", marginTop: 3 }}>{ts.termLabel}</div>
                </div>
                <div className="tsb">
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--td)", marginBottom: 5 }}>
                    CASH TO CLOSE
                  </div>
                  <div className="tsbig wh">{fmtMoney(ts.cashToClose)}</div>
                  <div style={{ fontSize: 10, color: "var(--td)", marginTop: 3 }}>incl. points + fees</div>
                </div>
                <div className="tsb">
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--td)", marginBottom: 5 }}>
                    DSCR RATIO
                  </div>
                  <div className="tsbig">{ts.dscr}x</div>
                  <div className="dscrbar mt8">
                    <div
                      className={`dscrfill${ts.dscr < 1 ? " rd" : ts.dscr < 1.25 ? " am" : ""}`}
                      style={{ width: `${f.dscrPct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 22 }}>
                {[
                  ["Loan amount", fmtMoney(ts.loanAmount)],
                  ["LTV", `${ts.ltv}%`],
                  ["Monthly PITIA", fmtMoney(ts.monthlyPitia)],
                  ["Est. monthly rent", fmtMoney(f.monthlyRent)],
                  ["Origination", `1.25 pts · ${fmtMoney(ts.originationFee)}`],
                  ["Appraisal (est.)", "$650"],
                  ["Title fees (GA)", "$1,840"],
                  ["Reserves required", `6 mo · ${fmtMoney(ts.reserves)}`],
                ].map(([k, v]) => (
                  <div key={k} className="tsrow">
                    <span className="tsl2">{k}</span>
                    <span className="tsv">{v}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "rgba(46,204,113,.1)",
                  border: "1px solid rgba(46,204,113,.2)",
                  borderRadius: 9,
                  padding: "11px 13px",
                  marginBottom: 18,
                }}
              >
                <div className="row ic gap8">
                  <span style={{ color: "var(--gh)", fontSize: 15 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0f0e0c" }}>
                      {ts.qualifies
                        ? `DSCR qualifies at ${ts.dscr}x`
                        : "DSCR below 1.0 — No-Ratio option available"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      Property cash flow covers the loan. No income docs needed.
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" className="btn g fw mt12" style={{ fontSize: 14 }} onClick={() => { f.downloadPdf(); f.goTo(5); }}>
                Download term sheet PDF →
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "var(--td)", marginTop: 7 }}>
                Indicative only · Subject to appraisal and underwriting
              </p>
            </div>
          </div>
          </FlowChrome>
        </div>
      )}

      {/* S5 Term Sheet */}
      {intel && ts && (
        <div className={`screen flowbg${f.screen === 5 ? " active" : ""}`}>
          <FlowChrome f={f}>
          <div className="flow-main-scroll">
            <div className="flow-content-inner pgsm" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
              <div className="row jb ic mb16">
                <div className="badge gn">
                  <span className="bdot" />
                  Term sheet ready · No email gate
                </div>
                <button type="button" className="btn g sm" onClick={() => f.goTo(6)}>
                  Get pre-qualified →
                </button>
              </div>
              <div className="lgsec muted mb12">STEP 5 OF 8 · TERM SHEET</div>
              <h2 className="h2 dk mb8">Your indicative term sheet.</h2>
              <p style={{ fontSize: 16, color: "var(--dm)", lineHeight: 1.7, marginBottom: 28 }}>
                Download it, send it to your seller or partner. 60 seconds to a real term
                sheet — this is the promise.
              </p>
              <div className="flow-pdf-chrome mb28">
                <div className="flow-pdf-bar">
                  <div className="bdts">
                    <div className="bdt" style={{ background: "#FF5F57" }} />
                    <div className="bdt" style={{ background: "#FFBD2E" }} />
                    <div className="bdt" style={{ background: "#28CA41" }} />
                  </div>
                  <div className="burl">{termSheetFilename(f.deal!.formattedAddress)}</div>
                </div>
                <div className="flow-pdf-body">
                  <div className="row jb ic mb22">
                    <div className="row ic gap7">
                      <span className="dot" />
                      <span className="serif" style={{ fontSize: 17, fontWeight: 700 }}>
                        vestednest
                      </span>
                    </div>
                    <div className="flow-badge">INDICATIVE TERM SHEET</div>
                  </div>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 700, marginBottom: 3 }}>
                    {f.deal!.formattedAddress}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--td)", marginBottom: 24 }}>
                    DSCR Purchase Loan · Generated June 2026
                  </div>
                  <div className="g3 mb22" style={{ gap: 12 }}>
                    {[
                      ["Interest rate", `${ts.rate.toFixed(2)}%`, true],
                      ["DSCR ratio", `${ts.dscr}x`, false],
                      ["Monthly PITIA", fmtMoney(ts.monthlyPitia), false],
                    ].map(([label, val, green]) => (
                      <div
                        key={label as string}
                        style={{ background: "rgba(255,255,255,.07)", borderRadius: 9, padding: 14 }}
                      >
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--td)", marginBottom: 3 }}>
                          {label}
                        </div>
                        <div
                          className="serif"
                          style={{
                            fontSize: 30,
                            fontWeight: 700,
                            color: green ? "var(--g)" : "var(--w)",
                          }}
                        >
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0 36px",
                      borderTop: "1px solid rgba(255,255,255,.1)",
                      paddingTop: 14,
                    }}
                  >
                    {[
                      ["Loan amount", fmtMoney(ts.loanAmount)],
                      ["LTV", `${ts.ltv}%`],
                      ["Term", ts.termLabel],
                      ["Origination", "1.25 pts"],
                      ["Est. monthly rent", fmtMoney(f.monthlyRent)],
                      ["Cash to close", fmtMoney(ts.cashToClose)],
                      ["Prepay penalty", ts.prepayLabel],
                      ["Borrower type", borrowerLabel(f.borrowerType)],
                    ].map(([k, v]) => (
                      <div key={k} className="tsrow">
                        <span style={{ color: "var(--td)" }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ border: "2px solid var(--f)" }}>
                <div className="g2" style={{ gap: 0, alignItems: "stretch" }}>
                  <div style={{ paddingRight: 28, borderRight: "1px solid var(--brl)" }}>
                    <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--dk)", marginBottom: 7 }}>
                      Get pre-qualified.
                    </div>
                    <p style={{ fontSize: 13, color: "var(--dt)", marginBottom: 18 }}>
                      Light docs. Soft pull only. Appraisal and underwriting run in parallel.
                    </p>
                    <button type="button" className="btn g fw mb7" style={{ justifyContent: "center" }} onClick={() => f.goTo(6)}>
                      Get pre-qualified →{" "}
                      <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 3 }}>No credit impact</span>
                    </button>
                  </div>
                  <div style={{ paddingLeft: 28 }}>
                    <div className="serif" style={{ fontSize: 20, fontWeight: 700, color: "var(--dk)", marginBottom: 7 }}>
                      Save for later.
                    </div>
                    <p style={{ fontSize: 13, color: "var(--dt)", marginBottom: 18 }}>
                      We&apos;ll email this term sheet so you can share or come back when ready.
                    </p>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={f.emailInput}
                      onChange={(e) => f.setEmailInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "11px 13px",
                        border: "1.5px solid var(--brl)",
                        borderRadius: 9,
                        fontSize: 13,
                        outline: "none",
                        color: "var(--dk)",
                        marginBottom: 11,
                      }}
                    />
                    <button type="button" className="btn old fw" style={{ justifyContent: "center" }} onClick={() => f.emailTermSheet()}>
                      Email me this term sheet
                    </button>
                    {f.emailStatus ? (
                      <p style={{ fontSize: 11, color: "var(--dt)", marginTop: 8, textAlign: "center" }}>{f.emailStatus}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </FlowChrome>
        </div>
      )}

      {/* S6 Pre-Qualify */}
      <div className={`screen flowbg${f.screen === 6 ? " active" : ""}`}>
        <FlowChrome f={f}>
        <div className="flow-main-scroll">
          <div className="flow-content-inner pgsm" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
            <div className="row jb ic mb16">
              <div className="badge gn">
                <span className="bdot" />
                Pre-qualification · Soft pull only
              </div>
              <button type="button" className="btn g sm" onClick={() => f.submitPrequal()} disabled={f.submitting}>
                {f.submitting ? "Submitting…" : "Submit →"}
              </button>
            </div>
            <div className="lgsec muted mb12">STEP 6 OF 8 · PRE-QUALIFICATION</div>
            <h2 className="h2 dk mb8">Submit & lock your deal.</h2>
            <p style={{ fontSize: 16, color: "var(--dm)", lineHeight: 1.7, marginBottom: 28 }}>
              Light docs only. No tax returns. No employment verification. Appraisal and
              underwriting run in parallel.
            </p>
            <div className="g2 mb24" style={{ alignItems: "start", gap: 22 }}>
              <div className="col gap11">
                <div className="lgsec muted mb4">WHAT WE NEED FROM YOU</div>
                {[
                  ["01", "Entity docs", "LLC operating agreement or trust docs", "lv", "Ready", false],
                  ["02", "3 months bank statements", "Shows reserves. No income verification.", "lv", "Ready", false],
                  ["03", "Insurance binder", "Landlord / DP3 policy. We can refer you.", "pd", "We'll arrange", true],
                  ["04", "Purchase agreement", "Optional at this stage.", "pd", "If available", true],
                ].map(([num, title, sub, spill, status, dim]) => (
                  <div key={num as string} className="dcard" style={{ opacity: dim ? 0.7 : 1 }}>
                    <div className={`dnum${dim ? " dim" : ""}`}>{num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--dk)" }}>{title}</div>
                      <div style={{ fontSize: 11, color: "var(--dt)" }}>{sub}</div>
                    </div>
                    <div className={`spill ${spill}`}>{status}</div>
                  </div>
                ))}
              </div>
              <div className="col gap11">
                <div className="lgsec muted mb4">WHAT HAPPENS NEXT</div>
                <div className="cdk" style={{ padding: 20 }}>
                  {[
                    ["dn", "✓", "Today — Soft pull & review", "We run credit, review docs, assign your underwriter"],
                    ["ac", "D1", "Days 1–3 — Appraisal ordered", "Bridge appraisal reused where allowed."],
                    ["dm", "D7", "Days 1–7 — Underwriting in parallel", "Not sequential. We don't wait for the appraisal."],
                    ["dm", "14", "Day 14 — Close", "Wire instructions issued. Median close is 14 days."],
                  ].map(([cls, badge, title, sub], i, arr) => (
                    <div key={title as string} className="tstep" style={i === arr.length - 1 ? { borderBottom: "none" } : undefined}>
                      <div className={`tsc ${cls}`}>{badge}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: cls === "dm" ? "rgba(255,255,255,.6)" : "var(--w)" }}>{title}</div>
                        <div style={{ fontSize: 11, color: "var(--td)", marginTop: 2 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ border: "2px solid var(--f)" }}>
                  <div className="serif" style={{ fontSize: 19, fontWeight: 700, color: "var(--dk)", marginBottom: 7 }}>
                    Ready to submit?
                  </div>
                  <p style={{ fontSize: 12, color: "var(--dt)", marginBottom: 14 }}>
                    Clicking below authorizes a <strong>soft credit pull only</strong>. No hard
                    inquiry until formal application.
                  </p>
                  <button type="button" className="btn g fw mb7" style={{ justifyContent: "center", padding: 15 }} onClick={() => f.submitPrequal()} disabled={f.submitting}>
                    {f.submitting ? "Submitting…" : "Submit for pre-qualification"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </FlowChrome>
      </div>

      {/* S7 Close Tracker */}
      <div className={`screen flowbg${f.screen === 7 ? " active" : ""}`}>
        <FlowChrome f={f}>
        <div className="flow-main-scroll">
          <div className="flow-content-inner pgsm" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0 }}>
            <div className="row jb ic mb16">
              <div className="badge gn">
                <span className="bdot" />
                Submitted · Under review
              </div>
              {f.loanId ? (
                <span style={{ fontSize: 12, color: "var(--flow-muted)" }}>Loan #{f.loanId}</span>
              ) : null}
            </div>
            <div className="lgsec muted mb12">STEP 7 OF 8 · CLOSE TRACKER</div>
            <div className="row jb ic mb8">
              <div>
                <h2 className="h2 dk mb4">You&apos;re on the clock.</h2>
                <p style={{ fontSize: 15, color: "var(--dm)" }}>
                  Your underwriter will reach out within 24 hours.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="serif" style={{ fontSize: 60, fontWeight: 800, color: "var(--f)", lineHeight: 1 }}>
                  {f.closeTracker?.daysToClose ?? 14}
                </div>
                <div className="lgsec muted">DAYS TO CLOSE</div>
              </div>
            </div>
            {intel && ts && (
              <div className="card mb18" style={{ border: "2px solid var(--f)", padding: 24 }}>
                <div className="serif" style={{ fontSize: 17, fontWeight: 700, color: "var(--dk)", marginBottom: 3 }}>
                  {intel.addressLine} — Close Tracker
                </div>
                <div style={{ fontSize: 12, color: "var(--dt)", marginBottom: 24 }}>
                  {intel.city} {intel.state} · DSCR Purchase · {fmtMoney(ts.loanAmount)} @ {ts.rate.toFixed(2)}%
                </div>
                {(f.closeTracker?.steps ?? [
                  { label: "Submitted", pct: 100, status: "Done ✓" },
                  { label: "Appraisal", pct: 30, status: "Day 1–3" },
                  { label: "Underwriting", pct: 15, status: "Parallel" },
                  { label: "Clear to close", pct: 0, status: "Day 10–12" },
                  { label: "Wire + Close", pct: 0, status: "Day 14" },
                ]).map((step, i, arr) => {
                  const color = step.pct === 100 ? "g" : step.pct > 0 ? "am" : "g";
                  return (
                  <div key={step.label} className="tkrow" style={i === arr.length - 1 ? { marginBottom: 0 } : undefined}>
                    <div className="tklbl" style={i === arr.length - 1 ? { color: "var(--f)", fontWeight: 700 } : undefined}>
                      {step.label}
                    </div>
                    <div className="tkbar">
                      <div className={`tkfill ${color}`} style={{ width: `${step.pct}%` }} />
                    </div>
                    <div style={{ width: 80 }}>
                      <div className={`spill ${step.pct === 100 ? "lv" : "pd"}`} style={step.pct === 0 && i > 1 ? { opacity: 0.4 } : undefined}>
                        {step.status}
                      </div>
                    </div>
                  </div>
                );})}
                <div className="uwcard mt20">
                  <div className="uwav">{f.closeTracker?.loanOfficer?.avatar_initials ?? "MR"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--dk)" }}>{f.closeTracker?.loanOfficer?.name ?? "Marcus Rodriguez"}</div>
                    <div style={{ fontSize: 12, color: "var(--dt)" }}>
                      {f.closeTracker?.loanOfficer?.title ?? "Your dedicated underwriter"} · Vested Nest
                    </div>
                  </div>
                  <div className="row gap7">
                    {f.closeTracker?.twilioEnabled && f.closeTracker?.loanOfficer?.phone ? (
                      <button type="button" className="btn old sm" onClick={() => f.initiateCall()}>📞 Call</button>
                    ) : (
                      <button type="button" className="btn old sm" disabled title="Configure Twilio to enable calls">📞 Call</button>
                    )}
                    <a href={`mailto:${f.closeTracker?.loanOfficer?.email ?? "marcus@vestednest.com"}`} className="btn old sm">✉ Email</a>
                  </div>
                </div>
              </div>
            )}
            <div className="flow-close-cta">
              <h3>
                Drop the address.
                <br />
                <em>We&apos;ll do the rest.</em>
              </h3>
              <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 26, maxWidth: 420, margin: "0 auto 26px" }}>
                Sixty seconds to a real indicative term sheet. Fourteen days to a closed loan.
              </p>
              <button type="button" className="landing-final-cta-btn" onClick={f.resetFlow}>
                Start a new deal →
              </button>
            </div>
          </div>
        </div>
        </FlowChrome>
      </div>
      </>
      ) : null}
    </>
  );
}
