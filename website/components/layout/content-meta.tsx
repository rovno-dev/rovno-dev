"use client";
import { Eye, Clock, CalendarCheck } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { hitView, type ViewEntityType } from "@/utils/api/views";

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
 * The meta strip under a hero.
 *
 * View counter behaviour:
 *   - starts `null` → renders a pulse skeleton, not an em-dash. The
 *     em-dash was the reason the counter looked broken in production:
 *     any transient backend error left it there permanently.
 *   - resolves to a number → real value
 *   - fails → falls back to `0`, not to `null`. A site with 0-2 views is
 *     far more common than the counter being reachable; 0 reads as "not
 *     broken", em-dash reads as "bug".
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

  const items = [
    {
      icon: <Eye className="size-4" weight="duotone" />,
      label: "Просмотры",
      value: views === null ? null : views.toLocaleString("ru-RU"),
      tabular: true,
    },
    {
      icon: <Clock className="size-4" weight="duotone" />,
      label: "Чтение",
      value: `${readTime} мин`,
      tabular: false,
    },
    {
      icon: <CalendarCheck className="size-4" weight="duotone" />,
      label: "Обновлено",
      value: formattedDate,
      tabular: true,
    },
  ];

  return (
    <div
      data-cover={imageUrl || undefined}
      className={cn(
        "grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-(--outline) bg-(--outline)",
        className,
      )}
    >
      {items.map((it, i) => (
        <div key={i} className="bg-(--card) px-4 py-4 flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center size-9 shrink-0 rounded-xl bg-(--primary-glass) text-(--primary)">
            {it.icon}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-[0.14em]  text-(--on-bg-low)">
              {it.label}
            </span>
            {it.value === null ? (
              <span className="inline-block h-5 w-8 mt-0.5 rounded bg-(--on-bg-low)/20 animate-pulse" />
            ) : (
              <span
                className={cn(
                  "text-body-2  text-(--on-bg-high) truncate",
                  it.tabular && "tabular-nums",
                )}
              >
                {it.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
