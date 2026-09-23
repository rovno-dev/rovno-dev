"use client";
import { useEffect, useState, use } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
import { fetchArticleClient, type Article } from "@/utils/api/articles";
export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
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
          Loading…
        </div>
      ) : article ? (
        <ArticleEditorForm initial={article} />
      ) : (
        <div className="text-body-3 text-(--on-bg-medium)">Article not found.</div>
      )}
    </CheckUser>
  );
}
