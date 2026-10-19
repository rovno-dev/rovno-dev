import { $fetch } from "@/utils/fetch";

export interface Slide {
  id?: string;
  order: number;
  type: "cover" | "text" | "question" | "image" | "quote";
  content: {
    title?: string;
    subtitle?: string;
    text?: string;
    image_url?: string;
    bg_color?: string;
    text_color?: string;
  };
  notes?: string;
}

export interface Presentation {
  id: string;
  slug: string;
  title: string;
  description?: string;
  event_id?: string;
  starts_at?: string;
  ends_at?: string;
  is_published: boolean;
  slides: Slide[];
}

export async function fetchAdminPresentations(): Promise<Presentation[]> {
  const res = await $fetch("/api/v1/admin/presentations", { isToast: false });
  return Array.isArray(res?.json) ? res.json : [];
}

export async function fetchAdminPresentation(id: string): Promise<Presentation | null> {
  const res = await $fetch(`/api/v1/admin/presentations/${id}`, { isToast: false });
  return res?.response?.ok ? res.json : null;
}

export async function createPresentation(payload: any): Promise<Presentation> {
  const res = await $fetch("/api/v1/admin/presentations", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Error");
  return res.json;
}

export async function updatePresentation(id: string, payload: any): Promise<Presentation> {
  const res = await $fetch(`/api/v1/admin/presentations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  });
  if (!res?.response?.ok) throw new Error(res?.json?.detail || "Error");
  return res.json;
}

export async function deletePresentation(id: string): Promise<void> {
  await $fetch(`/api/v1/admin/presentations/${id}`, { method: "DELETE" });
}
