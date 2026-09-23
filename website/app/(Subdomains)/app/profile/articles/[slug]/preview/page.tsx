import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pencil, Eye, RefreshCw, TriangleAlert } from "lucide-react";
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

// Same base resolution the other server fetchers use.
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
        // Never cache a preview — the author expects to see the latest save.
        cache: "no-store",
      }
    );
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (res.status === 404) {
      return { ok: false, reason: "not-found" };
    }
    if (!res.ok) {
      return { ok: false, reason: "server" };
    }
    const article = (await res.json()) as PreviewArticle;
    return { ok: true, article };
  } catch {
    // Network failure, DNS, timeout — treat as a server problem, not "not
    // found". The user gets a "reload" path instead of a wrong 404.
    return { ok: false, reason: "server" };
  }
}

// Same shape as the public blog page, so a preview renders identically to
// the published article.
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
          <TriangleAlert className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-heading-4 text-(--on-bg-high) mb-1">
            Сессия истекла
          </h3>
          <p className="text-body-4 text-(--on-bg-medium) mb-4">
            Обновите страницу — токен обновится автоматически.
          </p>
          {/*
            href="" navigates to the current URL, which is a full reload.
            This is what we want: the Server Component re-runs and reads the
            freshly-refreshed cookie that useUser wrote on the client.
          */}
          <Button variant="outlined" size="small" asChild>
            <a href="">
              <RefreshCw className="size-4" />
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
          <TriangleAlert className="size-5" />
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
              <RefreshCw className="size-4" />
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

  // Server Components can read the auth cookie directly. Same token the
  // client-side $fetch helper uses — forwarded to the backend verbatim.
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

  // Compile MDX once on the server. No client-side fetch, no loading state,
  // no recompile loop — the HTML is fully formed when this renders.
  const { content } = await compileMDX({
    source: article.mdx_content || "",
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return (
    <div className="space-y-6">
      {/* Status + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="tonal-card-static" size="chip-small" className="gap-1">
              <Eye className="size-3" />
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
          <h1 className="text-display-3 truncate">{article.title}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outlined" asChild>
            <Link href="/app/profile/articles">
              <ArrowLeft className="size-4" />
              К списку
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/app/profile/articles/${slug}/edit`}>
              <Pencil className="size-4" />
              Редактировать
            </Link>
          </Button>
        </div>
      </div>

      {/* Cover */}
      {article.image_url && (
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-3xl border border-(--outline) bg-(--card)">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((t) => (
            <Badge key={t.id} variant="tonal-card-static" size="chip-small">
              {t.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Body — pre-compiled on the server, no client work */}
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
