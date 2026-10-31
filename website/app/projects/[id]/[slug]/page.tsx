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
import type { ProjectTagKind } from "@/components/ui/project-tag-chip";
import { GithubReadmeBlock } from "./_components/github-readme-block";
import {
  CustomProjectPage,
  type RelatedRef,
} from "./_components/custom-project-page";
import {
  findCustomPageRenderer,
  type CustomPageContext,
} from "./_components/custom-pages";
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

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

interface DBProjectTag {
  id: string;
  kind: string;
  label: string;
  value?: any;
}

interface DBProjectMedia {
  id: string;
  type: "image" | "video";
  url: string;
  caption?: string | null;
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
  seo_title?: string | null;
  meta_description?: string | null;
  publication_status: string;
  custom_page?: string | null;
  tags: DBProjectTag[];
  media: DBProjectMedia[];
}

async function fetchDbProject(slug: string): Promise<DBProject | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/projects/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60, tags: ["projects"] } } as any,
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
  return all.map((project) => ({ id: project.id, slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  const dbProject = await fetchDbProject(slug);
  const mdxProject = getAllProjects().find((p) => p.slug === slug);
  const fallbackProject = PROJECTS[slug];

  let title = "Проект Rovno.dev";
  let description = "Кейс цифрового агентства Rovno.dev";
  let image = `/api/og/project/${slug}`;
  let seoTitle: string | null = null;
  let seoDescription: string | null = null;

  if (dbProject) {
    seoTitle = dbProject.seo_title || null;
    seoDescription = dbProject.meta_description || null;
    title = dbProject.title;
    description = dbProject.short_description || dbProject.description || description;
    if (dbProject.cover_image_src) image = dbProject.cover_image_src;
  } else if (mdxProject) {
    title = mdxProject.title;
    description = mdxProject.shortDescription || mdxProject.description || description;
    if (mdxProject.cover?.imageSrc) image = mdxProject.cover.imageSrc;
  } else if (fallbackProject) {
    title = fallbackProject.title;
    description = fallbackProject.shortDescription || fallbackProject.description || description;
    if (fallbackProject.cover?.imageSrc) image = fallbackProject.cover.imageSrc;
  }

  return {
    title: seoTitle || `${title} · Rovno.dev`,
    description: seoDescription || description,
    openGraph: {
      title: seoTitle || title,
      description: seoDescription || description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle || title,
      description: seoDescription || description,
      images: [image],
    },
  };
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

function buildRelated(currentSlug: string, limit = 3): RelatedRef[] {
  return Object.values(PROJECTS)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      coverImage: p.cover.imageSrc,
      categoryLabel: PROJECT_CATEGORIES.find((c) => c.code === p.category)?.label,
    }));
}

function dbToContext(
  db: DBProject,
  content: React.ReactNode,
): CustomPageContext {
  return {
    slug: db.slug,
    title: db.title,
    shortDescription: db.short_description || db.description || "",
    description: db.description || db.short_description || "",
    coverImage: db.cover_image_src,
    coverVideo: db.cover_video_src || undefined,
    href: db.href || undefined,
    category: db.category?.code,
    categoryLabel: db.category?.label,
    clientName: undefined,
    period: db.period || undefined,
    platform: db.platform || undefined,
    techStack: db.tech_stack || [],
    tags: (db.tags || []).map((t) => ({
      id: t.id,
      kind: t.kind as ProjectTagKind,
      label: t.label,
      meta: t.value?.author ?? null,
    })),
    media: (db.media || []).map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
      caption: m.caption ?? null,
    })),
    content,
  };
}

function staticToContext(
  project: Project,
  content: React.ReactNode,
): CustomPageContext {
  const client = project.clientId ? CLIENTS[project.clientId] : null;
  const categoryLabel = PROJECT_CATEGORIES.find(
    (c) => c.code === project.category,
  )?.label;

  return {
    slug: project.slug,
    title: project.title,
    shortDescription: project.shortDescription || project.description || "",
    description: project.description || "",
    coverImage: project.cover.imageSrc,
    coverVideo: project.cover.videoSrc,
    href: project.href,
    category: project.category,
    categoryLabel,
    clientName: client?.name,
    period: project.period,
    platform: project.platform,
    techStack: project.techStack || [],
    tags: (PROJECT_TAGS[project.slug] || []).map((t) => ({
      id: t.id,
      kind: t.kind,
      label: t.label,
      meta: t.meta ?? null,
    })),
    media: [],
    content,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  const mdxProjects = getAllProjects();
  const mdxProject = mdxProjects.find((p) => p.slug === slug);
  const fallbackProject = PROJECTS[slug] as Project | undefined;
  const projectData = mdxProject || fallbackProject;
  const dbProject = !projectData ? await fetchDbProject(slug) : null;

  if (!projectData && !dbProject) notFound();

  const content = dbProject
    ? dbProject.mdx_content
      ? await getCompiledMDX(dbProject.mdx_content)
      : null
    : mdxProject
      ? await loadMdxBody(slug)
      : null;

  const ctx = dbProject
    ? dbToContext(dbProject, content)
    : staticToContext(projectData as unknown as Project, content);

  const customKey =
    dbProject?.custom_page ||
    (projectData as Project | undefined)?.customPage ||
    null;

  const renderer = findCustomPageRenderer(customKey);
  if (renderer) {
    return renderer.render(ctx);
  }

  return (
    <>
      <CustomProjectPage
        project={{ ...ctx, id: projectData?.id || dbProject?.id || "" }}
        content={ctx.content}
        related={buildRelated(slug)}
      />
      {dbProject?.tags
        .filter((t) => t.kind === "github" && t.value?.repo)
        .map((t) => (
          <Container key={t.id} className="pb-12">
            <GithubReadmeBlock repo={t.value.repo} branch={t.value.branch} />
          </Container>
        ))}
    </>
  );
}
