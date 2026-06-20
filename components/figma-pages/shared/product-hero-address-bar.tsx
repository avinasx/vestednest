"use client";

import { MicIcon } from "@/components/flow/icons";
import { AddressAutocomplete } from "@/components/vestednest/address-autocomplete";
import { navigateToNestChat } from "@/lib/nest-chat-launch";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STARS = "/landing/icon-stars.svg";
const TICK = "/landing/icon-tick-soft.svg";

type Variant = "dscr" | "bridge" | "cor" | "fnl" | "rental";

const PREFIX: Record<Variant, string> = {
  dscr: "dscr",
  bridge: "bl",
  cor: "cor",
  fnl: "fnl",
  rental: "rl",
};

function SendIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden width={20} height={20}>
      <path
        d="M3.5 10h13m0 0-5-5m5 5-5 5"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden width={16} height={16}>
      <path
        d="m5 7.5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TabChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className} width={20} height={20}>
      <path d="m12.5 5-5 5 5 5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ProductHeroAddressBarProps = {
  variant: Variant;
  tabLabel?: string;
  loanTypeLabel: string;
  placeholder: string;
};

export function ProductHeroAddressBar({
  variant,
  tabLabel,
  loanTypeLabel,
  placeholder,
}: ProductHeroAddressBarProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [stateCode, setStateCode] = useState("GA");
  const prefix = PREFIX[variant];
  const tabAbove = Boolean(tabLabel);

  const submit = () => {
    navigateToNestChat(router.push, {
      message: value.trim() || undefined,
      state: stateCode,
      loanType: loanTypeLabel,
    });
  };

  const topRow = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={STARS} alt="" aria-hidden width={26} height={26} className={`${prefix}-address-stars`} />
      <span className={`${prefix}-address-sep`} aria-hidden />
      <AddressAutocomplete
        compact
        plainInput
        value={value}
        stateCode={stateCode}
        onValueChange={setValue}
        onStateChange={setStateCode}
        onSelect={(suggestion) => {
          setValue(suggestion.label);
          if (suggestion.state) setStateCode(suggestion.state);
        }}
        placeholder={placeholder}
        inputClassName={`${prefix}-address-input landing-aibar-input`}
        onSubmit={submit}
      />
      <div className={`${prefix}-address-actions`}>
        <button type="button" className={`${prefix}-address-mic`} aria-label="Voice input">
          <MicIcon />
        </button>
        <button type="button" className={`${prefix}-address-send`} onClick={submit} aria-label="Send">
          <SendIcon />
        </button>
      </div>
    </>
  );

  const footRow = (
    <>
      <span className={`${prefix}-address-loan-type`}>
        {loanTypeLabel}
        <ChevronDownIcon />
      </span>
      <div className={`${prefix}-address-checks`}>
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TICK} alt="" aria-hidden />
          No hard pull
        </span>
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TICK} alt="" aria-hidden />
          No W2
        </span>
        <span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TICK} alt="" aria-hidden />
          No DTI
        </span>
      </div>
      <span className={`${prefix}-address-ai`}>
        AI Mode
        <span className={`${prefix}-ai-toggle`} aria-hidden>
          <span className={`${prefix}-ai-toggle-dot`} />
        </span>
      </span>
    </>
  );

  const bar = (
    <div className={`${prefix}-address-bar`}>
      <div className={`${prefix}-address-top`}>{topRow}</div>
      <div className={`${prefix}-address-foot`}>{footRow}</div>
    </div>
  );

  if (tabAbove && tabLabel) {
    return (
      <div className={`${prefix}-address-shell ${prefix}-address-shell--tabbed`}>
        <button type="button" className={`${prefix}-address-tab`} onClick={submit}>
          <TabChevron className={`${prefix}-address-tab-arrow ${prefix}-address-tab-arrow--left`} />
          {tabLabel}
          <TabChevron className={`${prefix}-address-tab-arrow ${prefix}-address-tab-arrow--right`} />
        </button>
        {bar}
      </div>
    );
  }

  return <div className={`${prefix}-address-shell`}>{bar}</div>;
}
