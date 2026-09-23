"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckUser } from "@/entities/user/model/check-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import {
  ArticleListItem,
  fetchMyArticles,
  deleteArticle,
} from "@/utils/api/articles";
const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-500 border-amber-500/30",
};
export default function MyArticlesPage() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      setArticles(await fetchMyArticles());
    } catch {
      toast.error(t("editor.load_failed"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const handleDelete = async (slug: string) => {
    if (!confirm(t("editor.delete_confirm"))) return;
    try {
      await deleteArticle(slug);
      toast.success(t("editor.deleted"));
      setArticles((prev) => prev.filter((a) => a.slug !== slug));
    } catch {
      toast.error(t("editor.save_failed"));
    }
  };
  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">{t("editor.my_articles")}</h1>
            <p className="text-body-3 text-(--on-bg-medium)">{t("editor.my_articles_subtitle")}</p>
          </div>
          <Button asChild>
            <Link href="/app/profile/articles/new">
              <Plus className="size-4" />
              {t("editor.new_article")}
            </Link>
          </Button>
        </div>
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-20 rounded-3xl border-(--outline) bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}
        {!loading && articles.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">{t("editor.empty")}</p>
          </Card>
        )}
        {!loading && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map((a) => {
              const statusClass = STATUS_STYLES[a.publication_status] || STATUS_STYLES.draft;
              const statusLabel =
                a.publication_status === "published"
                  ? t("editor.status_published")
                  : t("editor.status_draft");
              return (
                <Card
                  key={a.id}
                  className="rounded-3xl border-(--outline) p-5 flex items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-body-5 text-(--on-bg-low)">
                        {new Date(a.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-heading-4 truncate">{a.title}</h3>
                    {a.description && (
                      <p className="text-body-4 text-(--on-bg-medium) line-clamp-1">{a.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {a.publication_status === "published" && (
                      <Button variant="text" size="icon-small" asChild title={t("editor.view")}>
                        <Link href={`/blog/${a.slug}`} target="_blank">
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                    )}
                    <Button variant="text" size="icon-small" asChild title={t("editor.edit")}>
                      <Link href={`/app/profile/articles/${a.slug}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="text"
                      size="icon-small"
                      onClick={() => handleDelete(a.slug)}
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
