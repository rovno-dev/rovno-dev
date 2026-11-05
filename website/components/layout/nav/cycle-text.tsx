"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Cycles through a set of labels on a slow cadence, and *animates* the
 * container's width to fit the current label - so a wrapping `w-fit`
 * button grows and shrinks smoothly instead of snapping between sizes.
 *
 * How the width animation works:
 *   - every label is rendered once in an off-flow, invisible measurer
 *   - `useLayoutEffect` reads each label's natural pixel width before paint
 *   - on label change, the outer span animates `width` to the new label's
 *     width. `width` is a real layout property, so the parent button's
 *     `w-fit` content-box follows frame-by-frame.
 *
 * `layout` (FLIP scale) is deliberately NOT used here: it would scale the
 * button horizontally, distorting the label text. Animating `width` keeps
 * the text at its true aspect ratio and reads as a real resize.
 */
export function CycleText({
  labels,
  intervalMs = 8000,
  transitionMs = 1600,
  className,
}: {
  labels: string[];
  intervalMs?: number;
  transitionMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<number[] | null>(null);
  const reduce = useReducedMotion();

  // Measure every label's natural width once. useLayoutEffect (not
  // useEffect) so the measured widths land before paint, preventing a
  // one-frame flash of the wrong width on first mount.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const next = kids.map((k) => k.getBoundingClientRect().width);
    setWidths((prev) => {
      if (
        prev &&
        prev.length === next.length &&
        prev.every((w, i) => Math.abs(w - next[i]) < 0.5)
      ) {
        return prev;
      }
      return next;
    });
  }, [labels.join("|")]);

  useEffect(() => {
    if (labels.length < 2 || reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % labels.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [labels.length, intervalMs, reduce]);

  const targetWidth = widths?.[index];
  const dur = transitionMs / 1000;

  return (
    <motion.span
      className={cn(
        "relative inline-flex items-center overflow-hidden",
        className,
      )}
      animate={targetWidth ? { width: targetWidth } : undefined}
      transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Off-flow measurer: invisible, never participates in layout, but
          getBoundingClientRect() still returns each child's true width. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="absolute top-0 left-0 invisible whitespace-nowrap pointer-events-none"
      >
        {labels.map((l, i) => (
          <span key={i} className="inline-block">
            {l}
          </span>
        ))}
      </span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: dur, ease: [0.16, 1, 0.3, 1] }}
          className="whitespace-nowrap"
        >
          {labels[index]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
