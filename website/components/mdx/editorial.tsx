import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial MDX primitives for case-study bodies. Distinct from the generic
 * MDX set — these are pitched at long-form case narrative, not at blog prose.
 * All three read as "designer's margin notes" rather than article elements.
 */

/** A framed aside. `brief` and `result` render with their own glyph + tint. */
export function Callout({
  kind = "note",
  children,
}: {
  kind?: "note" | "brief" | "result";
  children: ReactNode;
}) {
  const meta = {
    note: { label: "Note", accent: "var(--on-bg-low)" },
    brief: { label: "Brief", accent: "var(--primary)" },
    result: { label: "Result", accent: "var(--success)" },
  }[kind];

  return (
    <aside
      className={cn(
        "my-10 relative rounded-3xl border border-(--outline) bg-(--card) p-6 md:p-8",
        "grid grid-cols-[auto_1fr] gap-x-5 gap-y-3",
      )}
      style={{ borderLeft: `3px solid ${meta.accent}` }}
    >
      <span
        className="font-mono text-[10px] uppercase tracking-[0.28em] pt-1.5"
        style={{ color: meta.accent }}
      >
        {meta.label}
      </span>
      <div className="prose-case-tight text-body-3 leading-relaxed text-(--on-bg-high)">
        {children}
      </div>
    </aside>
  );
}

/** Standalone pull-quote. No attribution — this is the designer speaking. */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <figure className="my-12 md:my-16 relative">
      <span
        aria-hidden
        className="absolute -top-6 -left-2 text-[7rem] font-heading leading-none text-(--primary)/15 select-none"
      >
        “
      </span>
      <blockquote className="relative text-2xl md:text-3xl lg:text-4xl font-heading font-medium tracking-[-0.02em] leading-[1.15] text-(--on-bg-high) max-w-[820px]">
        {children}
      </blockquote>
      <span
        aria-hidden
        className="mt-6 block h-px w-16 bg-(--primary)"
      />
    </figure>
  );
}

/** Horizontal strip of stats. Sits inside the case body, not in the hero. */
export function StatRow({
  items,
}: {
  items: { value: string; unit?: string; label: string }[];
}) {
  return (
    <div className="my-12 grid grid-cols-2 md:grid-cols-3 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
      {items.map((s, i) => (
        <div key={i} className="bg-(--bg) p-6 md:p-7">
          <div className="flex items-baseline gap-1 mb-2 tabular-nums">
            <span className="text-4xl md:text-5xl font-heading font-semibold tracking-[-0.03em] text-(--on-bg-high) leading-none">
              {s.value}
            </span>
            {s.unit && (
              <span className="text-body-4 text-(--on-bg-medium)">
                {s.unit}
              </span>
            )}
          </div>
          <p className="text-body-5 text-(--on-bg-low) uppercase tracking-[0.16em]">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
