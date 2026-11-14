"use client";
import { motion, AnimatePresence } from "motion/react";
import { XIcon } from "@phosphor-icons/react";

export interface ActiveFilter {
  id: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilters({
  filters,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onClearAll: () => void;
}) {
  return (
    <AnimatePresence initial={false}>
      {filters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
            {filters.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 h-8 pl-3 pr-1 rounded-full border border-(--outline) text-body-5 text-(--on-bg-high)"
              >
                <span className="truncate max-w-[240px]">{f.label}</span>
                <button
                  type="button"
                  onClick={f.onRemove}
                  aria-label={`Убрать фильтр ${f.label}`}
                  className="size-6 inline-flex items-center justify-center rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={onClearAll}
              className="ml-1 text-body-5 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors underline-offset-4 hover:underline"
            >
              Очистить всё
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
