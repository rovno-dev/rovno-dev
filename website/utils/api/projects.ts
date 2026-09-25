import { $fetch } from "@/utils/fetch";

export type ProjectTagKind = "from_chief" | "license" | "github" | "custom";

export interface ProjectTag {
  id?: string;
  kind: ProjectTagKind;
  label: string;
  value?: any;
  sort_order?: number;
}

export interface ProjectMedia {
  id?: string;
  type: "image" | "video";
  url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  sort_order?: number;
}

export interface ProjectDetail {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  href?: string | null;
  category_id?: string | null;
  category?: { id: string; code: string; label: string } | null;
  client_id?: string | null;
  platform?: string | null;
  period?: string | null;
  tech_stack?: string[] | null;
  mdx_content?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  is_featured: boolean;
  publication_status: string;
  tags: ProjectTag[];
  media: ProjectMedia[];
  created_at: string;
  updated_at: string;
}

export interface ProjectListAdmin extends ProjectDetail {
  has_media: boolean;
  media_count: number;
  is_admin_created: boolean;
}

export interface ProjectPayload {
  slug?: string;
  title: string;
  description?: string;
  short_description?: string;
  cover_image_src?: string;
  cover_video_src?: string;
  href?: string | null;
  category_id?: string | null;
  client_id?: string | null;
  platform?: string | null;
  period?: string | null;
  tech_stack?: string[];
  mdx_content?: string;
  seo_title?: string | null;
  meta_description?: string | null;
  is_featured?: boolean;
  publication_status?: "draft" | "published";
  tags?: ProjectTag[];
  media?: ProjectMedia[];
}

export async function fetchAdminProjects(params?: {
  q?: string;
  status?: string;
}): Promise<ProjectListAdmin[]> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  const url = `/api/v1/admin/projects${qs.toString() ? `?${qs}` : ""}`;
  const res = await $fetch(url, { isToast: false });
  if (!Array.isArray(res?.json)) return [];
  return res.json as ProjectListAdmin[];
}

export async function fetchAdminProject(slug: string): Promise<ProjectDetail | null> {
  const res = await $fetch(`/api/v1/admin/projects/${encodeURIComponent(slug)}`, { isToast: false });
  if (!res?.response?.ok) return null;
  return res.json as ProjectDetail;
}

export async function createProject(payload: ProjectPayload): Promise<ProjectDetail> {
  const res = await $fetch("/api/v1/admin/projects", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to create project");
  return res.json as ProjectDetail;
}

export async function updateProject(slug: string, payload: Partial<ProjectPayload>): Promise<ProjectDetail> {
  const res = await $fetch(`/api/v1/admin/projects/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to update project");
  return res.json as ProjectDetail;
}

export async function deleteProject(slug: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/projects/${encodeURIComponent(slug)}`, { method: "DELETE" });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Failed to delete project");
}

export async function fetchGithubReadme(repo: string, branch?: string): Promise<{ readme: string } | null> {
  const qs = new URLSearchParams({ repo });
  if (branch) qs.set("branch", branch);
  const res = await $fetch(`/api/v1/admin/projects/github-readme?${qs}`, { isToast: false });
  if (!res?.response?.ok) return null;
  return res.json;
}
