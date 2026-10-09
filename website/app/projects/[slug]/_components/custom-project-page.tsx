import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export interface CustomProject {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  coverVideo?: string;
  href?: string;
  category?: string;
  categoryLabel?: string;
  clientName?: string;
  period?: string;
  platform?: string;
  techStack: string[];
  tags: { id: string; kind: string; label: string }[];
  media: {
    id: string;
    type: "image" | "video";
    url: string;
    caption?: string | null;
  }[];
}

export interface RelatedRef {
  slug: string;
  title: string;
  coverImage: string;
  categoryLabel?: string;
}

/**
 * Shared case-study layout.
 *
 * Design intent: Vercel/Apple-restrained. No full-bleed hero competing for
 * the fold, no marquee, no corner decorations, no per-category accent
 * colours. Everything sits inside the standard container width, all chrome
 * derives from theme tokens, and the type scale is deliberately quiet
 * (h1 ~text-5xl) so the project itself is the focus, not the page.
 */
export function CustomProjectPage({
  project,
  content,
  related,
}: {
  project: CustomProject;
  content: React.ReactNode;
  related: RelatedRef[];
}) {
  const hasCover = Boolean(project.coverImage || project.coverVideo);
  const meta = [
    project.clientName && { label: "Client", value: project.clientName },
    project.period && { label: "Year", value: project.period },
    project.categoryLabel && { label: "Category", value: project.categoryLabel },
    project.platform && { label: "Platform", value: project.platform },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* ── Header ────────────────────────────────────────────────── */}
      <Container className="pt-10 md:pt-16">
        <div className="max-w-[860px] mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors mb-10"
          >
            <ArrowLeft className="size-3.5" />
            Все проекты
          </Link>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.tags.map((t) => (
                <Badge
                  key={t.id}
                  variant="outlined-static"
                  size="chip-small"
                >
                  {t.label}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-heading font-semibold tracking-tight text-(--on-bg-high) leading-[1.1] mb-5">
            {project.title}
          </h1>

          {project.shortDescription && (
            <p className="text-base md:text-lg text-(--on-bg-medium) leading-relaxed max-w-[640px]">
              {project.shortDescription}
            </p>
          )}
        </div>
      </Container>

      {/* ── Meta + actions ────────────────────────────────────────── */}
      {(meta.length > 0 || project.href) && (
        <Container className="pt-10 md:pt-12">
          <div className="max-w-[860px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6 pt-6 border-t border-(--outline)">
            <dl className="flex flex-wrap items-start gap-x-8 gap-y-3">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1">
                    {m.label}
                  </dt>
                  <dd className="text-sm text-(--on-bg-high)">{m.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2 shrink-0">
              {project.href && (
                <Button size="small" variant="outlined" asChild>
                  <Link
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Оригинал
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              )}
              <Button size="small" asChild>
                <Link href="/order">
                  Заказать похожее
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      )}

      {/* ── Cover ─────────────────────────────────────────────────── */}
      {hasCover && (
        <Container className="pt-12 md:pt-16">
          <div className="max-w-[1120px] mx-auto">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-(--outline) bg-(--card)">
              {project.coverVideo ? (
                <iframe
                  src={`${project.coverVideo}?autoplay=1&muted=1&loop=1`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  title={project.title}
                />
              ) : (
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1120px) 100vw, 1120px"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </Container>
      )}

      {/* ── Body ──────────────────────────────────────────────────── */}
      {content && (
        <Container className="pt-16 md:pt-24">
          <article className="max-w-[720px] mx-auto prose-case">
            {content}
          </article>
        </Container>
      )}

      {/* ── Gallery ───────────────────────────────────────────────── */}
      {project.media.length > 0 && (
        <Container className="pt-16 md:pt-24">
          <div className="max-w-[1120px] mx-auto">
            <h2 className="text-[11px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-6">
              Галерея
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.media.map((m) => (
                <figure
                  key={m.id}
                  className="rounded-xl overflow-hidden border border-(--outline) bg-(--card)"
                >
                  {m.type === "video" ? (
                    <video
                      src={m.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full aspect-video bg-black"
                    />
                  ) : (
                    <div className="relative aspect-video">
                      <Image
                        src={m.url}
                        alt={m.caption || ""}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  {m.caption && (
                    <figcaption className="px-3 py-2 text-xs text-(--on-bg-medium) border-t border-(--outline)">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* ── Related ───────────────────────────────────────────────── */}
      {related.length > 0 && (
        <Container className="pt-16 md:pt-24">
          <div className="max-w-[1120px] mx-auto">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-[11px] uppercase tracking-[0.14em] text-(--on-bg-low)">
                Ещё проекты
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 text-sm text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors"
              >
                Все
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/projects/${r.slug}`}
                  className="group block"
                >
                  <Card className="rounded-xl border border-(--outline) bg-(--card) ring-0 overflow-hidden">
                    <div className="relative aspect-[16/10] bg-(--bg-disabled)">
                      {r.coverImage ? (
                        <Image
                          fill
                          src={r.coverImage}
                          alt={r.title}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      {r.categoryLabel && (
                        <p className="text-[11px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1">
                          {r.categoryLabel}
                        </p>
                      )}
                      <h3 className="text-sm font-medium text-(--on-bg-high) truncate">
                        {r.title}
                      </h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      )}

      <div className="h-24 md:h-32" />
    </main>
  );
}
