import { notFound } from "next/navigation";
import { cache } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import fs from "fs";
import matter from "gray-matter";

import { Container } from "@/components/ui/container";
import { Project, PROJECTS } from "@/app/_data/projects";
import { getAllProjects } from "@/app/_data/projects/parser";
import { CLIENTS } from "@/app/_data/clients";
import { PROJECT_CATEGORIES } from "@/app/_data/categories";
import { PROJECT_TAGS } from "@/app/_data/project-tags";

import { AlxProjectPage } from "./_components/alx-project-page";
import { BreadProjectPage } from "./_components/bread-project-page";
import { GithubReadmeBlock } from "./_components/github-readme-block";
import {
  CustomProjectPage,
  type RelatedRef,
} from "./_components/custom-project-page";

import {
  Gallery,
  MetricCard,
  MDXHeading,
  MDXImage,
  MDXBlockquote,
  MDXCode,
  MDXPre,
  MDXList,
  MDXListItem,
  MDXParagraph,
  MDXHr,
  MDXLink,
  MDXTable,
  MDXThead,
  MDXTh,
  MDXTd,
  MDXCard,
} from "@/components/mdx";
import { Callout, PullQuote, StatRow } from "@/components/mdx/editorial";

export const revalidate = 60;

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

interface DBProjectTag {
  id: string;
  kind: "from_chief" | "license" | "github" | "custom";
  label: string;
  value?: any;
  sort_order: number;
}

interface DBProjectMedia {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  sort_order: number;
}

interface DBProject {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  description?: string;
  cover_image_src: string;
  cover_video_src?: string | null;
  href?: string | null;
  category?: { code: string; label: string } | null;
  platform?: string | null;
  period?: string | null;
  tech_stack?: string[] | null;
  mdx_content?: string | null;
  publication_status: string;
  tags: DBProjectTag[];
  media: DBProjectMedia[];
}

async function fetchDbProject(slug: string): Promise<DBProject | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/projects/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } } as any,
    );
    if (!res.ok) return null;
    return (await res.json()) as DBProject;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const mdxProjects = getAllProjects();
  const dataProjects = Object.values(PROJECTS);
  const seen = new Set<string>();
  const all = [...mdxProjects, ...dataProjects].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  return all.map((project) => ({ slug: project.slug }));
}

const components = {
  h1: (props: any) => <MDXHeading level={1} {...props} />,
  h2: (props: any) => <MDXHeading level={2} {...props} />,
  h3: (props: any) => <MDXHeading level={3} {...props} />,
  h4: (props: any) => <MDXHeading level={4} {...props} />,
  h5: (props: any) => <MDXHeading level={5} {...props} />,
  h6: (props: any) => <MDXHeading level={6} {...props} />,
  img: MDXImage,
  blockquote: MDXBlockquote,
  code: MDXCode,
  pre: MDXPre,
  ul: (props: any) => <MDXList ordered={false} {...props} />,
  ol: (props: any) => <MDXList ordered={true} {...props} />,
  li: MDXListItem,
  p: MDXParagraph,
  hr: MDXHr,
  a: MDXLink,
  table: MDXTable,
  thead: MDXThead,
  th: MDXTh,
  td: MDXTd,
  Card: MDXCard,
  Gallery,
  MetricCard,
  Callout,
  PullQuote,
  StatRow,
};

const getCompiledMDX = cache(async (content: string) => {
  const { content: compiled } = await compileMDX({
    source: content,
    components,
    options: { parseFrontmatter: false },
  });
  return compiled;
});

function buildRelated(currentSlug: string, limit = 3): RelatedRef[] {
  return Object.values(PROJECTS)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      coverImage: p.cover.imageSrc,
      categoryLabel: PROJECT_CATEGORIES.find((c) => c.code === p.category)?.label,
    }));
}

