"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pencil, Eye, Loader2 } from "lucide-react";
import { fetchArticleClient, type Article } from "@/utils/api/articles";
import { ArticlePreviewBody } from "./_body";

/**
 * Author-facing draft preview.
 *
 * The public route at /blog/<slug> deliberately 404s on drafts — SSR has no
 * cookie to forward, so the backend treats the request as anonymous. This
 * route lives inside the authenticated app shell, uses the client-side
 * fetchArticleClient (which auto-refreshes the token), and renders whatever
 * the author owns regardless of publication_status.
 */
export default function PreviewArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, isLoading: userLoading } = useUser();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchArticleClient(slug)
      .then((a) => {
        if (cancelled) return;
        if (!a) setError("Статья не найдена или нет доступа.");
        else setArticle(a);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Не удалось загрузить статью.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, userLoading, user]);

  return (
    <CheckUser>
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-body-3 text-(--on-bg-low)">
          <Loader2 className="size-4 animate-spin mr-2" />
          Загрузка…
        </div>
      ) : !article ? (
        <Card className="rounded-3xl border-(--outline) p-6">
          <p className="text-body-3 text-(--on-bg-medium)">{error || "Article not found."}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="tonal-card-static" size="chip-small" className="gap-1">
                  <Eye className="size-3" />
                  Предпросмотр
                </Badge>
                <Badge
                  variant="tonal-card-static"
                  size="chip-small"
                  className={
                    article.publication_status === "published"
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                  }
                >
                  {article.publication_status === "published" ? "Опубликовано" : "Черновик"}
                </Badge>
              </div>
              <h1 className="text-display-3 truncate">{article.title}</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outlined" asChild>
                <Link href="/app/profile/articles">
                  <ArrowLeft className="size-4" />
                  К списку
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/app/profile/articles/${slug}/edit`}>
                  <Pencil className="size-4" />
                  Редактировать
                </Link>
              </Button>
            </div>
          </div>

          {/* Body renderer isolated in a client component — MDXEditor / MDX
              compilation needs to be its own boundary so the outer page can
              stay simple. */}
          <ArticlePreviewBody article={article} />
        </div>
      )}
    </CheckUser>
  );
}
