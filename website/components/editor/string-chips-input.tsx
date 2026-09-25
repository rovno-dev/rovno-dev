"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Freeform string chip input for values that aren't backed by a table —
 * tech stack, tags on a project, etc. Space, Enter, or comma commits.
 * Backspace on empty removes the last chip. Duplicates are dropped.
 */
export function StringChipsInput({
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const parts = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setDraft("");
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "Enter" || e.key === ",") {
      if (draft.trim()) {
        e.preventDefault();
        commit(draft);
      } else if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
      }
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-input bg-transparent px-2 py-1.5 text-sm transition-colors cursor-text",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        "hover:border-(--primary-card)",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-full bg-(--primary-card) px-2 py-0.5 text-xs font-medium text-(--primary)"
        >
          {v}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((x) => x !== v));
            }}
            aria-label={`Удалить ${v}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => draft.trim() && commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[8ch] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
