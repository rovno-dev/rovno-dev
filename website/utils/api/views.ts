import { $fetch } from "@/utils/fetch";

export type ViewEntityType = "project" | "article" | "event";

interface ViewsResponse {
  entity_type: string;
  entity_id: string;
  view_count: number;
}

/**
 * Register a view and return the new total.
 * Uses a persistent `viewer_id` in localStorage to deduplicate across
 * reloads, even if the user's IP changes (e.g., mobile networks).
 */
export async function hitView(
  entityType: ViewEntityType,
  entityId: string,
): Promise<number | null> {
  let viewerId = typeof window !== "undefined" ? localStorage.getItem("viewer_id") : null;

  if (!viewerId && typeof window !== "undefined") {
    // Generate a fallback identifier if crypto.randomUUID is unavailable.
    viewerId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("viewer_id", viewerId);
  }

  const res = await $fetch(
    `/api/v1/views/${entityType}/${encodeURIComponent(entityId)}/hit`,
    {
      method: "POST",
      headers: viewerId ? { "X-Viewer-Id": viewerId } : {},
      isToast: false,
    },
  );

  if (!res?.response?.ok) return null;
  const body = res.json as ViewsResponse | undefined;
  return typeof body?.view_count === "number" ? body.view_count : null;
}
