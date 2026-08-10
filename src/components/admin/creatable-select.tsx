"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type CreatableOption = {
  value: string;
  label?: string;
};

type CreatableSelectProps = {
  value: string;
  options: Array<string | CreatableOption>;
  onChange: (value: string) => void;
  /** Called when a brand-new value is committed (Enter / blur / pick create). */
  onCreate?: (value: string) => void;
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
};

function normalizeOptions(options: Array<string | CreatableOption>): CreatableOption[] {
  const seen = new Set<string>();
  const result: CreatableOption[] = [];
  for (const item of options) {
    const value = typeof item === "string" ? item.trim() : item.value.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      value,
      label: typeof item === "string" ? item : item.label ?? item.value,
    });
  }
  return result;
}

/**
 * Combobox: pick from the list or type a custom value.
 * New values are committed on Enter / blur and can be appended to the option list by the parent.
 */
export function CreatableSelect({
  value,
  options,
  onChange,
  onCreate,
  placeholder = "Type or select…",
  allowEmpty = false,
  emptyLabel = "None",
  className,
  disabled,
  id,
  "aria-label": ariaLabel,
}: CreatableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlight, setHighlight] = useState(0);

  const baseOptions = useMemo(() => normalizeOptions(options), [options]);

  const selectedLabel = useMemo(() => {
    const match = baseOptions.find((item) => item.value === value);
    return match?.label ?? value;
  }, [baseOptions, value]);

  useEffect(() => {
    if (!open) setQuery(selectedLabel);
  }, [selectedLabel, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseOptions;
    return baseOptions.filter(
      (item) =>
        item.value.toLowerCase().includes(q) ||
        (item.label ?? "").toLowerCase().includes(q)
    );
  }, [baseOptions, query]);

  const trimmedQuery = query.trim();
  const exactMatch = baseOptions.some(
    (item) => item.value.toLowerCase() === trimmedQuery.toLowerCase()
  );
  const canCreate = trimmedQuery.length > 0 && !exactMatch;

  const menuItems = useMemo(() => {
    const items: Array<{ kind: "empty" | "option" | "create"; value: string; label: string }> =
      [];
    if (allowEmpty) {
      items.push({ kind: "empty", value: "", label: emptyLabel });
    }
    for (const item of filtered) {
      items.push({ kind: "option", value: item.value, label: item.label ?? item.value });
    }
    if (canCreate) {
      items.push({
        kind: "create",
        value: trimmedQuery,
        label: `Add “${trimmedQuery}”`,
      });
    }
    return items;
  }, [allowEmpty, canCreate, emptyLabel, filtered, trimmedQuery]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function commit(next: string, created = false) {
    const trimmed = next.trim();
    onChange(trimmed);
    if (created && trimmed) onCreate?.(trimmed);
    setQuery(
      trimmed
        ? baseOptions.find((item) => item.value === trimmed)?.label ?? trimmed
        : ""
    );
    setOpen(false);
  }

  function commitFromQuery() {
    if (!trimmedQuery) {
      if (allowEmpty) commit("");
      else setQuery(selectedLabel);
      setOpen(false);
      return;
    }
    const match = baseOptions.find(
      (item) => item.value.toLowerCase() === trimmedQuery.toLowerCase()
    );
    if (match) {
      commit(match.value);
      return;
    }
    commit(trimmedQuery, true);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) => Math.min(current + 1, Math.max(menuItems.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = menuItems[highlight];
      if (open && item) {
        commit(item.value, item.kind === "create");
      } else {
        commitFromQuery();
      }
      return;
    }
    if (event.key === "Escape") {
      setQuery(selectedLabel);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative">
        <input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-label={ariaLabel}
          autoComplete="off"
          className={cn(
            "h-11 w-full rounded-xl border border-neutral-200 bg-white py-2 pl-3.5 pr-10 text-sm text-neutral-800 outline-none transition-all duration-200 focus:border-brand-green-600 focus:ring-4 focus:ring-brand-green-100",
            className
          )}
          disabled={disabled}
          id={id}
          onBlur={() => {
            // Delay so option click can fire first
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                commitFromQuery();
              }
            }, 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          value={query}
        />
        <button
          aria-label="Toggle options"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-700"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            setOpen((current) => !current);
            inputRef.current?.focus();
          }}
          type="button"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <ul
          className="absolute z-30 mt-1.5 max-h-56 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
          id={listId}
          role="listbox"
        >
          {menuItems.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-neutral-500">No matches</li>
          ) : (
            menuItems.map((item, index) => (
              <li key={`${item.kind}-${item.value || "empty"}`} role="option">
                <button
                  className={cn(
                    "flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors",
                    index === highlight
                      ? "bg-brand-green-100/70 text-brand-green-900"
                      : "text-neutral-700 hover:bg-neutral-50",
                    item.kind === "create" && "font-medium text-brand-green-700"
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(item.value, item.kind === "create");
                  }}
                  onMouseEnter={() => setHighlight(index)}
                  type="button"
                >
                  {item.kind === "create" ? <Plus className="h-3.5 w-3.5 shrink-0" /> : null}
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
