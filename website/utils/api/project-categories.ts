import { $fetch } from "@/utils/fetch";

export interface ProjectCategory {
  id: string;
  code: string;
  label: string;
}

export async function fetchProjectCategoriesAdmin(): Promise<ProjectCategory[]> {
  const res = await $fetch("/api/v1/admin/projects/categories", { isToast: false });
  if (!Array.isArray(res?.json)) return [];
  return res.json as ProjectCategory[];
}

export async function createProjectCategory(label: string): Promise<ProjectCategory> {
  const res = await $fetch("/api/v1/admin/projects/categories", {
    method: "POST",
    body: JSON.stringify({ label }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) {
    throw new Error(res?.json?.detail || "Failed to create category");
  }
  return res.json as ProjectCategory;
}
