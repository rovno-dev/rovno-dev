"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Vercel-style page peel.
 *
 * The card's bottom-right corner can be folded over like a sheet of paper. The
 * fold point is a point in card coordinates: the corner is "peeled back" by
 * `x`/`y` pixels, exposing the layer underneath and drawing the creased flap on
 * top. The geometry below is a direct port of the fold solver used on
 * vercel.com's "Recently shipped" cards, so the crease, gradient and folded
 * flap line up the same way.
 */

type Point = { x: number; y: number };
type Size = { w: number; h: number };

const CLOSED: Point = { x: 112, y: 112 };
const HOVER: Point = { x: 176, y: 136 };
const DEMO: Point = { x: 216, y: 152 };

const HOVER_SPRING: Transition = {
  type: "spring",
  stiffness: 240,
  damping: 28,
  mass: 0.9,
};
const DEMO_TWEEN: Transition = {
  type: "tween",
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1],
};
const RETURN_SPRING: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 11,
  mass: 1,
};

const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;
const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** Keeps only the part of the rectangle on one side of a line. */
function clipRect(
  size: Size,
  fold: Point,
  normal: Point,
  side: 1 | -1
): Point[] {
  const corners: Point[] = [
    { x: 0, y: 0 },
    { x: size.w, y: 0 },
    { x: size.w, y: size.h },
    { x: 0, y: size.h },
  ];
  const out: Point[] = [];

  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const da = side * dot(sub(a, fold), normal);
    const db = side * dot(sub(b, fold), normal);

    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) out.push(lerp(a, b, da / (da - db)));
  }

  return out;
}

function offset(value: number, dimension: number) {
  if (value <= 0.01) return "0";
  if (dimension - value <= 0.01) return "100%";
  return `calc(100% - ${(dimension - value).toFixed(2)}px)`;
}

function toPolygon(points: Point[], size: Size) {
  return `polygon(${points
    .map((p) => `${offset(p.x, size.w)} ${offset(p.y, size.h)}`)
    .join(", ")})`;
}

function peelGeometry(fold: Point, size: Size) {
  const corner = { x: size.w, y: size.h };
  const mid = lerp(corner, sub(corner, fold), 0.5);
  const length = Math.hypot(fold.x, fold.y) || 1;
  const dir = { x: fold.x / length, y: fold.y / length };
  const normal = { x: -dir.x, y: -dir.y };

  const spread = size.w * Math.abs(normal.x) + size.h * Math.abs(normal.y);
  const center =
    dot({ x: mid.x - size.w / 2, y: mid.y - size.h / 2 }, normal) + spread / 2;
  const stop = (value: number) => `${(center - value).toFixed(2)}px`;
  const angle = (180 * Math.atan2(normal.x, -normal.y)) / Math.PI;

  return {
    topClip: toPolygon(clipRect(size, mid, dir, -1), size),
    flapClip: toPolygon(clipRect(size, mid, dir, 1), size),
    flapBackground: `linear-gradient(${angle.toFixed(2)}deg, var(--peel-paper) ${stop(
      56
    )}, var(--peel-shade) ${stop(18)}, var(--peel-highlight) ${stop(
      3
    )}, var(--peel-crease) ${stop(0)})`,
    flapTransform: `translate(${-fold.x}px, ${-fold.y}px) matrix(${(
      1 - 2 * dir.x * dir.x
    ).toFixed(4)}, ${(-2 * dir.x * dir.y).toFixed(4)}, ${(
      -2 * dir.x * dir.y
    ).toFixed(4)}, ${(1 - 2 * dir.y * dir.y).toFixed(4)}, 0, 0)`,
  };
}

// Server-rendered starting fold. The real card size is unknown until mount, but
// every offset in the solution is "100% - Npx", so a huge reference box yields
// exactly the same visual fold.
const INITIAL = peelGeometry(CLOSED, { w: 10000, h: 10000 });

// The reference card on vercel.com is ~560px wide; smaller cards need a
// proportionally smaller fold, otherwise the peeled corner swallows the copy.
function foldFor(point: Point, size: Size): Point {
  const scale = Math.min(1, Math.max(0.55, size.w / 560));
  return { x: point.x * scale, y: point.y * scale };
}

