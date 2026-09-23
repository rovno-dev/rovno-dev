"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckUser } from "@/entities/user/model/check-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  RefreshCw,
  Newspaper,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import {
  ArticleListItem,
  fetchMyArticles,
  deleteArticle,
} from "@/utils/api/articles";

// Status colors tuned for a dark image backdrop: bright enough to read
// against the gradient, tinted to signal meaning. Both are on the same
// row as the date now, so they don't need to be shouty.
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  published: {
    label: "Опубликовано",
    className: "bg-emerald-500/30 text-emerald-100 border-emerald-300/40",
  },
  pending_review: {
    label: "На проверке",
    className: "bg-blue-500/30 text-blue-100 border-blue-300/40",
  },
  rejected: {
    label: "Отклонено",
    className: "bg-rose-500/30 text-rose-100 border-rose-300/40",
  },
  draft: {
    label: "Черновик",
    className: "bg-amber-500/30 text-amber-100 border-amber-300/40",
  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; articles: ArticleListItem[] }
  | { kind: "error"; message: string };

export default function MyArticlesPage() {
  const { t } = useLanguage();
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const articles = await fetchMyArticles();
      setState({ kind: "ready", articles });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("[my-articles] load failed:", err);
      setState({
        kind: "error",
        message: err?.message || "Не удалось загрузить статьи.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Удалить статью «${title}»? Это действие нельзя отменить.`)) return;
    try {
      await deleteArticle(slug);
      toast.success(t("editor.deleted"));
      setState((prev) =>
        prev.kind === "ready"
          ? { kind: "ready", articles: prev.articles.filter((a) => a.slug !== slug) }
          : prev
      );
    } catch {
      toast.error(t("editor.save_failed"));
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-display-2 mb-1 truncate">{t("editor.my_articles")}</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {t("editor.my_articles_subtitle")}
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/app/profile/articles/new">
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t("editor.new_article")}</span>
              <span className="sm:hidden">Новая</span>
            </Link>
          </Button>
        </div>

        {/* -------- Loading skeletons -------- */}
        {state.kind === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="rounded-4xl border-(--outline) bg-muted/30 animate-pulse aspect-[600/450]"
              />
            ))}
          </div>
        )}

        {/* -------- Error state -------- */}
        {state.kind === "error" && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--error-card) text-(--error)">
                <Newspaper className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-heading-4 text-(--on-bg-high) mb-1">
                  Не удалось загрузить статьи
                </h3>
                <p className="text-body-4 text-(--on-bg-medium) mb-4 break-words">
                  {state.message}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outlined" size="small" onClick={load}>
                    <RefreshCw className="size-4" />
                    Повторить
                  </Button>
                  <Button variant="text" size="small" asChild>
                    <Link href="/app/profile">В профиль</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* -------- Empty state -------- */}
        {state.kind === "ready" && state.articles.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium) mb-4">
              {t("editor.empty")}
            </p>
            <Button asChild>
              <Link href="/app/profile/articles/new">
                <Plus className="size-4" />
                {t("editor.new_article")}
              </Link>
            </Button>
          </Card>
        )}

        {/* -------- Article grid --------
            Five-layer stack, explicit z-index on every sibling:
              z-0   cover image / gradient fallback
              z-1   full-card link (click target for preview)
              z-2   bottom gradient (visual only)
              z-3   text overlay (pointer-events-none, clicks fall through)
              z-20  action buttons (top-right, interactive)
            Nothing overlaps by accident at any card width. */}
        {state.kind === "ready" && state.articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.articles.map((a) => {
              const status = STATUS_STYLES[a.publication_status] ?? STATUS_STYLES.draft;
              const isPublished = a.publication_status === "published";

              return (
                <Card
                  key={a.id}
                  className="group relative overflow-hidden rounded-4xl border border-(--outline) bg-card ring-0 aspect-[600/450]"
                >
                  {/* z-0 — cover or gradient fallback */}
                  {a.image_url ? (
                    <Image
                      fill
                      src={a.image_url}
                      alt={a.title}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={90}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                  )}

                  {/* z-1 — full-card click target */}
                  <Link
                    href={`/app/profile/articles/${a.slug}/preview`}
                    className="absolute inset-0 z-[1] rounded-4xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-inset"
                    aria-label={`Открыть предпросмотр: ${a.title}`}
                  />

                  {/* z-2 — bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-3/4 z-[2] bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />

                  {/* z-3 — text, non-interactive so clicks pass to the link */}
                  <div className="absolute inset-x-0 bottom-0 z-[3] p-5 pointer-events-none">
                    {a.tags && a.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {a.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="glass-static"
                            size="chip-small"
                            className="text-white border-white/20"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <h3 className="text-display-4 md:text-display-3 text-white leading-tight line-clamp-2 transition-transform duration-300 group-hover:-translate-y-0.5">
                      {a.title}
                    </h3>

                    {a.description && (
                      <p className="mt-1.5 text-body-4 text-white/75 line-clamp-2">
                        {a.description}
                      </p>
                    )}

                    {/* Status + date now live here, on the same row — no
                        more top-left pill colliding with top-right actions. */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
                          status.className
                        )}
                      >
                        {status.label}
                      </span>
                      <span className="text-body-5 text-white/60">
                        {formatDate(a.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* z-20 — actions, hover-reveal on desktop, always on
                      touch. Three buttons only: preview, edit, delete.
                      The external-link button was dropped because at narrow
                      card widths four buttons crowded the corner, and the
                      preview page already links to the public URL. */}
                  <div
                    className={cn(
                      "absolute top-3 right-3 z-20 flex gap-1",
                      "opacity-0 translate-y-1 transition-all duration-300",
                      "group-hover:opacity-100 group-hover:translate-y-0",
                      "group-focus-within:opacity-100 group-focus-within:translate-y-0",
                      "max-md:opacity-100 max-md:translate-y-0"
                    )}
                  >
                    <Button
                      variant="glass"
                      size="icon-small"
                      asChild
                      title="Предпросмотр"
                    >
                      <Link href={`/app/profile/articles/${a.slug}/preview`}>
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="glass"
                      size="icon-small"
                      asChild
                      title={t("editor.edit")}
                    >
                      <Link href={`/app/profile/articles/${a.slug}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="glass"
                      size="icon-small"
                      onClick={() => handleDelete(a.slug, a.title)}
                      title={t("editor.delete")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CheckUser>
  );
}
