"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  PlusIcon, XIcon, MagnifyingGlassIcon, CircleNotchIcon, CheckIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface PickerItem {
  id: string;
  label: string;
  /** Small text shown right of the label (e.g. usage count, industry). */
  meta?: string | null;
}

interface Props {
  value: PickerItem | null;
  onChange: (next: PickerItem | null) => void;
  items: PickerItem[];
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
  /** Human label for the "create new" action ("Создать категорию «X»"). */
  createNoun?: string;
  /** If provided, an unmatched draft can be persisted. Returns the new item. */
  onCreate?: (name: string) => Promise<PickerItem>;
  disabled?: boolean;
  className?: string;
}

/**
 * Single-value chip picker. Behaves like a GitHub label selector:
 *
 * - Shows the selected value as a chip with an X to clear.
 * - Click to open a searchable list of suggestions.
 * - Typing filters; Enter picks the highlighted item.
 * - If nothing matches and `onCreate` is provided, a "create new" entry
 *   appears at the bottom; clicking it calls `onCreate` and selects the
 *   result.
 */
export function EntityPicker({
  value,
  onChange,
  items,
  loading = false,
  placeholder = "Выбрать…",
  emptyText = "Ничего не найдено",
  createNoun,
  onCreate,
  disabled = false,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [creating, setCreating] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out the currently selected item so it doesn't appear as a choice.
  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const pool = items.filter((i) => i.id !== value?.id);
    if (!q) return pool.slice(0, 10);
    return pool.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 10);
  }, [items, draft, value]);

  const exactMatch = useMemo(
    () =>
      items.find((i) => i.label.toLowerCase() === draft.trim().toLowerCase()),
    [items, draft]
  );

  const canCreate =
    !!onCreate &&
    draft.trim().length > 0 &&
    !exactMatch &&
    !creating;

  const optionCount = filtered.length + (canCreate ? 1 : 0);

  useEffect(() => {
    setHighlight(0);
  }, [draft, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setDraft("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (item: PickerItem) => {
    onChange(item);
    setOpen(false);
    setDraft("");
  };

  const handleCreate = async () => {
    if (!onCreate) return;
    const name = draft.trim();
    if (!name) return;
    setCreating(true);
    try {
      const item = await onCreate(name);
      pick(item);
    } finally {
      setCreating(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(0, optionCount - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const idx = Math.min(highlight, Math.max(0, optionCount - 1));
      if (idx < filtered.length) pick(filtered[idx]);
      else if (canCreate) handleCreate();
    } else if (e.key === "Escape") {
      setOpen(false);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && value) {
      onChange(null);
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 text-sm transition-colors cursor-text",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          "hover:border-(--primary-card)",
          disabled && "opacity-50 pointer-events-none"
        )}
        onClick={() => {
          inputRef.current?.focus();
          setOpen(true);
        }}
      >
        {value ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-(--primary-card) px-2 py-0.5 text-xs font-medium text-(--primary)">
            {value.label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              aria-label={`Очистить ${value.label}`}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ) : (
          <MagnifyingGlassIcon className="size-3.5 text-(--on-bg-low) shrink-0 ml-0.5" />
        )}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
          placeholder={value ? "" : placeholder}
          disabled={disabled}
          className="min-w-[8ch] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {loading && <CircleNotchIcon className="size-3.5 shrink-0 animate-spin text-(--on-bg-low)" />}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-(--outline) bg-(--card) shadow-lg p-1">
          {filtered.length === 0 && !canCreate && (
            <p className="px-3 py-3 text-center text-body-5 text-(--on-bg-low)">
              {emptyText}
            </p>
          )}

          {filtered.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(item)}
              onMouseEnter={() => setHighlight(idx)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                idx === highlight
                  ? "bg-(--state-hover) text-(--on-bg-high)"
                  : "text-(--on-bg-medium)"
              )}
            >
              <span className="truncate">{item.label}</span>
              {item.meta && (
                <span className="text-[11px] text-(--on-bg-low) tabular-nums shrink-0">
                  {item.meta}
                </span>
              )}
            </button>
          ))}

          {canCreate && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              onMouseEnter={() => setHighlight(filtered.length)}
              disabled={creating}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                filtered.length === highlight
                  ? "bg-(--state-hover) text-(--on-bg-high)"
                  : "text-(--on-bg-medium)"
              )}
            >
              {creating ? (
                <CircleNotchIcon className="size-3.5 animate-spin" />
              ) : (
                <PlusIcon className="size-3.5" />
              )}
              <span>
                {createNoun || "Создать"} «{draft.trim()}»
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
