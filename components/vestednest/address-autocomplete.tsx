"use client";

import { isLikelyAddressQuery } from "@/lib/chat-intent";
import type { AddressSuggestion } from "@/lib/realie";
import { US_STATES } from "@/lib/us-states";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type { AddressSuggestion };

type AddressAutocompleteProps = {
  value: string;
  stateCode: string;
  onValueChange: (value: string) => void;
  onStateChange: (stateCode: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  disabled?: boolean;
  compact?: boolean;
  placeholder?: string;
  inputClassName?: string;
  onSubmit?: () => void;
  /** When true, only hit the address API if input looks like a street address. */
  addressSearchOnly?: boolean;
  /** Plain text input — no suggest API calls or dropdown (chips handle disambiguation in chat). */
  plainInput?: boolean;
};

export function AddressAutocomplete({
  value,
  stateCode,
  onValueChange,
  onStateChange,
  onSelect,
  disabled = false,
  compact = false,
  placeholder = "Start typing a street address (e.g. 123 Main)",
  inputClassName,
  onSubmit,
  addressSearchOnly = false,
  plainInput = false,
}: AddressAutocompleteProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(
    async (query: string, state: string) => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          state,
        });
        const res = await fetch(`/api/addresses/suggest?${params}`);
        const data = await res.json();

        if (!res.ok) {
          setSuggestions([]);
          if (!addressSearchOnly) {
            setFetchError(
              res.status === 401
                ? "Session expired — refresh the page and sign in again."
                : (data.error ?? "Could not load suggestions"),
            );
          }
          setOpen(false);
          return;
        }

        const list = (data.suggestions ?? []) as AddressSuggestion[];
        setSuggestions(list);
        setOpen(list.length > 0);
        setActiveIndex(-1);
        if (
          !addressSearchOnly &&
          list.length === 0 &&
          query.trim().length >= 2
        ) {
          setFetchError(
            "No matching addresses — type the street number and name, or pick from suggestions.",
          );
        } else if (addressSearchOnly) {
          setFetchError(null);
        }
      } catch {
        setSuggestions([]);
        if (!addressSearchOnly) {
          setFetchError("Could not load suggestions");
        }
        setOpen(false);
      } finally {
        setLoading(false);
      }
    },
    [addressSearchOnly],
  );

  useEffect(() => {
    if (disabled || plainInput) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (addressSearchOnly && !isLikelyAddressQuery(value)) {
      setSuggestions([]);
      setOpen(false);
      setFetchError(null);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(value, stateCode);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, stateCode, disabled, fetchSuggestions, addressSearchOnly, plainInput]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: AddressSuggestion) {
    onSelect(suggestion);
    onValueChange(suggestion.label);
    setOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputEl = (
    <div className="relative">
          <input
            id={compact ? undefined : "property-address"}
            name="address"
            required={!compact}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            disabled={disabled}
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value);
              if (!plainInput) setOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit && activeIndex < 0) {
                e.preventDefault();
                onSubmit();
                return;
              }
              handleKeyDown(e);
            }}
            placeholder={placeholder}
            className={
              inputClassName ??
              "w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-light text-black outline-none focus:border-vn-green focus:ring-1 focus:ring-vn-green disabled:bg-[#f9f9f9]"
            }
          />
          {!plainInput && loading ? (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/40">
              Searching…
            </span>
          ) : null}
          {!plainInput && open && suggestions.length > 0 ? (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg"
            >
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#f3f3f3] ${
                      index === activeIndex ? "bg-[#f3f3f3]" : ""
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <span className="block font-medium text-black">
                      {suggestion.label}
                    </span>
                    {suggestion.city ? (
                      <span className="text-xs text-black/50">
                        {suggestion.city}, {suggestion.state}
                        {suggestion.zip ? ` ${suggestion.zip}` : ""}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
  );

  if (compact) {
    return (
      <div ref={wrapperRef} className="relative flex-1">
        {inputEl}
        {fetchError && !open && !addressSearchOnly ? (
          <p className="absolute left-0 top-full mt-1 text-xs text-red-400">{fetchError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="space-y-3">
      <div>
        <label
          htmlFor="property-address"
          className="mb-2 block text-lg text-black"
        >
          Property address
        </label>
        {inputEl}
        {fetchError ? (
          <p className="mt-1 text-xs text-red-600">{fetchError}</p>
        ) : (
          <p className="mt-1 text-xs text-black/50">
            Type at least 2 characters to search matching properties.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-black">
        <label htmlFor="property-state" className="sr-only">
          State
        </label>
        <select
          id="property-state"
          value={stateCode}
          disabled={disabled}
          onChange={(e) => onStateChange(e.target.value)}
          className="rounded border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-vn-green"
        >
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="rounded border border-black/10 bg-white px-3 py-2">
          🇺🇸 United States
        </span>
      </div>
    </div>
  );
}
