"use client";

import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Minimal search + filters toolbar shared by the public list pages.
 *
 * The search field is a quiet trigger rather than a permanent input:
 * clicking it, or pressing Ctrl/Cmd+K, opens a small dialog where the
 * query is typed. The query still filters the list live, and stays active
 * after the dialog closes, so the trigger doubles as the current-query
 * indicator.
 */
export function ListToolbar({
  value,
  onChange,
  placeholder = "Поиск...",
  onFilters,
  filterLabel,
  activeFilterCount = 0,
  resultCount,
  total,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilters: () => void;
  filterLabel?: string;
  activeFilterCount?: number;
  resultCount?: number;
  total?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      <SearchTrigger
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        resultCount={resultCount}
      />
      <FilterIconButton
        onClick={onFilters}
        activeCount={activeFilterCount}
        label={filterLabel}
      />
      {typeof resultCount === "number" && (
        <div className="hidden lg:flex items-center shrink-0 h-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--on-bg-low) tabular-nums">
            {resultCount}
            {typeof total === "number" && (
              <>
                <span className="mx-1.5 opacity-40">/</span>
                {total}
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export function SearchTrigger({
  value,
  onChange,
  placeholder = "Поиск...",
  resultCount,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.platform));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div
        className={cn(
          "group flex h-10 min-w-0 flex-1 items-center border-b border-(--outline) transition-colors focus-within:border-(--primary) hover:border-(--on-bg-low)/50",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="flex h-full min-w-0 flex-1 items-center gap-2.5 text-left outline-none"
        >
          <MagnifyingGlassIcon className="size-4 shrink-0 text-(--on-bg-low) transition-colors group-hover:text-(--on-bg-high)" />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-body-3",
              value ? "text-(--on-bg-high)" : "text-(--on-bg-low)",
            )}
          >
            {value || placeholder}
          </span>
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Очистить"
            className="mr-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-(--on-bg-low) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
          >
            <XIcon className="size-3.5" />
          </button>
        ) : (
          <Kbd className="hidden sm:inline-flex shrink-0 text-[10px] tracking-wider">
            {isMac ? "⌘" : "Ctrl"} K
          </Kbd>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-[18%] w-[calc(100%-2rem)] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{placeholder}</DialogTitle>
            <DialogDescription>
              Введите запрос для поиска. Enter — закрыть.
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-14 items-center gap-3 border-b border-(--outline) px-4">
            <MagnifyingGlassIcon className="size-4 shrink-0 text-(--on-bg-low)" />
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setOpen(false);
                }
              }}
              placeholder={placeholder}
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              className="h-full min-w-0 flex-1 bg-transparent text-body-2 text-(--on-bg-high) outline-none placeholder:text-(--on-bg-low)"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label="Очистить"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-(--on-bg-low) transition-colors hover:bg-(--state-hover) hover:text-(--on-bg-high)"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
            <Kbd className="hidden sm:inline-flex shrink-0 text-[10px]">Esc</Kbd>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-body-5 text-(--on-bg-low) tabular-nums">
              {typeof resultCount === "number" && value.trim()
                ? `Найдено: ${resultCount}`
                : "Начните вводить для поиска"}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-body-5 text-(--on-bg-low)">
              <Kbd className="text-[10px]">Enter</Kbd>
              <span>закрыть</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FilterIconButton({
  onClick,
  activeCount = 0,
  label = "Фильтры",
}: {
  onClick: () => void;
  activeCount?: number;
  label?: string;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="text"
      className="h-10 w-10 shrink-0 rounded-full text-(--on-bg-medium)"
      aria-label={label}
      title={label}
    >
      <SlidersHorizontalIcon
        className="size-5 transition-transform duration-300 group-hover/button:scale-110"
        weight={activeCount > 0 ? "bold" : "regular"}
      />
      {activeCount > 0 && (
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-(--primary) ring-2 ring-(--bg)" />
      )}
    </Button>
  );
}
