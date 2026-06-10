"use client";

/* eslint-disable @next/next/no-img-element */
import { AddressAutocomplete } from "@/components/vestednest/address-autocomplete";
import { MicIcon } from "@/components/flow/icons";

const CHIPS = [
  { text: "Get a DSCR quote", full: "I want to buy a rental property and get a DSCR quote" },
  { text: "Refi out of bridge", full: "I want to refi out of my bridge loan into DSCR" },
  { text: "Cash-out refi", full: "I want to do a cash-out refinance on my rental property" },
  { text: "Check my DSCR", full: "What is my DSCR on 142 Oak Ridge Dr Atlanta GA 30315" },
  { text: "Foreign national", full: "I have a foreign national LLC can I still qualify" },
];

type HeroAiBarProps = {
  heroInput: string;
  heroState: string;
  classicMode: boolean;
  onHeroInputChange: (value: string) => void;
  onHeroStateChange: (state: string) => void;
  onClassicModeChange: (value: boolean) => void;
  onStart: (text?: string) => void;
};

export function HeroAiBar({
  heroInput,
  heroState,
  classicMode,
  onHeroInputChange,
  onHeroStateChange,
  onClassicModeChange,
  onStart,
}: HeroAiBarProps) {
  const submit = () => onStart();

  return (
    <div className="landing-aibar-zone" id="nest-ai-bar">
      <span className="landing-aibar-bird" aria-hidden />
      <button type="button" className="landing-aibar-tab" onClick={submit}>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="m12.5 5-5 5 5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Loan Process
        <svg viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="m7.5 5 5 5-5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="landing-aibar">
        <div className="landing-aibar-shell">
          <div className="landing-aibar-top">
            <img src="/landing/icon-stars.svg" alt="" className="landing-aibar-stars" aria-hidden />
            <span className="landing-aibar-sep" aria-hidden />
            <AddressAutocomplete
              compact
              plainInput
              value={heroInput}
              stateCode={heroState}
              onValueChange={onHeroInputChange}
              onStateChange={onHeroStateChange}
              onSelect={(s) => {
                onHeroInputChange(s.label);
                if (s.state) onHeroStateChange(s.state);
              }}
              placeholder="Drop an address, or ask — e.g. I want to refi out of my bridge loan"
              inputClassName="landing-aibar-input"
              onSubmit={submit}
            />
            <button type="button" className="landing-aibar-mic" aria-label="Voice input">
              <MicIcon />
            </button>
            <button type="button" className="landing-aibar-send" onClick={submit} aria-label="Send">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M3.5 10h13m0 0-5-5m5 5-5 5"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="landing-aibar-foot">
            <button type="button" className="landing-aibar-mode">
              Home loan
              <svg viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="m5 7.5 5 5 5-5" stroke="#24933e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="landing-aibar-checks">
              <span>
                <img src="/landing/icon-tick-soft.svg" alt="" aria-hidden /> No hard pull
              </span>
              <span>
                <img src="/landing/icon-tick-soft.svg" alt="" aria-hidden /> No W2
              </span>
              <span>
                <img src="/landing/icon-tick-soft.svg" alt="" aria-hidden /> No DTI
              </span>
            </div>
            <div className="landing-aibar-toggle-wrap">
              <span>AI Mode</span>
              <label className="relative inline-flex h-[18px] w-[35px] cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={!classicMode}
                  onChange={(e) => onClassicModeChange(!e.target.checked)}
                />
                <span className="absolute inset-0 rounded-full bg-[#cfcfcf] transition peer-checked:bg-[#26943f]" />
                <span className="absolute top-[2.5px] left-[3px] size-[13px] rounded-full bg-white transition peer-checked:left-[19px]" />
              </label>
            </div>
          </div>
        </div>
        <div className="landing-aibar-chips">
          {CHIPS.map((c) => (
            <button
              key={c.text}
              type="button"
              className="landing-aibar-chip"
              onClick={() => onStart(c.full)}
            >
              {c.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
