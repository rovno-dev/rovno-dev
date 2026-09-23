import { $fetch } from "@/utils/fetch";

export interface ArticleAuthor {
  id: string;
  name?: string | null;
  surname?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

export interface TagRef {
  id: string;
  name: string;
  slug: string;
}

/**
 * Legacy compatibility shim.
 *
 * Before the tags migration the backend sent `tags: string[]`. After it,
 * `tags: {id, name, slug}[]`. Anything fetched during the transition (or if
 * the backend hasn't been rebuilt yet) can be either shape. Normalize at
 * the boundary so the rest of the app has one contract to rely on.
 *
 * The synthetic id/slug for legacy strings is deterministic, so React keys
 * stay stable across re-renders and the tag filter still functions.
 */
function normalizeTag(raw: unknown): TagRef {
  if (typeof raw === "string") {
    const name = raw.trim();
    return {
      id: `legacy:${name.toLowerCase()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    };
  }
  const obj = (raw ?? {}) as Partial<TagRef> & { name?: string; id?: string };
  const name = String(obj.name ?? "").trim();
  return {
    id: String(obj.id ?? `legacy:${name.toLowerCase()}`),
    name,
    slug: String(obj.slug ?? name.toLowerCase().replace(/\s+/g, "-")),
  };
}

function normalizeTags(list: unknown): TagRef[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeTag).filter((t) => t.name.length > 0);
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  tags?: TagRef[] | null;
  publication_status: "draft" | "pending_review" | "published" | "rejected" | string;
  review_note?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: { id: string; name?: string | null; username?: string | null } | null;
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

// Review workflow fields are already part of the backend response; the
// frontend picks them up here. publication_status may be any of:
//   draft | pending_review | published | rejected

export interface ArticlePayload {
  slug?: string;
  title: string;
  description?: string;
  image_url?: string;
  date?: string;
  /** Tag names — backend upserts into the tags table. */
  tags?: string[];
  mdx_content: string;
  raw_json?: any;
  seo_title?: string | null;
  meta_description?: string | null;
  publication_status?: "draft" | "published";
}

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

// Server-side fetchers used by RSC pages. `revalidate: 60` gives the blog
// a one-minute ISR window — good enough for a low-frequency blog, and the
// pages remain statically rendered for SEO.
export async function fetchPublishedArticlesServer(params?: {
  tag?: string;
  limit?: number;
}): Promise<ArticleListItem[]> {
  const qs = new URLSearchParams();
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.limit) qs.set("limit", String(params.limit));
  const url = `${API_BASE}/api/v1/articles${qs.toString() ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } } as any);
    if (!res.ok) return [];
    const body = await res.json();
    if (!Array.isArray(body)) return [];
    return (body as ArticleListItem[]).map((a) => ({ ...a, tags: normalizeTags(a.tags) }));
  } catch {
    return [];
  }
}

export async function fetchArticleServer(slug: string): Promise<Article | null> {
  const url = `${API_BASE}/api/v1/articles/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } } as any);
    if (!res.ok) return null;
    const data = (await res.json()) as Article;
    return { ...data, tags: normalizeTags(data.tags) };
  } catch {
    return null;
  }
}

// ---------- Client-side (auth'd) ----------
export async function fetchMyArticles(): Promise<ArticleListItem[]> {
  const res = await $fetch("/api/v1/articles/me", { isToast: false });
  const status = res?.response?.status;
  const body = res?.json;

  // Surface auth failures distinctly so the UI can say "log in again"
  // rather than "you have no articles".
  if (status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }
  if (!res?.response?.ok) {
    const detail =
      (typeof body === "object" && (body?.detail || body?.message)) ||
      `Request failed (${status ?? "network error"})`;
    throw new Error(String(detail));
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected response from server — expected a list.");
  }
  return (body as ArticleListItem[]).map((a) => ({ ...a, tags: normalizeTags(a.tags) }));
}

export async function fetchArticleClient(slug: string): Promise<Article | null> {
  const res = await $fetch(`/api/v1/articles/${encodeURIComponent(slug)}`, { isToast: false });
  // 401 after the $fetch refresh attempt → session is dead; the caller
  // should show "log in" rather than a fake "not found".
  if (res?.response?.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }
  if (!res?.response?.ok) return null;
  const data = res.json as Article;
  return { ...data, tags: normalizeTags(data.tags) };
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
