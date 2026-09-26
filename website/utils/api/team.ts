import { $fetch } from "@/utils/fetch";

export interface TeamMemberPublic {
  id: string;
  user_id: string;
  role: string;
  bio?: string | null;
  cover_url?: string | null;
  sort_order: number;
}

export interface TeamMemberAdmin extends TeamMemberPublic {
  user_email?: string | null;
  user_name?: string | null;
  user_surname?: string | null;
  user_username?: string | null;
  user_avatar_url?: string | null;
  user_bio?: string | null;
  is_active: boolean;
  created_at?: string | null;
}

export interface TeamMemberProject {
  project_id: string;
  role_on_project?: string | null;
  title?: string | null;
  slug?: string | null;
  period?: string | null;
}

export interface ProjectPickerItem {
  id: string;
  slug: string;
  title: string;
  period?: string | null;
}

export async function fetchTeamMemberByUsername(
  username: string
): Promise<TeamMemberPublic | null> {
  const res = await $fetch(
    `/api/v1/team/by-username/${encodeURIComponent(username)}`,
    { isToast: false }
  );
  if (!res?.response?.ok) return null;
  return res.json as TeamMemberPublic;
}

export async function fetchTeamMembers(
  includeInactive = false
): Promise<TeamMemberAdmin[]> {
  const res = await $fetch(
    `/api/v1/admin/team?include_inactive=${includeInactive}`,
    { isToast: false }
  );
  if (res?.response?.status === 401)
    throw new Error("Session expired. Please sign in again.");
  if (!res?.response?.ok)
    throw new Error(res?.json?.detail || `Request failed (${res?.response?.status ?? "network"})`);
  if (!Array.isArray(res.json))
    throw new Error("Unexpected response from server.");
  return res.json as TeamMemberAdmin[];
}

export async function makeTeamMember(
  userId: string,
  data: {
    role: string;
    bio?: string;
    cover_url?: string;
    sort_order?: number;
  }
): Promise<TeamMemberAdmin> {
  const res = await $fetch(`/api/v1/admin/team/users/${userId}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok)
    throw new Error(res?.json?.detail || "Failed to add team member");
  return res.json as TeamMemberAdmin;
}

export async function updateTeamMember(
  userId: string,
  data: {
    role?: string;
    bio?: string | null;
    cover_url?: string | null;
    sort_order?: number;
    is_active?: boolean;
    /** Applied to the linked user. Required for the member to appear on
     *  /about and to have a working /<username> profile. */
    username?: string | null;
  }
): Promise<TeamMemberAdmin> {
  const res = await $fetch(`/api/v1/admin/team/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok)
    throw new Error(res?.json?.detail || "Failed to update team member");
  return res.json as TeamMemberAdmin;
}

export async function removeTeamMember(userId: string): Promise<void> {
  const res = await $fetch(`/api/v1/admin/team/users/${userId}`, {
    method: "DELETE",
  });
  if (!res?.response?.ok)
    throw new Error(res?.json?.detail || "Failed to remove team member");
}

export async function fetchTeamMemberProjects(
  userId: string
): Promise<TeamMemberProject[]> {
  const res = await $fetch(`/api/v1/admin/team/users/${userId}/projects`, {
    isToast: false,
  });
  if (res?.response?.status === 401)
    throw new Error("Session expired. Please sign in again.");
  if (!res?.response?.ok)
    throw new Error(res?.json?.detail || "Failed to load projects");
  if (!Array.isArray(res.json)) return [];
  return res.json as TeamMemberProject[];
}

export async function setTeamMemberProjects(
  userId: string,
  projects: Array<{ project_id: string; role_on_project?: string | null }>
): Promise<TeamMemberProject[]> {
  const res = await $fetch(`/api/v1/admin/team/users/${userId}/projects`, {
    method: "PUT",
    body: JSON.stringify({ projects }),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok)
    throw new Error(res?.json?.detail || "Failed to update projects");
  return res.json as TeamMemberProject[];
}

export async function fetchProjectsForPicker(): Promise<ProjectPickerItem[]> {
  const res = await $fetch("/api/v1/admin/projects", { isToast: false });
  if (!Array.isArray(res?.json)) return [];
  return res.json as ProjectPickerItem[];
}

/** A project linked to a team member, as exposed by the public team API. */
export interface TeamMemberPublicProject {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  period?: string | null;
  role_on_project?: string | null;
  category_label?: string | null;
}

/**
 * Public list of projects a team member is pinned to. Rendered on the expert
 * profile. Returns [] on any failure so the page never blanks out.
 */
export async function fetchTeamMemberProjectsPublic(
  username: string,
): Promise<TeamMemberPublicProject[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/team/by-username/${encodeURIComponent(username)}/projects`,
      { next: { revalidate: 60 } } as any,
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? (body as TeamMemberPublicProject[]) : [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Server-side fetchers. Used by Server Components (about page, expert page).
// Plain `fetch` with ISR — no $fetch, no cookie storage, no client deps.
// ─────────────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

export interface PublicTeamMember {
  id: string;
  user_id: string;
  username: string;
  name: string | null;
  surname: string | null;
  role: string;
  bio: string | null;
  cover_url: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  sort_order: number;
  project_count: number;
}

export interface TeamMemberPublicProject {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  cover_image_src: string;
  cover_video_src: string | null;
  period: string | null;
  role_on_project: string | null;
  category_label: string | null;
}

export async function fetchPublicTeamServer(): Promise<PublicTeamMember[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/team`, {
      next: { revalidate: 60 },
    } as any);
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? (body as PublicTeamMember[]) : [];
  } catch {
    return [];
  }
}

export async function fetchTeamMemberServer(
  username: string,
): Promise<PublicTeamMember | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/team/by-username/${encodeURIComponent(username)}`,
      { next: { revalidate: 60 } } as any,
    );
    if (!res.ok) return null;
    return (await res.json()) as PublicTeamMember;
  } catch {
    return null;
  }
}

export async function fetchTeamMemberProjectsServer(
  username: string,
): Promise<TeamMemberPublicProject[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/team/by-username/${encodeURIComponent(username)}/projects`,
      { next: { revalidate: 60 } } as any,
    );
    if (!res.ok) return [];
    const body = await res.json();
    return Array.isArray(body) ? (body as TeamMemberPublicProject[]) : [];
  } catch {
    return [];
  }
}
