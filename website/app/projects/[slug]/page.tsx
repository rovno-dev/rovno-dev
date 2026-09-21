import { notFound } from "next/navigation";
import { cache } from "react";
import { Container } from "@/components/ui/container";
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
// import { fetchProjectCategories } from "@/utils/api/categories";

export const dynamic = "force-static";

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

const getCompiledMDX = cache(async (content: string, slug: string) => {
  const { content: compiled } = await compileMDX({
    source: content,
    components,
    options: { parseFrontmatter: false },
  });
  return compiled;
});

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Try MDX-based projects from _data/projects/content/
  const mdxProjects = getAllProjects();
  const mdxProject = mdxProjects.find((p) => p.slug === slug);

  // 2. Fallback to PROJECTS object from _data/projects/index.tsx
  const fallbackProject = PROJECTS[slug] as Project | undefined;

  const projectData = mdxProject || fallbackProject;
  if (!projectData) notFound();

  // ---- Custom cinematic page for the ALX-9 case ----
  if (slug === "alx") {
    return (
      <AlxProjectPage
        project={{
          title: projectData.title,
          description: projectData.description,
          cover: projectData.cover,
          href: projectData.href,
          period: projectData.period,
          techStack: projectData.techStack,
        }}
      />
    );
  }

  // Try to load MDX content (only for MDX-based projects)
  let mdxContent = null;
  if (mdxProject) {
    const filePath = path.join(process.cwd(), "_data/projects/content", `${slug}.mdx`);
    let source: string | undefined;
    try {
      source = fs.readFileSync(filePath, "utf8");
    } catch { }
    if (source) {
      const { content } = matter(source);
      mdxContent = await getCompiledMDX(content, slug);
    }
  }

  const client = projectData.clientId ? CLIENTS[projectData.clientId] : null;

  // TODO: swap back to backend-provided categories once the API is ready
  // let categoryLabel = projectData.category || "";
  // if (projectData.category) {
  //   const categories = await fetchProjectCategories();
  //   const found = categories.find((c) => c.code === projectData.category);
  //   if (found) categoryLabel = found.label;
  // }
  let categoryLabel = projectData.category || "";
  if (projectData.category) {
    const found = PROJECT_CATEGORIES.find((c) => c.code === projectData.category);
    if (found) categoryLabel = found.label;
  }

  return (
    <>
      <ProjectHero
        title={projectData.title}
        description={projectData.description || ""}
        cover={projectData.cover}
        category={categoryLabel}
        clientName={client?.name}
        period={projectData.period}
        techStack={projectData.techStack}
        href={projectData.href}
      />
      <Container className="py-8 md:py-12">
        {mdxContent ? (
          <div className="prose prose-invert max-w-none">{mdxContent}</div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {projectData.shortDescription && (
              <p className="text-body-1 text-(--on-bg-medium) leading-relaxed">
                {projectData.shortDescription}
              </p>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
