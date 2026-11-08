"use client";
import { useEffect, useMemo, useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AnimatePresence, motion } from "motion/react";
export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}
interface TocProps {
  headings: TocHeading[];
  /** Small label above the list. Translated by the caller. */
  label: string;
  /** aria-label for the aside. Translated by the caller. */
  ariaLabel: string;
  /**
   * Where the TOC appears.
   *   - "sidebar"  (default): sticky aside on lg+, floating button below lg.
   *   - "floating":          floating button on every viewport, no aside.
   * Use "floating" on long-form pages (article/project) that opted out of
   * the sidebar column — the button is the only way to reach the TOC.
   */
  variant?: "sidebar" | "floating";
}
/**
 * Scroll-spy TOC. Desktop: sticky sidebar. Mobile: floating button bottom-right
 * that expands into a scrollable panel. Uses IntersectionObserver-free
 * scroll-spy (top-band crossing) so it stays dependency-free and accurate.
 */
export function Toc({ headings, label, ariaLabel, variant = "sidebar" }: TocProps) {
  const isFloating = variant === "floating";
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const headingIds = useMemo(() => headings.map((h) => h.id), [headings]);
  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const onScroll = () => {
      const band = 120;
      let current = elements[0].id;
      for (const el of elements) {
        const top = el.getBoundingClientRect().top;
        if (top - band <= 0) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headingIds, headings.length]);
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);
  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileOpen(false);
  };
  const activeHeading = headings.find((h) => h.id === activeId);
  return (
    <>
      {!isFloating && (
        <aside aria-label={ariaLabel} className="hidden lg:block lg:sticky lg:top-32 h-fit bg-[var(--primary-glass)] backdrop-blur-[var(--blur-glass)] p-3 rounded-xl">
          <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">{label}</p>
          <nav>
            <ul className="space-y-1.5 text-body-4">
              {headings.map((h) => {
                const isActive = h.id === activeId;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => handleJump(h.id)}
                      className={cn(
                        "text-left w-full leading-snug py-1 transition-colors border-l-2 pl-3",
                        h.level === 3 && "pl-6 text-body-5",
                        isActive
                          ? "border-(--primary) text-(--primary) font-medium"
                          : "border-transparent text-(--on-bg-medium) hover:text-(--on-bg-high) hover:border-(--outline)"
                      )}
                    >
                      {h.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      )}
      <div className={cn("fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end", !isFloating && "lg:hidden")}>
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Invisible overlay to catch outside clicks */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMobileOpen(false)}
              />
              {/* The Island */}
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "absolute bottom-full right-0 mb-4 w-[min(85vw,320px)]",
                  "flex flex-col overflow-hidden rounded-2xl",
                  "bg-(--card) border border-(--outline) shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]",
                  "z-50"
                )}
                style={{ transformOrigin: "bottom right" }}
              >
                {/* Pointer/Arrow */}
                <div className="absolute -bottom-[6px] right-6 size-3 rotate-45 bg-(--card) border-b border-r border-(--outline) z-0" />

                <div className="relative z-10 flex flex-col h-full bg-(--card) rounded-2xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-(--outline)">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-(--on-bg-low)">
                      {label}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors p-1 -mr-1"
                      aria-label="Закрыть"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>

                  <div className="max-h-[55vh] overflow-y-auto p-2 scrollbar-admin">
                    <nav>
                      <ul className="flex flex-col gap-0.5">
                        {headings.map((h) => {
                          const isActive = h.id === activeId;
                          return (
                            <li key={h.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  handleJump(h.id);
                                  setMobileOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left leading-snug py-2 px-3 rounded-xl transition-all duration-200",
                                  h.level === 3 && "pl-6 text-[13px]",
                                  isActive
                                    ? "bg-(--primary-glass) text-(--primary) font-medium"
                                    : "text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)"
                                )}
                              >
                                {h.text}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className={cn(
            "relative z-50 inline-flex items-center gap-2 rounded-full",
            "border border-(--outline) bg-(--card) shadow-lg px-4 py-3",
            "text-body-4 font-medium text-(--on-bg-high) transition-all duration-300",
            "max-w-[min(80vw,360px)]",
            "hover:border-(--on-bg-low)/30 hover:shadow-xl active:scale-[0.97]",
            mobileOpen && "border-(--primary)/50 ring-2 ring-(--primary)/20 shadow-xl"
          )}
        >
          <ListIcon className="size-4 shrink-0" />
          <span className="truncate">{activeHeading ? activeHeading.text : label}</span>
        </button>
      </div>
    </>
  );
}
