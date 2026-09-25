import React from "react";
import { AlxProjectPage } from "./alx-project-page";
import { BreadProjectPage } from "./bread-project-page";
import type { ProjectTagKind } from "@/components/ui/project-tag-chip";

/**
 * Normalized input handed to every bespoke renderer. This is the union of
 * every field any template might need — each renderer picks the ones it
 * cares about and ignores the rest. Because the shape is shared, routing
 * a new project to an existing template is a one-line change in the DB.
 */
export interface CustomPageContext {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  coverVideo?: string;
  href?: string;
  category?: string;
  categoryLabel?: string;
  clientName?: string;
  period?: string;
  platform?: string;
  techStack: string[];
  tags: { id: string; kind: ProjectTagKind; label: string; meta?: string | null }[];
  media: { id: string; type: "image" | "video"; url: string; caption?: string | null }[];
  /** Compiled MDX body. ALX ignores this — its content is baked into the component. */
  content: React.ReactNode;
}

export interface CustomPageRenderer {
  key: string;
  render: (ctx: CustomPageContext) => React.ReactNode;
}

export const CUSTOM_PAGE_RENDERERS: CustomPageRenderer[] = [
  {
    key: "alx",
    render: (ctx) => (
      <AlxProjectPage
        project={{
          title: ctx.title,
          description: ctx.description,
          cover: { imageSrc: ctx.coverImage, videoSrc: ctx.coverVideo },
          href: ctx.href,
          period: ctx.period,
          techStack: ctx.techStack,
        }}
      />
    ),
  },
  {
    key: "bread",
    render: (ctx) => (
      <BreadProjectPage
        project={{
          title: ctx.title,
          shortDescription: ctx.shortDescription,
          description: ctx.description,
          coverImage: ctx.coverImage,
          coverVideo: ctx.coverVideo,
          href: ctx.href,
          period: ctx.period,
          clientName: ctx.clientName,
          platform: ctx.platform,
          techStack: ctx.techStack,
          tags: ctx.tags,
          media: ctx.media,
        }}
        content={ctx.content}
      />
    ),
  },
];

export function findCustomPageRenderer(
  key: string | null | undefined,
): CustomPageRenderer | null {
  if (!key) return null;
  return CUSTOM_PAGE_RENDERERS.find((r) => r.key === key) ?? null;
}
