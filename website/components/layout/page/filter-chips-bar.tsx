"use client";

import { cn } from "@/lib/utils";

/**
 * Sticky category chip row that visually mirrors the site header:
 * rounded-full pill, backdrop-blur, hairline border, same 55px / 80px
 * vertical rhythm. Reusable for /projects, /events, and anything else that
 * needs an inline filter.
 *
 * The component itself is presentation-only — pass an array of
 * { id, label, count?, active } and an onSelect handler.
 */
export function FilterChipsBar({
  chips,
  onSelect,
  className,
}: {
  chips: { id: string; label: string; count?: number; active: boolean }[];
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky z-40 flex justify-center w-full transition-width duration-400 ease-in-out",
        // Match header's mt-2 + h-55/80 rhythm.
        "top-[8px] sm:top-[10px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          "w-[calc(100%-32px)] sm:w-[calc(100%-32px)] md:w-auto md:min-w-[600px] lg:min-w-[800px]",
          "bg-(--bg)/40 backdrop-blur-glass",
          "border border-(--card-glass) rounded-full",
          "h-[55px] sm:h-[64px]",
          "px-4 sm:px-6",
          "overflow-x-auto no-scrollbar",
        )}
      >
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
              c.active
                ? "bg-(--on-bg-high) text-(--bg)"
                : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
            )}
          >
            <span>{c.label}</span>
            {typeof c.count === "number" && (
              <span
                className={cn(
                  "text-[10px] tabular-nums rounded-full px-1.5 py-0.5",
                  c.active
                    ? "bg-(--bg)/20 text-(--bg)"
                    : "bg-(--state-hover) text-(--on-bg-low)",
                )}
              >
                {c.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
