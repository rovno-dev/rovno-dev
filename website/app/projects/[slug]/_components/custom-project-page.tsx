import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
} from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { CoverIframe } from "@/components/layout/media/cover-iframe";
import {
  ProjectTagChip,
  type ProjectTagKind,
} from "@/components/ui/project-tag-chip";

export interface CustomProject {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  coverVideo?: string;
  href?: string;
  /** Category code (e-commerce | identity | corporative). Drives the accent. */
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
 * Per-category accent. Falls back to brand blue for anything unknown so a
 * mis-categorised project still renders with a coherent palette.
 */
const ACCENT: Record<string, string> = {
  "e-commerce": "#336DFF",
  identity: "#C7FF3C",
  corporative: "#F59E0B",
};

export function CustomProjectPage({
  project,
  content,
  related,
}: {
  project: CustomProject;
  /** Compiled MDX body from the server. */
  content: React.ReactNode;
  related: RelatedRef[];
}) {
  const accent = ACCENT[project.category ?? ""] ?? "#336DFF";

  return (
    <main
      className="min-h-screen bg-(--bg) text-(--on-bg-high)"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* ────────────────  HERO  ──────────────── */}
      <section className="relative min-h-[88dvh] flex flex-col justify-between overflow-hidden border-b border-(--outline)">
        {/* Cover media (video takes priority over image). */}
        <div className="absolute inset-0 z-0">
          {project.coverVideo ? (
            <CoverIframe
              src={`${project.coverVideo}?autoplay=1&muted=1&loop=1&background=1`}
              title={project.title}
            />
          ) : project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : null}
          {/* Tonal overlays — bottom fade for text legibility, corner bloom
              tinted by the project accent. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-(--bg)" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 80% 20%, transparent 0%, rgba(0,0,0,0.75) 100%)",
            }}
          />
        </div>

        {/* Top zone left intentionally empty — the fixed header floats over
            this area on /projects/<slug>. Hero content is pushed down by the
            hero's own top padding (pt-32 md:pt-40) so nothing collides. */}

        {/* Hero content — eyebrow, title, description, meta grid, CTAs. */}
        <Container
          variant="full-width"
          className="relative z-10 pt-32 md:pt-40 pb-12 md:pb-16"
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] text-white/60 mb-6">
              <span className="h-px w-12" style={{ background: accent }} />
              {project.clientName && <span>{project.clientName}</span>}
            </div>

            <h1 className="text-[clamp(2.5rem,7vw,7rem)] font-heading font-bold leading-[0.95] tracking-[-0.035em] text-white max-w-[1100px]">
              {project.title}
            </h1>

            {project.shortDescription && (
              <p className="mt-8 text-body-2 md:text-display-5 text-white/75 leading-relaxed max-w-2xl">
                {project.shortDescription}
              </p>
            )}

