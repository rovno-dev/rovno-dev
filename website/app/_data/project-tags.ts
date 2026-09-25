/**
 * Per-slug tag metadata for MDX/hardcoded projects. The DB-backed projects
 * carry their own `tags` array from the backend; this map is what the
 * filesystem-backed ones (which have no backend row) fall back to.
 *
 * Each entry uses the same shape the DB serializer emits, so the tag chip
 * component doesn't care where the tag came from.
 */
export interface ProjectTagMeta {
  id: string;
  kind: "from_chief" | "license" | "github" | "custom";
  label: string;
  meta?: string | null;
}

export const PROJECT_TAGS: Record<string, ProjectTagMeta[]> = {
  bread: [
    {
      id: "bread-from-chief",
      kind: "from_chief",
      label: "From Chief",
      meta: "Данил Киткин",
    },
    {
      id: "bread-custom-3d",
      kind: "custom",
      label: "3D / Motion",
    },
    {
      id: "bread-custom-identity",
      kind: "custom",
      label: "Identity",
    },
  ],
  alx: [
    {
      id: "alx-from-chief",
      kind: "from_chief",
      label: "From Chief",
      meta: "Данил Киткин",
    },
  ],
  sadovod: [
    {
      id: "sadovod-custom",
      kind: "custom",
      label: "E-commerce",
    },
  ],
  vanguard: [
    {
      id: "vanguard-custom",
      kind: "custom",
      label: "E-commerce",
    },
  ],
  concord: [
    {
      id: "concord-custom",
      kind: "custom",
      label: "Corporate",
    },
  ],
  courtElegance: [
    {
      id: "courtElegance-custom",
      kind: "custom",
      label: "E-commerce",
    },
  ],
  "lost-play": [
    {
      id: "lost-play-from-chief",
      kind: "from_chief",
      label: "From Chief",
      meta: "Данил Киткин",
    },
  ],
};
