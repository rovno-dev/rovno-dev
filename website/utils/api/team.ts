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
