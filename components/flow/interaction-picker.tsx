"use client";

import type { ChatInteraction, SelectableOption } from "@/lib/chat-interactions/types";
import { ADDRESS_KIND } from "@/lib/chat-interactions/address";
import { ELIGIBILITY_KIND } from "@/lib/chat-interactions/eligibility";
import { RATE_QUOTE_KIND } from "@/lib/chat-interactions/rate-quote";

const KIND_ICONS: Record<string, string> = {
  [ADDRESS_KIND]: "📍",
  [ELIGIBILITY_KIND]: "🗺️",
  [RATE_QUOTE_KIND]: "📊",
  default: "→",
};

type InteractionPickerProps = {
  interaction: Pick<ChatInteraction, "kind" | "status" | "options">;
  disabled?: boolean;
  onSelect: (kind: string, option: SelectableOption) => void;
  /** Visual variant — chat uses dark theme classes */
  variant?: "chat" | "light";
};

export function InteractionPicker({
  interaction,
  disabled = false,
  onSelect,
  variant = "chat",
}: InteractionPickerProps) {
  if (interaction.status !== "needs_selection" || !interaction.options?.length) {
    return null;
  }

  const icon = KIND_ICONS[interaction.kind] ?? KIND_ICONS.default;

  if (variant === "light") {
    return (
      <div className="mt-3 flex flex-col gap-2">
        {interaction.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(interaction.kind, option)}
            className="flex items-start gap-2 rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2.5 text-left text-sm transition hover:border-vn-green hover:bg-white disabled:opacity-50"
          >
            <span aria-hidden>{icon}</span>
            <span>
              <span className="block font-medium text-black">{option.label}</span>
              {option.subtitle ? (
                <span className="text-xs text-black/50">{option.subtitle}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="addrsugs">
      {interaction.options.map((option) => (
        <button
          key={option.id}
          type="button"
          className="addrsug"
          disabled={disabled}
          onClick={() => onSelect(interaction.kind, option)}
        >
          <span className="addrsug-main">
            {icon} {option.label}
          </span>
          {option.subtitle ? (
            <span className="addrsug-sub">{option.subtitle}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
