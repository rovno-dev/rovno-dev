import { $fetch } from "@/utils/fetch";

export type ViewEntityType = "project" | "article" | "event";

interface ViewsResponse {
  entity_type: string;
  entity_id: string;
  view_count: number;
}

/**
 * Register a view and return the new total.
 *
 * The backend dedupes per IP for 24h, so calling this on every mount is
 * safe - a visitor who reloads ten times still contributes one view.
 * Returns null on failure so the caller can render a placeholder instead
 * of a fake number.
 */
export async function hitView(
  entityType: ViewEntityType,
  entityId: string,
): Promise<number | null> {
  const res = await $fetch(
    `/api/v1/views/${entityType}/${encodeURIComponent(entityId)}/hit`,
    { method: "POST", isToast: false },
  );
  if (!res?.response?.ok) return null;
  const body = res.json as ViewsResponse | undefined;
  return typeof body?.view_count === "number" ? body.view_count : null;
}
