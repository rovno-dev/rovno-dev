import { $fetch } from "@/utils/fetch";

export interface ArticleAuthor {
  id: string;
  name?: string | null;
  surname?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}
export interface ArticleCategoryRef {
  id: string;
  code: string;
  label: string;
}
export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  tags?: string[] | null;
  publication_status: "draft" | "published" | string;
  category_id?: string | null;
  category?: ArticleCategoryRef | null;
  author_id?: string | null;
  author?: ArticleAuthor | null;
  created_at: string;
  updated_at: string;
}
export interface Article extends ArticleListItem {
  mdx_content: string;
  raw_json?: any;
  seo_title?: string | null;
  meta_description?: string | null;
}
export interface ArticlePayload {
  slug?: string;
  title: string;
  description?: string;
  image_url?: string;
  date?: string;
  tags?: string[];
  mdx_content: string;
  raw_json?: any;
  seo_title?: string | null;
  meta_description?: string | null;
  category_id?: string | null;
  publication_status?: "draft" | "published";
}

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

// LLM context: server-side fetchers used by RSC pages. They bypass the auth
// cookie and hit the internal API directly. `revalidate: 60` gives the blog
// a one-minute ISR window — good enough for a low-frequency blog, and the
// pages remain statically rendered for SEO.
export async function fetchPublishedArticlesServer(params?: {
  category?: string;
  tag?: string;
  limit?: number;
}): Promise<ArticleListItem[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.limit) qs.set("limit", String(params.limit));
  const url = `${API_BASE}/api/v1/articles${qs.toString() ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } } as any);
    if (!res.ok) return [];
    return (await res.json()) as ArticleListItem[];
  } catch {
    return [];
  }
}

export async function fetchArticleServer(slug: string): Promise<Article | null> {
  const url = `${API_BASE}/api/v1/articles/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } } as any);
    if (!res.ok) return null;
    return (await res.json()) as Article;
  } catch {
    return null;
  }
}

// ---------- Client-side (auth'd) ----------
export async function fetchMyArticles(): Promise<ArticleListItem[]> {
  const res = await $fetch("/api/v1/articles/me", { isToast: false });
  return res?.json || [];
}

export async function fetchArticleClient(slug: string): Promise<Article | null> {
  const res = await $fetch(`/api/v1/articles/${encodeURIComponent(slug)}`, { isToast: false });
  if (!res?.response?.ok) return null;
  return res.json as Article;
}

export async function createArticle(payload: ArticlePayload): Promise<Article> {
  const res = await $fetch("/api/v1/articles", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create article");
  return res.json as Article;
}

export async function updateArticle(slug: string, payload: Partial<ArticlePayload>): Promise<Article> {
  const res = await $fetch(`/api/v1/articles/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update article");
  return res.json as Article;
}

export async function deleteArticle(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/articles/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete article");
}

export async function publishArticle(slug: string): Promise<Article> {
  const res = await $fetch(`/api/v1/articles/${encodeURIComponent(slug)}/publish`, { method: "POST" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to publish");
  return res.json as Article;
}

export async function unpublishArticle(slug: string): Promise<Article> {
  const res = await $fetch(`/api/v1/articles/${encodeURIComponent(slug)}/unpublish`, { method: "POST" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to unpublish");
  return res.json as Article;
}
