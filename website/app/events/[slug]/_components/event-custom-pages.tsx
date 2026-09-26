import React from "react";
import { NashDevPage } from "./nash-dev-page";

/**
 * Registry for bespoke event landing templates. Same pattern as
 * custom-pages.tsx for projects — the admin picks a key via the event
 * editor's "Кастомная страница" dropdown, and the router dispatches to the
 * matching renderer.
 *
 * To add a new one:
 *   1. Create `<key>-page.tsx` in this folder.
 *   2. Add an entry below.
 *   3. Add the key + label to EVENT_CUSTOM_PAGES_META (edit) so the admin
 *      dropdown lists it.
 */

export interface EventCustomContext {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  coverVideo?: string;
  startAt?: string;
  endAt?: string;
  locationName?: string;
  address?: string;
  metro?: string;
  city?: string;
  price?: string;
  registrationUrl?: string;
  capacity?: number;
  tags: { id: string; name: string }[];
  content: React.ReactNode;
}

export interface EventCustomRenderer {
  key: string;
  render: (ctx: EventCustomContext) => React.ReactNode;
}

export const EVENT_CUSTOM_PAGE_RENDERERS: EventCustomRenderer[] = [
  {
    key: "nash-dev",
    render: (ctx) => <NashDevPage ctx={ctx} />,
  },
];

export function findEventCustomPageRenderer(
  key: string | null | undefined,
): EventCustomRenderer | null {
  if (!key) return null;
  return EVENT_CUSTOM_PAGE_RENDERERS.find((r) => r.key === key) ?? null;
}
