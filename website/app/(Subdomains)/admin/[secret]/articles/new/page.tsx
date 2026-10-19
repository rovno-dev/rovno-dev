"use client";
import { use } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";

export default function AdminNewArticlePage({ params }: { params: Promise<{ secret: string }> }) {
  const { secret } = use(params);
  return (
    <CheckUser>
      <ArticleEditorForm basePath={`/admin/${secret}/articles`} />
    </CheckUser>
  );
}
