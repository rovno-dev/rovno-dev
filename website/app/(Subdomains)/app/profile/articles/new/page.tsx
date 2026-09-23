"use client";
import { CheckUser } from "@/entities/user/model/check-user";
import { ArticleEditorForm } from "@/components/editor/article-editor-form";
export default function NewArticlePage() {
  return (
    <CheckUser>
      <ArticleEditorForm />
    </CheckUser>
  );
}
