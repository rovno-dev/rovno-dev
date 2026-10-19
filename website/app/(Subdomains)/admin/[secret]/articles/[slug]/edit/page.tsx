"use client";
import { useEffect, useState, use } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { fetchArticleClient, type Article } from "@/utils/api/articles";
import { CircleNotchIcon } from "@phosphor-icons/react";

export default function AdminEditArticlePage({ params }: { params: Promise<{ secret: string, slug: string }> }) {
  const { secret, slug } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchArticleClient(slug)
      .then(setArticle)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <CheckUser>
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-body-3 text-(--on-bg-low) animate-pulse">
          <CircleNotchIcon className="size-5 animate-spin mr-2" />
          Загрузка...
        </div>
      ) : article ? (
        <ArticleEditorForm initial={article} basePath={`/admin/${secret}/articles`} />
      ) : (
        <div className="text-body-3 text-(--on-bg-medium)">Статья не найдена.</div>
      )}
    </CheckUser>
  );
}