/** Compile an MDX file's body into React nodes, ready to drop into the page. */
async function loadMdxBody(slug: string): Promise<React.ReactNode> {
  const filePath = path.join(
    process.cwd(),
    "_data/projects/content",
    `${slug}.mdx`,
  );
  let source: string | undefined;
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
  const { content } = matter(source);
  return getCompiledMDX(content);
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // ── 1. alx — dedicated art-directed page with the glitch treatment. ────
  if (slug === "alx") {
    const fallback = PROJECTS[slug] as Project | undefined;
    if (fallback) {
      return (
        <AlxProjectPage
          project={{
            title: fallback.title,
            description: fallback.description,
            cover: fallback.cover,
            href: fallback.href,
            period: fallback.period,
            techStack: fallback.techStack,
          }}
        />
      );
    }
  }

  // ── 2. bread — warm, film-first bespoke page. ─────────────────────────
  if (slug === "bread") {
    const project = PROJECTS[slug] as Project | undefined;
    if (project) {
      const content = await loadMdxBody(slug);
      return (
        <BreadProjectPage
          project={{
            title: project.title,
            shortDescription: project.shortDescription || "",
            description: project.description || "",
            coverImage: project.cover.imageSrc,
            coverVideo: project.cover.videoSrc,
            href: project.href,
            period: project.period,
            clientName: CLIENTS[project.clientId]?.name,
            platform: project.platform,
            techStack: project.techStack || [],
            tags: (PROJECT_TAGS[slug] || []).map((t) => ({
              id: t.id,
              kind: t.kind,
              label: t.label,
              meta: t.meta ?? null,
            })),
            media: [], // gallery is rendered inline from the MDX <Gallery /> block
          }}
          content={content}
        />
      );
    }
  }

  // ── 3. Everything else: MDX/hardcoded/DB → shared premium shell. ──────
  const mdxProjects = getAllProjects();
  const mdxProject = mdxProjects.find((p) => p.slug === slug);
  const fallbackProject = PROJECTS[slug] as Project | undefined;
  const projectData = mdxProject || fallbackProject;
  const dbProject = !projectData ? await fetchDbProject(slug) : null;

  if (!projectData && !dbProject) notFound();

  // DB-only project (created through the admin panel).
  if (dbProject) {
    const mdxContent = dbProject.mdx_content
      ? await getCompiledMDX(dbProject.mdx_content)
      : null;

    return (
      <>
        <CustomProjectPage
          project={{
            slug: dbProject.slug,
            title: dbProject.title,
            shortDescription:
              dbProject.short_description || dbProject.description || "",
            description:
              dbProject.description || dbProject.short_description || "",
            coverImage: dbProject.cover_image_src,
            coverVideo: dbProject.cover_video_src || undefined,
            href: dbProject.href || undefined,
            category: dbProject.category?.code,
            categoryLabel: dbProject.category?.label,
            clientName: undefined,
            period: dbProject.period || undefined,
            platform: dbProject.platform || undefined,
            techStack: dbProject.tech_stack || [],
            tags: (dbProject.tags || []).map((t) => ({
              id: t.id,
              kind: t.kind as "from_chief" | "license" | "github" | "custom",
              label: t.label,
              meta: t.value?.author ?? null,
            })),
            media: (dbProject.media || []).map((m) => ({
              id: m.id,
              type: m.type,
              url: m.url,
              caption: m.caption ?? null,
            })),
          }}
          content={mdxContent}
          related={buildRelated(dbProject.slug)}
        />
        {dbProject.tags
          .filter((t) => t.kind === "github" && t.value?.repo)
          .map((t) => (
            <Container key={t.id} className="pb-12">
              <GithubReadmeBlock repo={t.value.repo} branch={t.value.branch} />
            </Container>
          ))}
      </>
    );
  }

  // MDX or hardcoded → shared shell with the tag metadata from the map.
  const content = mdxProject ? await loadMdxBody(slug) : null;
  const client = projectData!.clientId ? CLIENTS[projectData!.clientId] : null;
  const categoryLabel = PROJECT_CATEGORIES.find(
    (c) => c.code === projectData!.category,
  )?.label;

  return (
    <CustomProjectPage
      project={{
        slug: projectData!.slug,
        title: projectData!.title,
        shortDescription:
          projectData!.shortDescription || projectData!.description || "",
        description: projectData!.description || "",
        coverImage: projectData!.cover.imageSrc,
        coverVideo: projectData!.cover.videoSrc,
        href: projectData!.href,
        category: projectData!.category,
        categoryLabel,
        clientName: client?.name,
        period: projectData!.period,
        platform: projectData!.platform,
        techStack: projectData!.techStack || [],
        tags: (PROJECT_TAGS[projectData!.slug] || []).map((t) => ({
          id: t.id,
          kind: t.kind,
          label: t.label,
          meta: t.meta ?? null,
        })),
        media: [],
      }}
      content={content}
      related={buildRelated(projectData!.slug)}
    />
  );
}
