"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

// One row per area a CTO signs off on. `done: false` is a real state, not
// a styling toggle — those rows render with an empty box, and their status
// text sits in the high-contrast colour because that is what the eye lands
// on in a real audit doc: the things that are not yet cleared.
const CHECKS = [
  { label: "architecture", status: "clear", done: true },
  { label: "auth & sessions", status: "reviewed", done: true },
  { label: "db & migrations", status: "1 warn", done: true },
  { label: "deploy pipeline", status: "at risk", done: false },
  { label: "observability", status: "basic", done: true },
  { label: "bus factor", status: "2 of 5", done: false },
];

export function AuditCard() {
  const { t } = useLanguage();

  return (
    <Link
      href="/services/audit"
      className="group relative md:col-span-2 flex flex-col justify-end p-6 md:p-8 min-h-[340px] md:min-h-[440px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-500 hover:border-(--on-bg-low)/40"
    >
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Blueprint grid + diagonal wedge (unchanged). */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--outline) 1px, transparent 1px), linear-gradient(to bottom, var(--outline) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute inset-0 bg-(--bg)/80"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />

        {/* Audit report panel. Inset surface (`bg-(--bg)` on `bg-(--card)`)
            so it reads as a document lying on the card, not a widget on top
            of it. Every glyph is an --on-bg-* shade; no hue anywhere, so the
            report survives both themes without recalibration. */}
        <div className="absolute top-6 left-6 right-6 md:top-10 md:left-auto md:right-8 md:w-[400px] rounded-xl bg-[color-mix(in_srgb,var(--on-bg-high),transparent_96%)] border border-[color-mix(in_srgb,var(--on-bg-high),transparent_86%)] shadow-lg overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">
          {/* Chrome: document name left, revision right. Same shape as the
              previous terminal strip, but the metadata is a document id
              rather than a cwd — this is a report, not a live log. */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[color-mix(in_srgb,var(--on-bg-high),transparent_88%)] bg-[color-mix(in_srgb,var(--on-bg-high),transparent_94%)]">
            <div className="flex gap-1.5 shrink-0">
              <span className="size-1.5 rounded-full bg-(--on-bg-medium)/50" />
              <span className="size-1.5 rounded-full bg-(--on-bg-medium)/50" />
              <span className="size-1.5 rounded-full bg-(--on-bg-medium)/50" />
            </div>
            <span className="font-mono text-[10px] text-(--on-bg-medium) truncate">
              audit.md
            </span>
          </div>

          {/* Header block: what was audited and how big it is. Two rows,
              label column fixed-width so the values line up like a table. */}
          <div className="hidden md:block px-3.5 pt-3 pb-2 space-y-1 font-mono text-[11px]">
            <div className="flex gap-3">
              <span className="text-(--on-bg-low) w-[42px] shrink-0">repo</span>
              <span className="text-(--on-bg-medium) truncate">
                rovno/api@main
              </span>
            </div>
            <div className="flex gap-3">
              <span className="text-(--on-bg-low) w-[42px] shrink-0">scope</span>
              <span className="text-(--on-bg-medium) truncate">
                14 svc · 3 env · 8k loc
              </span>
            </div>
          </div>

          {/* Checklist. Boxes are drawn, not glyphs, so the two empty ones
              read as "not yet cleared" rather than "failed to render". */}
          <ul className="px-3.5 pt-2 pb-2 space-y-1.5 font-mono text-[11px]">
            {CHECKS.map((check, i) => (
              <motion.li
                key={check.label}
                initial={{ opacity: 0, x: -4 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 + i * 0.07, duration: 0.28 }}
                className="flex items-center gap-2.5"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-3 shrink-0 border inline-flex items-center justify-center text-[9px] leading-none select-none",
                    check.done
                      ? "border-(--on-bg-low)/55 text-(--on-bg-medium)"
                      : "border-(--on-bg-low)/30 text-transparent"
                  )}
                >
                  ✓
                </span>
                <span
                  className={cn(
                    "truncate",
                    check.done
                      ? "text-(--on-bg-medium)"
                      : "text-(--on-bg-high) "
                  )}
                >
                  {check.label}
                </span>
                <span
                  className={cn(
                    "ml-auto text-[10px] tabular-nums shrink-0",
                    check.done
                      ? "text-(--on-bg-low)"
                      : "text-(--on-bg-high)"
                  )}
                >
                  {check.status}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Verdict block — hidden on mobile, because at `min-h-[340px]`
              the panel and the card title start to collide. The desktop
              layout has the vertical room for it, and a report without a
              verdict is not a report. */}
          <div className="hidden md:block px-3.5 pb-3.5">
            <div className="h-px bg-(--outline) my-2" />
            <div className="flex items-baseline gap-3 font-mono text-[11px]">
              <span className="text-(--on-bg-low) w-[42px] shrink-0">
                verdict
              </span>
              <span className="text-(--on-bg-high)  truncate">
                approve · conditions
              </span>
            </div>
            <div className="flex items-baseline gap-3 font-mono text-[11px] mt-1">
              <span className="text-(--on-bg-low) w-[42px] shrink-0">cto</span>
              <span className="text-(--on-bg-medium) truncate">
                n. gimadiev
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade so the title stays legible over the illustration. */}
      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-(--card) via-(--card)/90 to-transparent pointer-events-none w-full md:w-[65%] z-[5]" />

      <div className="relative z-10 w-full md:w-[85%] mt-auto pointer-events-none">
        <h3 className="text-4xl md:text-2xl lg:text-4xl xl:text-5xl  mb-2 tracking-tight text-(--on-bg-high) group-hover:text-(--primary) transition-colors duration-300">
          {t("services.audit.short")}
        </h3>
        <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
          {t("services.audit.desc")}
        </p>
      </div>
    </Link>
  );
}
