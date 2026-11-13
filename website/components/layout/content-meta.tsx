"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { hitView, type ViewEntityType } from "@/utils/api/views";

// Walks the Novel / Tiptap JSON tree and concatenates the plain text of
// every node. This is the only input the read-time calculation accepts
// when the caller passes structured content - no MDX parsing.
function extractTextFromTiptap(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractTextFromTiptap).join(" ");
  return "";
}

function calculateReadTime(content: any): number {
  if (!content) return 1;
  let text = "";
  if (typeof content === "string") text = content;
  else if (content.content) text = extractTextFromTiptap(content);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return 1;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Meta strip under a hero: views, read time, last-updated date.
 *
 * Same visual language as `CaseInfo` (see custom-project-page.tsx):
 *   - outer wrapper: `border-y divide-y divide-(--outline)`
 *   - each row:      `grid grid-cols-[120px_1fr] md:grid-cols-[200px_1fr]
 *                     items-baseline gap-4 md:gap-8 py-4 md:py-5`
 *   - label:         `text-body-4 text-(--on-bg-low)`
 *   - value:         `text-body-3 text-(--on-bg-high) md:text-right tabular-nums`
 *
 * Kept on one line so the two strips read as a single ruled block when
 * stacked (Year → Просмотры → Чтение → Обновлено). A missing view count
 * resolves to `0`, never to an em-dash - the counter reads as "not
 * broken" on a brand-new page.
 */
export function ContentMeta({
  entityType,
  entityId,
  content,
  updatedAt,
  imageUrl,
  className,
}: {
  entityType: ViewEntityType;
  entityId: string;
  content: any;
  updatedAt: string;
  imageUrl?: string;
  className?: string;
}) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setViews(null);
    hitView(entityType, entityId)
      .then((n) => {
        if (cancelled) return;
        setViews(n ?? 0);
      })
      .catch(() => {
        if (cancelled) return;
        setViews(0);
      });
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  const readTime = calculateReadTime(content);
  const formattedDate = new Date(updatedAt).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const rows: { label: string; value: string | null }[] = [
    {
      label: "Просмотры",
      value: views === null ? null : views.toLocaleString("ru-RU"),
    },
    { label: "Чтение", value: `${readTime} мин` },
    { label: "Обновлено", value: formattedDate },
  ];

  return (
    <div
      className={cn(
        "divide-y divide-(--outline) border-y border-(--outline)",
        className,
      )}
    >
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[120px_1fr] md:grid-cols-[200px_1fr] items-baseline gap-4 md:gap-8 py-4 md:py-5"
        >
          <span className="text-body-4 text-(--on-bg-low)">{r.label}</span>
          {r.value === null ? (
            <div className="h-4 w-10 rounded bg-(--on-bg-low)/20 animate-pulse md:ml-auto" />
          ) : (
            <span className="text-body-3 text-(--on-bg-high) md:text-right tabular-nums">
              {r.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
