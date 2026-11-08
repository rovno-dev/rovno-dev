import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { slugify } from "@/utils/slugify";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";
import { ContentMeta } from "@/components/layout/content-meta";
import { Toc } from "@/components/layout/toc/toc";
import { extractMdxHeadings } from "@/utils/mdx-headings";
import { extractTiptapHeadings } from "@/utils/tiptap-headings";
import {
  fetchArticleServer,
  fetchPublishedArticlesServer,
} from "@/utils/api/articles";
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
import { resolveOgImage, absoluteUrl, SITE_NAME } from "@/utils/seo";

export const revalidate = 60;

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(
      (node as { props: { children: React.ReactNode } }).props.children,
    );
  }
  return "";
}

const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h2
        id={id}
        className="text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight scroll-mt-28"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h3
        id={id}
        className="text-heading-3 text-(--on-bg-high) mt-8 mb-3 scroll-mt-28"
      >
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleServer(slug);
  if (!article) return { title: "Статья не найдена · Rovno.dev" };
  const title = article.seo_title || article.title;
  const description = article.meta_description || article.description || "";
  const ogImage = resolveOgImage(article.image_url, `/api/og/article/${slug}`);
  const url = absoluteUrl(`/blog/${slug}`);
  const fullTitle = title.includes("Rovno.dev")
    ? title
    : `${title} · ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "ru_RU",
      siteName: SITE_NAME,
      url,
      title: fullTitle,
      description,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: article.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await fetchArticleServer(slug);
  if (!article) notFound();

  const legacyContent = article.content_json
    ? null
    : (
      await compileMDX({
        source: article.mdx_content || "",
        components: mdxComponents,
        options: { parseFrontmatter: false },
      })
    ).content;

  const headings = article.content_json
    ? extractTiptapHeadings(article.content_json)
    : extractMdxHeadings(article.mdx_content || "");

  const authorName =
    article.author?.name || article.author?.username || "Rovno.dev";

  return (
    <main className="min-h-screen bg-(--bg) pb-24">
      <Container className="pt-4 md:pt-8">
        <div className="max-w-[860px] mx-auto">
          <div className="relative w-full aspect-[4/3] rounded-4xl overflow-hidden bg-(--card) border border-(--outline) animate-reveal">
            {article.image_url ? (
              article.image_url.endsWith(".webm") ||
                article.image_url.endsWith(".mp4") ? (
                <video
                  src={article.image_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <Image
                  src={article.image_url}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 860px"
                  quality={90}
                  className="object-cover object-center"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
              <Button variant="glass" size="icon-medium" shape="round" asChild>
                <Link href="/blog" aria-label="Все статьи">
                  <ArrowLeftIcon className="size-5" />
                </Link>
              </Button>
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex flex-wrap gap-2 justify-end max-w-[60%]">
                {article.tags.slice(0, 4).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="glass-static"
                    size="chip-small"
                    className="text-white border-white/20"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-10">
              <h1 className="text-display-3 md:text-display-2 text-white leading-[1.05] tracking-tight mb-3 max-w-2xl animate-reveal">
                {article.title}
              </h1>
              {article.description && (
                <p className="text-body-3 md:text-body-1 text-white/80 leading-relaxed mb-5 max-w-xl animate-reveal [animation-delay:120ms] fill-mode-both">
                  {article.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-4 text-white/60 animate-reveal [animation-delay:200ms] fill-mode-both">
                <span className="font-medium text-white/85">{authorName}</span>
                <span aria-hidden>·</span>
                <time dateTime={article.date}>{formatDate(article.date)}</time>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="pt-4">
        <div className="max-w-[860px] mx-auto">
          <ContentMeta
            entityType="article"
            entityId={article.slug}
            content={article.content_json || article.mdx_content}
            updatedAt={article.updated_at || article.date}
            imageUrl={article.image_url}
          />
        </div>
      </Container>

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-16">
          <article className="min-w-0 max-w-[760px] prose-case">
            {article.content_json ? (
              <NovelReadOnly content={article.content_json} />
            ) : (
              legacyContent
            )}

            {article.attachments && article.attachments.length > 0 && (
              <div className="mt-12 pt-8 border-t border-(--outline)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {article.attachments.map((m: any, i: number) => (
                    <figure
                      key={i}
                      className="rounded-3xl border border-(--outline) overflow-hidden bg-(--card)"
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
                          preload="metadata"
                          className="w-full aspect-video bg-black"
                        />
                      )}
                      {m.caption && (
                        <figcaption className="px-4 py-2 text-body-5 text-(--on-bg-medium)">
                          {m.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-(--outline)">
              <Button variant="outlined" size="medium" shape="round" asChild>
                <Link href="/blog">
                  <ArrowLeftIcon className="size-4" />
                  Все статьи
                </Link>
              </Button>
            </div>
          </article>

          <div className="space-y-8">
            {headings.length > 0 && (
              <Toc
                headings={headings}
                label="Содержание"
                ariaLabel="Содержание статьи"
              />
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
