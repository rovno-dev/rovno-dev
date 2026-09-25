"use client";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchTags, type Tag } from "@/utils/api/tags";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  /** Filters the suggestion pool — "tag" | "category" | "brand". */
  kind?: "tag" | "category" | "brand";
}

/**
 * Autocomplete chip input.
 *
 * Behavior:
 *   - On focus, shows the most-used tags that aren't already selected.
 *   - Typing filters; the first arrow-down/up navigates the list.
 *   - Enter or comma commits the highlighted suggestion (or, if none is
 *     highlighted, the raw draft text — creating a new tag).
 *   - Space also commits, so `foo bar<Space>` becomes a `foo bar` chip.
 *   - Backspace on an empty input removes the last chip.
 *   - Blur commits whatever's in the draft, so nothing gets lost.
 *
 * Existing suggestions are case-preserved — typing "Design" when "design"
 * already exists picks the existing casing so the DB stays canonical.
 */
export function TagsAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  maxTags = 20,
  kind = "tag",
}: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTags(undefined, 300, kind)
      .then((tags) => { if (!cancelled) setAllTags(tags); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [kind]);

  const selectedLower = useMemo(
    () => new Set(value.map((v) => v.toLowerCase())),
    [value]
  );

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const pool = allTags.filter((t) => !selectedLower.has(t.name.toLowerCase()));
    if (!q) return pool.slice(0, 8);
    return pool.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [allTags, draft, selectedLower]);

  const exactMatch = useMemo(
    () => allTags.find((t) => t.name.toLowerCase() === draft.trim().toLowerCase()),
    [allTags, draft]
  );

  const canCreate =
    draft.trim().length > 0 &&
    !exactMatch &&
    !selectedLower.has(draft.trim().toLowerCase()) &&
    value.length < maxTags;

  const optionsCount = suggestions.length + (canCreate ? 1 : 0);

  useEffect(() => { setHighlight(0); }, [draft, open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const addTag = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    if (value.length >= maxTags) return;
    const key = name.toLowerCase();
    if (selectedLower.has(key)) { setDraft(""); setOpen(false); return; }
    // Preserve existing casing if a matching tag already exists.
    const canonical = exactMatch?.name ?? name;
    onChange([...value, canonical]);
    setDraft("");
    setOpen(false);
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(0, optionsCount - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (open && optionsCount > 0) {
        const idx = Math.min(highlight, optionsCount - 1);
        if (idx < suggestions.length) addTag(suggestions[idx].name);
        else addTag(draft);
      } else {
        addTag(draft);
      }
    } else if (e.key === " " && draft.trim()) {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 text-sm transition-colors cursor-text",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          "hover:border-(--primary-card)",
          className
        )}
        onClick={() => { inputRef.current?.focus(); setOpen(true); }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-(--primary-card) px-2 py-0.5 text-xs font-medium text-(--primary)"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="hover:opacity-70"
              aria-label={`Удалить тег ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => { if (draft.trim()) addTag(draft); }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[8ch] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="size-3.5 shrink-0 animate-spin text-(--on-bg-low)" />}
      </div>

      {open && (suggestions.length > 0 || canCreate) && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-(--outline) bg-(--card) shadow-lg p-1">
          {suggestions.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(t.name)}
              onMouseEnter={() => setHighlight(idx)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                idx === highlight ? "bg-(--state-hover) text-(--on-bg-high)" : "text-(--on-bg-medium)"
              )}
            >
              <span className="truncate">{t.name}</span>
              {t.usage_count > 0 && (
                <span className="text-[11px] text-(--on-bg-low) tabular-nums">{t.usage_count}</span>
              )}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addTag(draft)}
              onMouseEnter={() => setHighlight(suggestions.length)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                suggestions.length === highlight ? "bg-(--state-hover) text-(--on-bg-high)" : "text-(--on-bg-medium)"
              )}
            >
              <Plus className="size-3.5" />
              <span>Создать «{draft.trim()}»</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
