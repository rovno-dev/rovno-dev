import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ProjectTagKind = "from_chief" | "license" | "github" | "custom";

/**
 * Per-kind accent palette. `from_chief` is warm because the tag reads as a
 * personal signature ("this is the chief's own thing"), the others stay cool
 * so they don't compete with it visually.
 *
 * Accents are kept bright enough that their border and glow read on a dark
 * photographic hero — they are decoration on top of an image, not on a
 * neutral surface. The label itself is always white for the same reason.
 */
const TAG_THEME: Record<ProjectTagKind, { accent: string }> = {
  from_chief: { accent: "#FF9A3C" },
  license:    { accent: "#38BDF8" },
  github:     { accent: "#A78BFA" },
  custom:     { accent: "#CBD5E1" },
};

interface ProjectTagChipProps {
  kind: ProjectTagKind;
  label: string;
  icon?: ReactNode;
  meta?: string | null;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Glow-stroke pill. Three layers:
 *   1. A near-transparent accent fill, so the pill reads as tinted not solid.
 *   2. A 1px accent stroke at ~55% opacity — the "hard" edge.
 *   3. Two box-shadows — a tight inner ring (backlight) plus a wide outer
 *      bloom (spill) — and an inset highlight so the top edge catches light.
 *
 * The accent is exposed as `--accent` and every layer references it via
 * `color-mix`, so changing the kind in one line recolors the whole pill.
 *
 * The label is white and does not follow the theme — the chips live over
 * dark hero imagery, where the light-mode `--on-bg-high` would be invisible.
 */
export function ProjectTagChip({
  kind,
  label,
  icon,
  meta,
  size = "md",
  className,
}: ProjectTagChipProps) {
  const theme = TAG_THEME[kind];
  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full select-none whitespace-nowrap",
        isSmall ? "h-7 pl-2 pr-3 text-[11px]" : "h-9 pl-2.5 pr-4 text-xs",
        "font-medium text-white transition-transform duration-200",
        "hover:-translate-y-px",
        className,
      )}
      style={
        {
          "--accent": theme.accent,
          background: `
            radial-gradient(circle at 25% 40%,
              color-mix(in srgb, var(--accent), transparent 78%),
              transparent 62%),
            color-mix(in srgb, var(--accent), transparent 92%)
          `,
          border:
            "1px solid color-mix(in srgb, var(--accent), transparent 40%)",
          boxShadow: `
            0 0 0 3px color-mix(in srgb, var(--accent), transparent 90%),
            0 0 16px 1px color-mix(in srgb, var(--accent), transparent 70%),
            inset 0 0 12px color-mix(in srgb, var(--accent), transparent 82%),
            inset 0 1px 0 color-mix(in srgb, var(--accent), transparent 74%)
          `,
        } as React.CSSProperties
      }
    >
      {/* Icon slot — accent-tinted glyph with a small notification dot,
          mirroring the Redis Iris treatment. */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-full text-white",
          isSmall ? "size-4" : "size-5",
        )}
        style={{
          background: "color-mix(in srgb, var(--accent), transparent 82%)",
          color: "var(--accent)",
        }}
      >
        <span
          className={cn(
            "[&>svg]:size-full",
            isSmall ? "[&>svg]:size-2.5" : "[&>svg]:size-3",
          )}
        >
          {icon ?? <DotGlyph />}
        </span>
        {/* The tiny status dot on the icon's top-right corner. Decoration —
            it's what sells the "alive"/live-status feel of the pill. */}
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full"
          style={{
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent)",
          }}
        />
      </span>

      <span className="truncate max-w-[220px] text-white">{label}</span>

      {meta && (
        <span
          className="font-mono text-[10px] uppercase tracking-[0.16em] tabular-nums text-white/75"
        >
          {meta}
        </span>
      )}
    </span>
  );
}

/** Fallback glyph when the caller doesn't supply an icon. */
function DotGlyph() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="2.5" fill="currentColor" />
      <circle
        cx="6"
        cy="6"
        r="4.5"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="0.75"
      />
    </svg>
  );
}
