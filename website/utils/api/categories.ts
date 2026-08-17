import { $fetch } from "@/utils/fetch";

export interface ArticleCategory {
  id: string;
  code: string;
  label: string;
}
export interface ProjectCategory {
  id: string;
  code: string;
  label: string;
}

export async function fetchArticleCategories(): Promise<ArticleCategory[]> {
  const res = await $fetch("/api/v1/categories/articles", { isToast: false });
  return res?.json || [];
}

export async function fetchProjectCategories(): Promise<ProjectCategory[]> {
  const res = await $fetch("/api/v1/categories/projects", { isToast: false });
  return res?.json || [];
}