export function PagePeel({
  children,
  under,
  className,
  demoDelay = 0,
}: {
  children: ReactNode;
  under?: ReactNode;
  className?: string;
  demoDelay?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<Size>({ w: 0, h: 0 });
  const animations = useRef<{ stop: () => void }[]>([]);
  const runId = useRef(0);
  const hovered = useRef(false);
  const demoPlayed = useRef(false);
  const measured = useRef(false);

  const x = useMotionValue(CLOSED.x);
  const y = useMotionValue(CLOSED.y);
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.5 });

  const paint = useCallback(() => {
    const size = sizeRef.current;
    if (size.w <= 1 || size.h <= 1) return;
    const geometry = peelGeometry({ x: x.get(), y: y.get() }, size);
    if (topRef.current) topRef.current.style.clipPath = geometry.topClip;
    if (flapRef.current) {
      flapRef.current.style.clipPath = geometry.flapClip;
      flapRef.current.style.backgroundImage = geometry.flapBackground;
      flapRef.current.style.transform = geometry.flapTransform;
    }
  }, [x, y]);

  useEffect(() => {
    const stopX = x.on("change", paint);
    const stopY = y.on("change", paint);
    return () => {
      stopX();
      stopY();
    };
  }, [x, y, paint]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const size = {
        w: entry.contentRect.width,
        h: entry.contentRect.height,
      };
      sizeRef.current = size;
      if (!measured.current) {
        measured.current = true;
        const closed = foldFor(CLOSED, size);
        x.set(closed.x);
        y.set(closed.y);
      }
      paint();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [paint, x, y]);

  const animateTo = useCallback(
    (point: Point, transition: Transition) => {
      animations.current.forEach((animation) => animation.stop());
      const id = ++runId.current;
      const controls = [
        animate(x, point.x, transition),
        animate(y, point.y, transition),
      ];
      animations.current = controls;
      return Promise.all(controls.map((control) => control.then(() => {}))).then(
        () => runId.current === id
      );
    },
    [x, y]
  );

  // Intro demo: fold the corner out, then let it fall back with a spring.
  useEffect(() => {
    if (!inView || reduced || demoPlayed.current) return;
    demoPlayed.current = true;
    const timer = window.setTimeout(async () => {
      if (hovered.current) return;
      const finished = await animateTo(foldFor(DEMO, sizeRef.current), DEMO_TWEEN);
      if (!finished || hovered.current) return;
      await animateTo(foldFor(CLOSED, sizeRef.current), RETURN_SPRING);
    }, 600 + demoDelay);
    return () => window.clearTimeout(timer);
  }, [inView, reduced, demoDelay, animateTo]);

  return (
    <div
      ref={rootRef}
      className={cn("relative size-full", className)}
      onPointerEnter={() => {
        hovered.current = true;
        if (!reduced) animateTo(foldFor(HOVER, sizeRef.current), HOVER_SPRING);
      }}
      onPointerLeave={() => {
        hovered.current = false;
        if (!reduced) animateTo(foldFor(CLOSED, sizeRef.current), HOVER_SPRING);
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <div aria-hidden className="absolute inset-0">
          {under}
        </div>
        <div
          ref={topRef}
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: INITIAL.topClip }}
        >
          {children}
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-96 -left-96 right-0 bottom-0 z-20 overflow-clip [filter:drop-shadow(4px_6px_10px_rgba(0,0,0,0.16))]"
      >
        <div
          ref={flapRef}
          className="absolute top-96 left-96 right-0 bottom-0 origin-bottom-right rounded-sm will-change-[clip-path,transform] [--peel-crease:var(--outline)] [--peel-highlight:var(--bg)] [--peel-paper:var(--card)] [--peel-shade:var(--bg-disabled)] dark:[--peel-crease:#55555e] dark:[--peel-highlight:#3c3c42] dark:[--peel-paper:#2b2b30] dark:[--peel-shade:#202024]"
          style={{
            clipPath: INITIAL.flapClip,
            backgroundImage: INITIAL.flapBackground,
            transform: INITIAL.flapTransform,
          }}
        />
      </div>
    </div>
  );
}
