import { $fetch } from "@/utils/fetch";

/**
 * Shared shape for the two project taxonomies (categories and roles).
 * `labels` is a {lang: display_string} map; `en` is always present.
 */
export interface Taxonomy {
  id: string;
  code: string;
  labels: Record<string, string>;
  /** Legacy field — mirrors labels.en. */
  label: string;
}

/** Pick the best label for the given language, falling back to English. */
export function pickLabel(
  t: Taxonomy | { labels?: Record<string, string> | null; label?: string | null; code?: string },
  lang: string,
): string {
  const labels = t.labels || {};
  return labels[lang] || labels.en || t.label || t.code || "";
}

// ── Categories ────────────────────────────────────────────────────────────

export async function fetchProjectCategories(): Promise<Taxonomy[]> {
  const res = await $fetch("/api/v1/categories/projects", { isToast: false });
  return Array.isArray(res?.json) ? (res.json as Taxonomy[]) : [];
}

export async function fetchProjectCategoriesAdmin(): Promise<Taxonomy[]> {
  const res = await $fetch("/api/v1/admin/project-categories", { isToast: false });
  return Array.isArray(res?.json) ? (res.json as Taxonomy[]) : [];
}

export async function createProjectCategory(
  payload: { code?: string; label?: string; labels?: Record<string, string> },
): Promise<Taxonomy> {
  const res = await $fetch("/api/v1/admin/project-categories", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create category");
  return res.json as Taxonomy;
}

export async function updateProjectCategory(
  id: string,
  payload: { code?: string; labels?: Record<string, string> },
): Promise<Taxonomy> {
  const res = await $fetch(`/api/v1/admin/project-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update");
  return res.json as Taxonomy;
}

export async function deleteProjectCategory(id: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/project-categories/${id}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete");
}

// ── Roles ─────────────────────────────────────────────────────────────────

export async function fetchProjectRoles(): Promise<Taxonomy[]> {
  const res = await $fetch("/api/v1/categories/roles", { isToast: false });
  return Array.isArray(res?.json) ? (res.json as Taxonomy[]) : [];
}

export async function fetchProjectRolesAdmin(): Promise<Taxonomy[]> {
  const res = await $fetch("/api/v1/admin/project-roles", { isToast: false });
  return Array.isArray(res?.json) ? (res.json as Taxonomy[]) : [];
}

export async function createProjectRole(
  payload: { code?: string; label?: string; labels?: Record<string, string> },
): Promise<Taxonomy> {
  const res = await $fetch("/api/v1/admin/project-roles", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create role");
  return res.json as Taxonomy;
}

export async function updateProjectRole(
  id: string,
  payload: { code?: string; labels?: Record<string, string> },
): Promise<Taxonomy> {
  const res = await $fetch(`/api/v1/admin/project-roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update");
  return res.json as Taxonomy;
}

export async function deleteProjectRole(id: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/project-roles/${id}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete");
}
