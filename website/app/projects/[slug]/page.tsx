import { notFound } from "next/navigation";
import { cache } from "react";
import { Container } from "@/components/ui/container";
import { Project } from "@/app/_data/projects";
import { getAllProjects } from "@/app/_data/projects/parser";
import { CLIENTS } from "@/app/_data/clients";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import { ProjectHero } from "@/components/layout/project-hero";
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

export const dynamic = "force-static";

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// ✅ Build a stable components object – no client hooks, no re‑creation
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

// ✅ Memoize MDX compilation per slug and file content
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

  // 1. Get project from index (source of truth for existence)
  const allProjects = getAllProjects();
  const projectData = allProjects.find((p) => p.slug === slug);
  if (!projectData) {
    notFound();
  }

  // 2. Try to read the MDX file for additional content
  let mdxContent = null;
  const filePath = path.join(process.cwd(), "_data/projects/content", `${slug}.mdx`);
  let source: string | undefined;
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch {
    // MDX file not found – skip content
    source = undefined;
  }
  if (source) {
    const { data, content } = matter(source);
    // We ignore the frontmatter from MDX and rely on index data
    mdxContent = await getCompiledMDX(content, slug);
  }

  const client = projectData.clientId ? CLIENTS[projectData.clientId] : null;

  return (
    <>
      <ProjectHero
        title={projectData.title}
        description={projectData.description || ""}
        cover={projectData.cover}
        category={projectData.category}
        clientName={client?.name}
        period={projectData.period}
        techStack={projectData.techStack}
        href={projectData.href}
      />
      {mdxContent && (
        <Container className="py-8 md:py-12">
          <div className="prose prose-invert max-w-none">{mdxContent}</div>
        </Container>
      )}
    </>
  );
}
