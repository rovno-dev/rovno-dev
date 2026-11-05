"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Cross-fades between labels on a slow cadence inside a box whose width
 * is pinned to the WIDEST label.
 *
 * Pinning to the max width (not the current label's width) is what keeps
 * the surrounding `w-fit` button from growing and shrinking: `1fr` grid
 * tracks are `minmax(auto, 1fr)`, so a wider item expands its track and
 * shoves its neighbours. With a stable width the button never reflows and
 * the label simply fades inside it.
 *
 * `leading` renders inside the measured and animated span, so an icon
 * travels with its text and stays centred. An icon rendered outside would
 * sit at the left edge of a box wider than the current label, and the
 * icon-to-text gap would breathe on every tick.
 */
export function CycleText({
  labels,
  leading,
  intervalMs = 8000,
  transitionMs = 1600,
  className,
}: {
  labels: string[];
  leading?: React.ReactNode;
  intervalMs?: number;
  transitionMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const reduce = useReducedMotion();

  // useLayoutEffect so the reserved width is applied before the first
  // paint. A useEffect here would paint one frame at the wrong width and
  // flash exactly the grid shift this component exists to prevent.
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    const widest = kids.reduce(
      (max, k) => Math.max(max, k.getBoundingClientRect().width),
      0,
    );
    setWidth((prev) =>
      prev !== null && Math.abs(prev - widest) < 0.5 ? prev : widest,
    );
  }, [labels.join("|")]);

  useEffect(() => {
    if (labels.length < 2 || reduce) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % labels.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [labels.length, intervalMs, reduce]);

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        className,
      )}
      style={width ? { width } : undefined}
    >
      {/* Off-flow measurer. Invisible, contributes nothing to layout, but
          getBoundingClientRect() still reports each child's true width. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 invisible whitespace-nowrap"
      >
        {labels.map((l, i) => (
          <span key={i} className="inline-flex items-center">
            {leading}
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
          transition={{
            duration: reduce ? 0 : transitionMs / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-flex items-center justify-center whitespace-nowrap"
        >
          {leading}
          {labels[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
