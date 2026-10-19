export interface ServiceMeta {
  slug: string;
  iconKey: "palette" | "code" | "cube" | "film" | "megaphone" | "sparkle";
}

export const SERVICES_META: ServiceMeta[] = [
  { slug: "branding", iconKey: "palette" },
  { slug: "web-development", iconKey: "code" },
  { slug: "3d-motion", iconKey: "cube" },
  { slug: "video-production", iconKey: "film" },
  { slug: "promotion", iconKey: "megaphone" },
  { slug: "ux-ui", iconKey: "sparkle" },
];

export function findServiceMeta(slug: string): ServiceMeta | null {
  return SERVICES_META.find((s) => s.slug === slug) ?? null;
}
