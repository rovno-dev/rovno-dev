"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Plus, X, MagnifyingGlassIcon, CircleNotchIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FloatingDropdown } from "@/components/ui/floating-dropdown";

export interface MultiPickerItem {
  id: string;
  label: string;
  meta?: string | null;
}

interface Props {
  value: MultiPickerItem[];
  onChange: (next: MultiPickerItem[]) => void;
  items: MultiPickerItem[];
  loading?: boolean;
  placeholder?: string;
  createNoun?: string;
  onCreate?: (name: string) => Promise<MultiPickerItem>;
  maxItems?: number;
  className?: string;
}

export function EntityMultiPicker({
  value, onChange, items, loading = false,
  placeholder = "Добавить…", createNoun, onCreate,
  maxItems = 40, className,
}: Props) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [creating, setCreating] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  const filtered = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const pool = items.filter((i) => !selectedIds.has(i.id));
    if (!q) return pool.slice(0, 8);
    return pool.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 8);
  }, [items, draft, selectedIds]);

  const exactMatch = useMemo(
    () => items.find((i) => i.label.toLowerCase() === draft.trim().toLowerCase()),
    [items, draft],
  );
  const canCreate =
    !!onCreate && draft.trim().length > 0 && !exactMatch && value.length < maxItems;
  const optionCount = filtered.length + (canCreate ? 1 : 0);

  useEffect(() => setHighlight(0), [draft, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (dropdownRef.current?.contains(t)) return;
      setOpen(false);
      setDraft("");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const addItem = (item: MultiPickerItem) => {
    if (selectedIds.has(item.id)) { setDraft(""); return; }
    onChange([...value, item]);
    setDraft("");
  };

  const handleCreate = async () => {
    if (!onCreate || !draft.trim()) return;
    setCreating(true);
    try {
      const item = await onCreate(draft.trim());
      addItem(item);
    } finally {
      setCreating(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault(); setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(0, optionCount - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      const idx = Math.min(highlight, Math.max(0, optionCount - 1));
      if (idx < filtered.length) addItem(filtered[idx]);
      else if (canCreate) handleCreate();
    } else if (e.key === " " && draft.trim()) {
      e.preventDefault();
      const idx = Math.min(highlight, Math.max(0, optionCount - 1));
      if (open && idx < filtered.length) addItem(filtered[idx]);
      else if (canCreate) handleCreate();
      else if (exactMatch) addItem(exactMatch);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    } else if (e.key === "Escape") {
      setOpen(false); setDraft("");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={wrapRef}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 text-sm transition-colors cursor-text",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 hover:border-(--primary-card)",
        )}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        {value.map((v) => (
          <span
            key={v.id}
            className="inline-flex items-center gap-1 rounded-full bg-(--primary-card) px-2 py-0.5 text-xs font-medium text-(--primary)"
          >
            {v.label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(value.filter((x) => x.id !== v.id));
              }}
              aria-label={`Убрать ${v.label}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1.5 flex-1 min-w-[8ch]">
          <MagnifyingGlassIcon className="size-3.5 text-(--on-bg-low) shrink-0" />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
        {loading && <CircleNotchIcon className="size-3.5 shrink-0 animate-spin text-(--on-bg-low)" />}
      </div>

      <FloatingDropdown
        open={open && (filtered.length > 0 || canCreate)}
        anchorRef={wrapRef}
        dropdownRef={(el) => (dropdownRef.current = el)}
        className="z-[100] max-h-64 overflow-auto rounded-lg border border-(--outline) bg-(--card) shadow-xl p-1"
      >
        {filtered.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => addItem(item)}
            onMouseEnter={() => setHighlight(idx)}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
              idx === highlight
                ? "bg-(--state-hover) text-(--on-bg-high)"
                : "text-(--on-bg-medium)",
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
                : "text-(--on-bg-medium)",
            )}
          >
            {creating ? <CircleNotchIcon className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            <span>{createNoun || "Создать"} «{draft.trim()}»</span>
          </button>
        )}
      </FloatingDropdown>
    </div>
  );
}