            {/* Meta grid — client, year, scope, top-3 stack entries. */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {project.clientName && (
                <MetaCol label="Client" value={project.clientName} />
              )}
              {project.period && (
                <MetaCol label="Year" value={project.period} />
              )}
              {project.categoryLabel && (
                <MetaCol label="Scope" value={project.categoryLabel} />
              )}
              {project.techStack.length > 0 && (
                <MetaCol
                  label="Stack"
                  value={project.techStack.slice(0, 3).join(" · ")}
                />
              )}
            </div>

            {/* CTAs. */}
            <div className="mt-10 flex flex-wrap gap-3">
              {project.href && (
                <Button
                  size="large"
                  asChild
                  className="!font-mono !uppercase !tracking-wider"
                  style={{ background: accent, color: "#050507" }}
                >
                  <Link
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Смотреть кейс
                    <ArrowUpRight className="size-5" />
                  </Link>
                </Button>
              )}
              <Button
                size="large"
                variant="outlined"
                asChild
                className="!border-white/25 !text-white hover:!bg-white/5 !font-mono !uppercase !tracking-wider"
              >
                <Link href="#case">
                  <ArrowDown className="size-4" />
                  К содержанию
                </Link>
              </Button>
            </div>
          </div>
        </Container>

        {/* Bottom scroll cue. */}
        <Container variant="full-width" className="relative z-10 pb-8">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">
            <span>Scroll</span>
            <span>{project.slug}</span>
          </div>
        </Container>
      </section>

      {/* ────────────────  MARQUEE  ──────────────── */}
      <div className="relative border-b border-(--outline) py-5 overflow-hidden select-none bg-(--bg)">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center gap-8 pr-8">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="font-mono uppercase text-2xl md:text-4xl tracking-tight text-(--on-bg-high)/65"
                >
                  {project.title}
                  <span className="mx-3" style={{ color: accent }}>·</span>
                  {project.categoryLabel || "Case"}
                  {project.period && (
                    <>
                      <span className="mx-3" style={{ color: accent }}>·</span>
                      {project.period}
                    </>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────  MANIFESTO  ──────────────── */}
      {project.description && (
        <ScrollReveal threshold={0.05}>
          <section className="py-24 md:py-36 border-b border-(--outline)">
            <Container variant="full-width">
              <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-3">
                  <SectionLabel number="01" title="Manifesto" accent={accent} />
                </div>
                <div className="lg:col-span-9">
                  <p className="text-3xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-[-0.02em] leading-[1.05] text-(--on-bg-high)">
                    {project.description}
                  </p>
                </div>
              </div>
            </Container>
          </section>
        </ScrollReveal>
      )}

      {/* ────────────────  CASE BODY (MDX)  ──────────────── */}
      {/* Only renders when MDX content exists. Otherwise the page falls
          back to the hero + gallery + related sections alone. */}
      {content && (
      <ScrollReveal threshold={0.02}>
        <section id="case" className="py-24 md:py-32 border-b border-(--outline)">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-3">
                <SectionLabel number="02" title="Case" accent={accent} />
              </div>
              <div className="lg:col-span-9 max-w-[860px] prose-case">
                {content}
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>
      )}

      {/* ────────────────  MEDIA GALLERY  ──────────────── */}
      {project.media.length > 0 && (
        <ScrollReveal threshold={0.02}>
          <section className="py-24 md:py-32 border-b border-(--outline)">
            <Container variant="full-width">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-12">
                  <SectionLabel number="03" title="Gallery" accent={accent} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {project.media.map((m) => (
                    <figure
                      key={m.id}
                      className="rounded-2xl overflow-hidden border border-(--outline) bg-(--card)"
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
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      )}
                      {m.caption && (
                        <figcaption className="px-4 py-3 text-body-5 text-(--on-bg-medium)">
                          {m.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        </ScrollReveal>
      )}

      {/* ────────────────  PROJECT TAGS  ──────────────── */}
      {project.tags.length > 0 && (
        <section className="py-14 border-b border-(--outline)">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <ProjectTagChip
                  key={t.id}
                  kind={t.kind as ProjectTagKind}
                  label={t.label}
                  size="md"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ────────────────  RELATED / NEXT  ──────────────── */}
      {related.length > 0 && (
        <ScrollReveal threshold={0.02}>
          <section className="py-24 md:py-32">
            <Container variant="full-width">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-10 flex items-end justify-between gap-4">
                  <SectionLabel number="04" title="Ещё кейсы" accent={accent} />
                  <Button variant="outlined" size="small" asChild>
                    <Link href="/projects">
                      Все проекты
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/projects/${r.slug}`}
                      className="group block"
                    >
                      <Card className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) ring-0 aspect-[16/10]">
                        {r.coverImage ? (
                          <Image
                            fill
                            src={r.coverImage}
                            alt={r.title}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-(--primary-glass)" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
                          {r.categoryLabel && (
                            <p className="text-body-5 uppercase tracking-widest text-white/60 mb-1">
                              {r.categoryLabel}
                            </p>
                          )}
                          <h3 className="text-body-2 md:text-heading-3 text-white leading-tight">
                            {r.title}
                          </h3>
                        </div>
                        <div className="absolute bottom-5 right-5 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <span className="flex size-9 items-center justify-center rounded-full bg-white text-black">
                            <ArrowUpRight className="size-4" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        </ScrollReveal>
      )}

      {/* ────────────────  CLOSING CTA  ──────────────── */}
      <section className="py-32 md:py-44 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${accent}14 0%, transparent 60%)`,
          }}
        />
        <Container variant="full-width" className="relative z-10">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-(--on-bg-low) mb-6">
              End of case
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-semibold tracking-[-0.03em] leading-[1.02] mb-10">
              Хотите такой же{" "}
              <span style={{ color: accent }}>результат?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xlarge" asChild>
                <Link href="/order">
                  Оформить заказ
                  <ArrowUpRight className="size-5" />
                </Link>
              </Button>
              <Button size="xlarge" variant="outlined" asChild>
                <Link href="/projects">
                  <ArrowLeft className="size-5" />
                  Все проекты
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/20 pt-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 mb-1.5">
        {label}
      </div>
      <div className="text-body-4 text-white/90 truncate">{value}</div>
    </div>
  );
}

function SectionLabel({
  number,
  title,
  accent,
}: {
  number: string;
  title: string;
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
          {number}
        </span>
        <span className="h-px w-8" style={{ background: accent }} />
      </div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-(--on-bg-low)">
        {title}
      </h2>
    </div>
  );
}
