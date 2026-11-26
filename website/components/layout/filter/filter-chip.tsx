"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h4 className="text-[11px] uppercase tracking-[0.18em] text-(--on-bg-low)">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export function DrawerChip({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-body-4 transition-all duration-200",
        active
          ? "bg-(--on-bg-high) text-(--bg) shadow-sm"
          : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:border-(--on-bg-low)/40 hover:text-(--on-bg-high)",
        disabled &&
          "opacity-30 cursor-not-allowed hover:border-(--outline) hover:text-(--on-bg-medium)",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums text-[10px] leading-none",
          active ? "text-(--bg)/60" : "text-(--on-bg-low)",
        )}
      >
        {count}
      </span>
    </button>
  );
}
