"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Search, RefreshCw, CheckCircle2, XCircle, ExternalLink, Loader2,
  Clock, FileEdit, BookOpen, Users, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchAdminArticles, approveArticle, rejectArticle,
  type AdminArticle, type ReviewStatus,
} from "@/utils/api/admin-articles";

const STATUS_META: Record<string, { label: string; className: string; icon: any }> = {
  pending_review: { label: "На проверке", className: "bg-blue-500/15 text-blue-500 border-blue-500/30", icon: Clock },
  published: { label: "Опубликовано", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", icon: BookOpen },
  rejected: { label: "Отклонено", className: "bg-rose-500/15 text-rose-500 border-rose-500/30", icon: XCircle },
  draft: { label: "Черновик", className: "bg-amber-500/15 text-amber-500 border-amber-500/30", icon: FileEdit },
};

type StatusFilter = ReviewStatus | "all";
type AuthorFilter = "all" | "team" | "external";

export default function AdminArticlesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce so we don't hammer the endpoint on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminArticles({
        status: statusFilter === "all" ? null : statusFilter,
        authorType: authorFilter === "all" ? null : authorFilter,
        q: debouncedQuery || undefined,
      });
      setArticles(data);
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить статьи");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, authorFilter, debouncedQuery]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  // Reject dialog
  const [rejectSlug, setRejectSlug] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }

  const handleApprove = async (a: AdminArticle) => {
    setSavingSlug(a.slug);
    try {
      const updated = await approveArticle(a.slug);
      setArticles((prev) => prev.map((x) => (x.slug === a.slug ? { ...x, ...updated } : x)));
      toast.success(`Опубликовано: ${a.title}`);
    } catch (err: any) {
      toast.error(err?.message || "Не удалось одобрить");
    } finally {
      setSavingSlug(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectSlug || !rejectNote.trim()) return;
    setSavingSlug(rejectSlug);
    try {
      const updated = await rejectArticle(rejectSlug, rejectNote.trim());
      setArticles((prev) => prev.map((x) => (x.slug === rejectSlug ? { ...x, ...updated } : x)));
      toast.success("Статья отклонена");
      setRejectSlug(null);
      setRejectNote("");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось отклонить");
    } finally {
      setSavingSlug(null);
    }
  };

  const counts = useMemo(() => ({
    pending: articles.filter((a) => a.publication_status === "pending_review").length,
  }), [articles]);

  return (
    <CheckUser>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Статьи</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              Модерация и управление
              {counts.pending > 0 && (
                <Badge variant="tonal-primary-static" size="chip-small" className="ml-2">
                  {counts.pending} на проверке
                </Badge>
              )}
            </p>
          </div>
          <Button variant="outlined" size="small" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Обновить
          </Button>
        </div>

        {/* Filters */}
        <Card className="rounded-3xl border-(--outline) p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по заголовку…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-body-5 uppercase tracking-wider text-(--on-bg-low) self-center pr-1">Статус:</span>
            {(["all", "pending_review", "published", "rejected", "draft"] as StatusFilter[]).map((s) => (
              <Button
                key={s}
                size="chip-small"
                shape="round"
                variant={statusFilter === s ? "filled" : "tonal-card"}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "Все" : STATUS_META[s]?.label ?? s}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-body-5 uppercase tracking-wider text-(--on-bg-low) self-center pr-1">Автор:</span>
            <Button
              size="chip-small" shape="round"
              variant={authorFilter === "all" ? "filled" : "tonal-card"}
              onClick={() => setAuthorFilter("all")}
            >
              Все
            </Button>
            <Button
              size="chip-small" shape="round"
              variant={authorFilter === "team" ? "filled" : "tonal-card"}
              onClick={() => setAuthorFilter("team")}
            >
              <Users className="size-3.5" /> Команда
            </Button>
            <Button
              size="chip-small" shape="round"
              variant={authorFilter === "external" ? "filled" : "tonal-card"}
              onClick={() => setAuthorFilter("external")}
            >
              <User className="size-3.5" /> Внешние
            </Button>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6">
            <p className="text-body-4 text-(--error) mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>Повторить</Button>
          </Card>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-(--outline) h-40 animate-pulse bg-muted/30" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && articles.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">Ничего не найдено.</p>
          </Card>
        )}

        {/* List */}
        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {articles.map((a) => {
              const meta = STATUS_META[a.publication_status] ?? STATUS_META.draft;
              const Icon = meta.icon;
              const saving = savingSlug === a.slug;
              const canApprove = a.publication_status === "pending_review" || a.publication_status === "rejected";
              const canReject = a.publication_status === "pending_review" || a.publication_status === "published";

              return (
                <Card key={a.id} className="rounded-3xl border-(--outline) p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    {/* Cover thumb */}
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt=""
                        className="size-16 rounded-2xl object-cover border border-(--outline) shrink-0"
                      />
                    ) : (
                      <div className="size-16 rounded-2xl bg-(--primary-glass) shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="tonal-card-static" size="chip-small" className={cn("gap-1", meta.className)}>
                          <Icon className="size-3" />
                          {meta.label}
                        </Badge>
                        {a.is_team_author && (
                          <Badge variant="tonal-primary-static" size="chip-small" className="gap-1">
                            <Users className="size-3" />
                            Команда
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-heading-4 truncate">{a.title}</h3>
                      <p className="text-body-5 text-(--on-bg-low) mt-0.5">
                        {a.author?.name || a.author?.username || "—"} ·{" "}
                        {new Date(a.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {a.description && (
                    <p className="text-body-4 text-(--on-bg-medium) line-clamp-2">{a.description}</p>
                  )}

                  {a.publication_status === "rejected" && a.review_note && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-rose-500/80 mb-0.5">
                        Причина отклонения
                      </p>
                      <p className="text-body-4 text-(--on-bg-high)">{a.review_note}</p>
                      {a.reviewed_by && (
                        <p className="text-body-6 text-(--on-bg-low) mt-1">
                          — {a.reviewed_by.name || a.reviewed_by.username || "admin"}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-(--outline)">
                    {canApprove && (
                      <Button size="small" onClick={() => handleApprove(a)} disabled={saving}>
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                        Одобрить
                      </Button>
                    )}
                    {canReject && (
                      <Button
                        size="small"
                        variant="glass-red"
                        onClick={() => { setRejectSlug(a.slug); setRejectNote(""); }}
                        disabled={saving}
                      >
                        <XCircle className="size-4" />
                        Отклонить
                      </Button>
                    )}
                    <Button size="small" variant="outlined" asChild className="ml-auto">
                      <Link href={`/app/profile/articles/${a.slug}/preview`} target="_blank">
                        <ExternalLink className="size-4" />
                        Открыть
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject dialog */}
      <Dialog open={!!rejectSlug} onOpenChange={(open) => { if (!open) { setRejectSlug(null); setRejectNote(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отклонить статью</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel>Причина отклонения <span className="text-destructive">*</span></FieldLabel>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Что автору нужно поправить?"
              className="min-h-[100px]"
            />
          </Field>
          <DialogFooter>
            <Button variant="outlined" onClick={() => { setRejectSlug(null); setRejectNote(""); }}>
              Отмена
            </Button>
            <Button
              variant="glass-red"
              onClick={confirmReject}
              disabled={!rejectNote.trim() || savingSlug === rejectSlug}
            >
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}
