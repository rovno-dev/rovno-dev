/**
 * Client-safe list of every bespoke case-study renderer the site knows about.
 *
 * Kept separate from `custom-pages.tsx` (which imports the actual components)
 * so the admin editor can list templates without pulling both page bundles
 * into its own chunk.
 *
 * To add a new bespoke page:
 *   1. Create `website/app/projects/[slug]/_components/my-page.tsx`.
 *   2. Add a `{ key: "my-page", render: (ctx) => <MyPage {...} /> }` entry
 *      to CUSTOM_PAGE_RENDERERS in `custom-pages.tsx`.
 *   3. Add the matching key/label/description here.
 *   4. (optional) Seed a project with `custom_page = "my-page"` via the
 *      admin panel — no backend or DB change required.
 */

export interface CustomPageMeta {
  key: string;
  label: string;
  description: string;
}

export const CUSTOM_PAGES_META: CustomPageMeta[] = [
  {
    key: "alx",
    label: "ALX — glitch hero",
    description:
      "Lime/red glitch treatment, giant marquee, biomech palette. Content is hard-coded inside the template.",
  },
  {
    key: "bread",
    label: "Хлебная Страна — film-first",
    description:
      "Warm wheat palette, embedded film player, four-step process grid. Content is hard-coded inside the template.",
  },
];

export function findCustomPageMeta(
  key: string | null | undefined,
): CustomPageMeta | null {
  if (!key) return null;
  return CUSTOM_PAGES_META.find((m) => m.key === key) ?? null;
}
