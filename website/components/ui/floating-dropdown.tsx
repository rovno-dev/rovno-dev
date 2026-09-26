"use client";
import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

/**
 * Renders its children in a portal at the anchor's bottom edge. Escapes any
 * ancestor `overflow: hidden` — the reason a plain absolutely-positioned
 * dropdown inside a Card gets clipped.
 *
 * `anchorRef` is the element to attach the dropdown to (usually the input
 * wrapper). `dropdownRef` is set on the portaled node so callers can test
 * outside-clicks against both.
 */
export function FloatingDropdown({
  open,
  anchorRef,
  dropdownRef,
  className,
  children,
  sideOffset = 4,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  dropdownRef?: (el: HTMLDivElement | null) => void;
  className?: string;
  children: React.ReactNode;
  sideOffset?: number;
}) {
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  // SSR guard — portals can only render client-side.
  useEffect(() => setMounted(true), []);

  // Track the anchor's rect while open. Scroll uses capture phase so it fires
  // for scrollable ancestors, not just window.
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCoords({
        top: r.bottom + sideOffset,
        left: r.left,
        width: r.width,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef, sideOffset]);

  if (!mounted || !open || !coords) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: coords.width,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body,
  );
}
