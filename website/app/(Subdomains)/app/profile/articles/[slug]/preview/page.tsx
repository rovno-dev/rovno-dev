import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, PencilSimpleIcon, EyeIcon, ArrowClockwiseIcon, WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { slugify } from "@/utils/slugify";
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

const API_BASE =
  process.env.API_BASE_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";

interface TagRef {
  id: string;
  name: string;
  slug: string;
}

interface PreviewArticle {
  slug: string;
  title: string;
  description: string;
  image_url: string;
  date: string;
  tags: TagRef[] | null;
  publication_status: string;
  mdx_content: string;
}

type FetchOutcome =
  | { ok: true; article: PreviewArticle }
  | { ok: false; reason: "unauthorized" | "not-found" | "server" };

async function fetchArticleForPreview(
  slug: string,
  token: string
): Promise<FetchOutcome> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/articles/${encodeURIComponent(slug)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (res.status === 404) return { ok: false, reason: "not-found" };
    if (!res.ok) return { ok: false, reason: "server" };
    return { ok: true, article: (await res.json()) as PreviewArticle };
  } catch {
    return { ok: false, reason: "server" };
  }
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(
      (node as { props: { children: React.ReactNode } }).props.children
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

function SessionExpired() {
  return (
    <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--warning),transparent_70%)] bg-[color-mix(in_srgb,var(--warning),transparent_96%)] p-6 max-w-lg">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--warning-card) text-(--warning)">
          <WarningIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-heading-4 text-(--on-bg-high) mb-1">
            Сессия истекла
          </h3>
          <p className="text-body-4 text-(--on-bg-medium) mb-4">
            Обновите страницу — токен обновится автоматически.
          </p>
          <Button variant="outlined" size="small" asChild>
            <a href="">
              <ArrowClockwiseIcon className="size-4" />
              Обновить страницу
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ServerError() {
  return (
    <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6 max-w-lg">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--error-card) text-(--error)">
          <WarningIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-heading-4 text-(--on-bg-high) mb-1">
            Не удалось загрузить статью
          </h3>
          <p className="text-body-4 text-(--on-bg-medium) mb-4">
            Похоже, бэкенд недоступен или вернул ошибку. Попробуйте ещё раз.
          </p>
          <Button variant="outlined" size="small" asChild>
            <a href="">
              <ArrowClockwiseIcon className="size-4" />
              Повторить
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default async function PreviewArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return (
      <div className="space-y-6">
        <SessionExpired />
      </div>
    );
  }

  const result = await fetchArticleForPreview(slug, token);

  if (!result.ok) {
    if (result.reason === "not-found") notFound();
    return (
      <div className="space-y-6">
        {result.reason === "unauthorized" ? <SessionExpired /> : <ServerError />}
      </div>
    );
  }

  const article = result.article;
  const isPublished = article.publication_status === "published";

  const { content } = await compileMDX({
    source: article.mdx_content || "",
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return (
    <div className="space-y-6">
      {/* Admin header — the meta strip that tells you you're in preview
          mode, distinct from the public article page. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="tonal-card-static" size="chip-small" className="gap-1">
            <EyeIcon className="size-3" />
            Предпросмотр
          </Badge>
          <Badge
            variant="tonal-card-static"
            size="chip-small"
            className={
              isPublished
                ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                : "bg-amber-500/15 text-amber-500 border-amber-500/30"
            }
          >
            {isPublished ? "Опубликовано" : "Черновик"}
          </Badge>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outlined" asChild>
            <Link href="/app/profile/articles">
              <ArrowLeftIcon className="size-4" />
              К списку
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/profile/articles/${slug}/edit`}>
              <PencilSimpleIcon className="size-4" />
              Редактировать
            </Link>
          </Button>
        </div>
      </div>

      {/* Same hero pattern as the public article — cover as full-bleed
          background, gradient overlay, title/description/badges layered
          on top. What you see here is what readers see. */}
      <div className="relative w-full h-[420px] md:h-[520px] rounded-5xl md:rounded-7xl overflow-hidden bg-(--card) border border-(--outline)">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            quality={90}
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Tags, top-right — same treatment as the public page */}
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
          <h1 className="text-display-3 md:text-display-1 text-white leading-[1.05] tracking-tight mb-4 max-w-4xl">
            {article.title}
          </h1>
          {article.description && (
            <p className="text-body-3 md:text-body-1 text-white/80 leading-relaxed max-w-2xl">
              {article.description}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <article className="rounded-3xl border border-(--outline) bg-(--card) p-6 md:p-10">
        {article.mdx_content ? (
          content
        ) : (
          <p className="text-body-3 text-(--on-bg-medium)">Содержимое пустое.</p>
        )}
      </article>
    </div>
  );
}
