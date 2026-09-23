import { $fetch } from "@/utils/fetch";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

export async function fetchTags(q?: string, limit = 200): Promise<Tag[]> {
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  qs.set("limit", String(limit));
  const res = await $fetch(`/api/v1/tags?${qs.toString()}`, { isToast: false });
  return (res?.json as Tag[]) || [];
}

export async function createTag(name: string): Promise<Tag> {
  const res = await $fetch("/api/v1/tags", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to create tag");
  }
  return res.json as Tag;
}
