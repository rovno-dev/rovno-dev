import { notFound } from "next/navigation";
import { cache } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { CustomProjectPage, type RelatedRef } from "./_components/custom-project-page";
import { findCustomPageRenderer, type CustomPageContext } from "./_components/custom-pages";
import { GithubReadmeBlock } from "./_components/github-readme-block";
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

async function getRelatedProjects(currentSlug: string, limit = 3): Promise<RelatedRef[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/projects?limit=10`, { next: { revalidate: 60, tags: ["projects"] } } as any);
    if (!res.ok) return [];
    const body = await res.json();
    if (!Array.isArray(body)) return [];
    return body
      .filter((p: any) => p.slug !== currentSlug)
      .slice(0, limit)
      .map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        coverImage: p.cover_image_src,
        categoryLabel: p.category?.label,
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  const dbProject = await fetchDbProject(slug);
  if (!dbProject) return { title: "Проект не найден · Rovno.dev" };

  const image = dbProject.cover_image_src || `/api/og/project/${slug}`;
  return {
    title: dbProject.seo_title || `${dbProject.title} · Rovno.dev`,
    description: dbProject.meta_description || dbProject.short_description,
    openGraph: {
      title: dbProject.seo_title || dbProject.title,
      description: dbProject.meta_description || dbProject.short_description,
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

function dbToContext(db: DBProject, content: React.ReactNode): CustomPageContext {
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
      kind: t.kind as any,
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug } = await params;
  const dbProject = await fetchDbProject(slug);
  if (!dbProject) notFound();

  const content = dbProject.mdx_content ? await getCompiledMDX(dbProject.mdx_content) : null;
  const ctx = dbToContext(dbProject, content);
  const renderer = findCustomPageRenderer(dbProject.custom_page);

  if (renderer) {
    return renderer.render(ctx);
  }

  const related = await getRelatedProjects(slug);

  return (
    <>
      <CustomProjectPage
        project={{ ...ctx, id: dbProject.id }}
        content={ctx.content}
        related={related}
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
