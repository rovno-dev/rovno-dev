import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Toc } from "@/components/layout/toc/toc";
import { slugify } from "@/utils/slugify";
import { extractMdxHeadings } from "@/utils/mdx-headings";
import { fetchArticleServer, fetchPublishedArticlesServer } from "@/utils/api/articles";
import {
  Gallery,
  MetricCard,
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
export const revalidate = 60;
// LLM context: extractText + the h2/h3 components mirror the docs page so
// anchors work identically and the TOC slugs match.
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText((node as { props: { children: React.ReactNode } }).props.children);
  }
  return "";
}
const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h2 id={id} className="text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight scroll-mt-28">
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h3 id={id} className="text-heading-3 text-(--on-bg-high) mt-8 mb-3 scroll-mt-28">
        {children}
      </h3>
    );
  },
  p: MDXParagraph,
  ul: (props: any) => <MDXList ordered={false} {...props} />,
  ol: (props: any) => <MDXList ordered={true} {...props} />,
  li: MDXListItem,
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-(--on-bg-high)">{children}</strong>
  ),
  a: MDXLink,
  img: MDXImage,
  blockquote: MDXBlockquote,
  code: MDXCode,
  pre: MDXPre,
  hr: MDXHr,
  table: MDXTable,
  thead: MDXThead,
  th: MDXTh,
  td: MDXTd,
  Card: MDXCard,
  Gallery,
  MetricCard,
};
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticleServer(slug);
  if (!article) return { title: "Article not found · Rovno.dev" };
  return {
    title: article.seo_title || `${article.title} · Rovno.dev`,
    description: article.meta_description || article.description,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.meta_description || article.description,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticleServer(slug);
  if (!article) notFound();
  const headings = extractMdxHeadings(article.mdx_content || "");
  const { content } = await compileMDX({
    source: article.mdx_content || "",
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });
  // Related — a handful of recent articles excluding this one.
  const recent = await fetchPublishedArticlesServer({ limit: 6 });
  const others = recent.filter((a) => a.slug !== article.slug).slice(0, 3);
  const authorName =
    article.author?.name || article.author?.username || "Rovno.dev";
  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Header */}
      <section className="border-b border-(--outline) pt-12 md:pt-20 pb-10">
        <Container>
          <div className="max-w-[900px]">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              Все статьи
            </Link>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {article.tags.map((tag) => (
                  <Badge key={tag.id} variant="glass-static" size="chip-small">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.1] mb-4">
              {article.title}
            </h1>
            {article.description && (
              <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed mb-6">
                {article.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-body-4 text-(--on-bg-low)">
              <span>{authorName}</span>
              <span aria-hidden>·</span>
              <time dateTime={article.date}>{formatDate(article.date)}</time>
            </div>
          </div>
        </Container>
      </section>
      {/* Cover */}
      {article.image_url && (
        <Container className="pt-8 md:pt-12">
          <div className="relative aspect-[16/8] w-full overflow-hidden rounded-4xl border border-(--outline) bg-(--card)">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              quality={90}
              className="object-cover"
            />
          </div>
        </Container>
      )}
      {/* Body + TOC */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-16">
            <article className="max-w-[760px]">{content}</article>
            <div className="space-y-8">
              {headings.length > 0 && (
                <Toc headings={headings} label="Содержание" ariaLabel="Содержание статьи" />
              )}
              {others.length > 0 && (
                <nav
                  aria-label="Другие статьи"
                  className="hidden lg:block pt-6 border-t border-(--outline)"
                >
                  <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">
                    Другие статьи
                  </p>
                  <ul className="space-y-3 text-body-4">
                    {others.map((o) => (
                      <li key={o.id}>
                        <Link
                          href={`/blog/${o.slug}`}
                          className="text-(--on-bg-medium) hover:text-(--primary) transition-colors leading-snug block"
                        >
                          {o.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </Container>
      </section>
      {/* Footer nav */}
      <section className="pb-24">
        <Container>
          <Button variant="outlined" size="medium" shape="round" asChild>
            <Link href="/blog">
              <ArrowLeft className="size-4" />
              Все статьи
            </Link>
          </Button>
        </Container>
      </section>
    </main>
  );
}
