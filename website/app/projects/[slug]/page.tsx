import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Project, PROJECTS } from "@/app/_data/projects";
import { getAllProjects } from "@/app/_data/projects/parser";
import { CLIENTS } from "@/app/_data/clients";
import { PROJECT_CATEGORIES } from "@/app/_data/categories";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { ProjectHero } from "@/app/projects/[slug]/_components/project-hero";
import { AlxProjectPage } from "@/app/projects/[slug]/_components/alx-project-page";
import { GithubReadmeBlock } from "./_components/github-readme-block";
import {
  Gallery, MetricCard, MDXHeading, MDXImage, MDXBlockquote, MDXCode,
  MDXPre, MDXList, MDXListItem, MDXParagraph, MDXHr, MDXLink,
  MDXTable, MDXThead, MDXTh, MDXTd, MDXCard,
} from "@/components/mdx";

export const dynamic = "force-static";

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
    const res = await fetch(`${API_BASE}/api/v1/projects/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    } as any);
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
};

const getCompiledMDX = cache(async (content: string) => {
  const { content: compiled } = await compileMDX({
    source: content,
    components,
    options: { parseFrontmatter: false },
  });
  return compiled;
});

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // ---- 1. Custom component (hardcoded slug) -------------------------------
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

  // ---- 2. Filesystem MDX --------------------------------------------------
  const mdxProjects = getAllProjects();
  const mdxProject = mdxProjects.find((p) => p.slug === slug);

  // ---- 3. Fallback to PROJECTS index -------------------------------------
  const fallbackProject = PROJECTS[slug] as Project | undefined;

  const projectData = mdxProject || fallbackProject;

  // ---- 4. DB (admin-created) ---------------------------------------------
  const dbProject = !projectData ? await fetchDbProject(slug) : null;

  if (!projectData && !dbProject) notFound();

  // ----- Render DB-backed project -----------------------------------------
  if (dbProject) {
    const mdxContent = dbProject.mdx_content
      ? await getCompiledMDX(dbProject.mdx_content)
      : null;

    return (
      <>
        <ProjectHero
          title={dbProject.title}
          description={dbProject.description || dbProject.short_description || ""}
          cover={{
            imageSrc: dbProject.cover_image_src,
            videoSrc: dbProject.cover_video_src || undefined,
          }}
          category={dbProject.category?.label}
          clientName={dbProject.platform || undefined}
          period={dbProject.period || undefined}
          techStack={dbProject.tech_stack || []}
          href={dbProject.href || undefined}
        />

        {/* Project tags row */}
        {dbProject.tags.length > 0 && (
          <Container className="pt-8">
            <div className="flex flex-wrap gap-2">
              {dbProject.tags.map((t) => (
                <Badge
                  key={t.id}
                  variant="tonal-card-static"
                  size="chip-medium"
                  className="gap-1"
                >
                  {t.kind === "from_chief" && "★ "}
                  {t.kind === "license" && "⚖ "}
                  {t.kind === "github" && "⧫ "}
                  {t.label}
                  {t.kind === "from_chief" && t.value?.author && ` · ${t.value.author}`}
                </Badge>
              ))}
            </div>
          </Container>
        )}

        {/* Body */}
        <Container className="py-8 md:py-12">
          {mdxContent ? (
            <div className="prose prose-invert max-w-none">{mdxContent}</div>
          ) : dbProject.short_description ? (
            <p className="text-body-1 text-(--on-bg-medium) leading-relaxed max-w-3xl">
              {dbProject.short_description}
            </p>
          ) : null}
        </Container>

        {/* Media gallery */}
        {dbProject.media.length > 0 && (
          <Container className="pb-12">
            <h2 className="text-display-3 mb-6">Галерея</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbProject.media.map((m) => (
                <Card
                  key={m.id}
                  className="rounded-3xl border-(--outline) overflow-hidden"
                >
                  {m.type === "image" ? (
                    <div className="relative aspect-video">
                      <Image
                        src={m.url}
                        alt={m.caption || ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <video
                      src={m.url}
                      controls
                      className="w-full aspect-video bg-black"
                      preload="metadata"
                    />
                  )}
                  {m.caption && (
                    <p className="px-4 py-3 text-body-4 text-(--on-bg-medium)">
                      {m.caption}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        )}

        {/* GitHub README blocks — one per github tag */}
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

  // ----- Render filesystem/MDX project (existing path) --------------------
  let mdxContent = null;
  if (mdxProject) {
    const filePath = path.join(process.cwd(), "_data/projects/content", `${slug}.mdx`);
    let source: string | undefined;
    try { source = fs.readFileSync(filePath, "utf8"); } catch {}
    if (source) {
      const { content } = matter(source);
      mdxContent = await getCompiledMDX(content);
    }
  }

  const client = projectData!.clientId ? CLIENTS[projectData!.clientId] : null;
  let categoryLabel = projectData!.category || "";
  if (projectData!.category) {
    const found = PROJECT_CATEGORIES.find((c) => c.code === projectData!.category);
    if (found) categoryLabel = found.label;
  }

  return (
    <>
      <ProjectHero
        title={projectData!.title}
        description={projectData!.description || ""}
        cover={projectData!.cover}
        category={categoryLabel}
        clientName={client?.name}
        period={projectData!.period}
        techStack={projectData!.techStack}
        href={projectData!.href}
      />
      <Container className="py-8 md:py-12">
        {mdxContent ? (
          <div className="prose prose-invert max-w-none">{mdxContent}</div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {projectData!.shortDescription && (
              <p className="text-body-1 text-(--on-bg-medium) leading-relaxed">
                {projectData!.shortDescription}
              </p>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
