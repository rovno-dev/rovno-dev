import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowLeft, CaretDown } from "@phosphor-icons/react/dist/ssr";

export interface CustomProject {
  id: string;
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
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  categoryLabel?: string;
}

export function CustomProjectPage({
  project,
  content,
  related,
}: {
  project: CustomProject & { id: string };
  content: React.ReactNode;
  related: RelatedRef[];
}) {
  const hasCover = Boolean(project.coverImage || project.coverVideo);
  const isVideo = project.coverVideo?.endsWith(".webm") || project.coverVideo?.endsWith(".mp4");

  return (
    <main className="min-h-screen bg-(--bg) text-(--on-bg-high) selection:bg-(--primary) selection:text-(--on-primary)">
      
      {/* ── FULL SCREEN HERO ────────────────────────────────────────── */}
      <section className="relative w-full h-[100svh] flex flex-col justify-end pb-12 md:pb-24 overflow-hidden bg-black">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video
              src={project.coverVideo}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-80"
            />
          ) : project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              className="object-cover opacity-80"
            />
          ) : null}
          {/* Gradients for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <Container className="relative z-10 w-full">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="animate-reveal">
              <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] text-white/60 mb-6">
                <Link href="/projects" className="hover:text-white transition-colors flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Все проекты
                </Link>
                <span className="h-px w-8 bg-white/30" />
                <span>{project.categoryLabel || "Case Study"}</span>
              </div>
              
              <h1 className="text-[clamp(3rem,8vw,7rem)] font-heading font-bold leading-[0.9] tracking-[-0.04em] text-white uppercase max-w-[1000px] mb-6">
                {project.title}
              </h1>

              {project.shortDescription && (
                <p className="text-lg md:text-xl text-white/70 max-w-[600px] leading-relaxed animate-reveal [animation-delay:200ms] fill-mode-both">
                  {project.shortDescription}
                </p>
              )}
            </div>

            {/* Logo/Action side */}
            <div className="flex flex-col items-start md:items-end gap-6 shrink-0 animate-reveal [animation-delay:400ms] fill-mode-both">
              {project.href && (
                <Button
                  size="large"
                  asChild
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <a href={project.href} target="_blank" rel="noopener noreferrer">
                    Смотреть оригинал
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </Container>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Scroll</span>
          <CaretDown className="size-4" />
        </div>
      </section>

      {/* ── CONTENT & STICKY META ───────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 lg:gap-24">
          
          {/* Main Content (Left) */}
          <div className="min-w-0">
            {content ? (
              <article className="prose-case max-w-[800px] text-lg md:text-xl leading-[1.7]">
                {content}
              </article>
            ) : (
              <div className="prose-case max-w-[800px]">
                {project.description && <p>{project.description}</p>}
              </div>
            )}
          </div>

          {/* Sticky Sidebar (Right) */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 space-y-12">
              {project.clientName && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-3">Client</h4>
                  <p className="text-xl font-medium">{project.clientName}</p>
                </div>
              )}
              {project.period && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-3">Year</h4>
                  <p className="text-xl font-medium">{project.period}</p>
                </div>
              )}
              {project.platform && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-3">Platform</h4>
                  <p className="text-xl font-medium">{project.platform}</p>
                </div>
              )}
              {project.techStack && project.techStack.length > 0 && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-3">Stack</h4>
                  <ul className="space-y-1">
                    {project.techStack.map((tech) => (
                      <li key={tech} className="text-(--on-bg-medium)">{tech}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <Badge key={t.id} variant="outlined-static" size="chip-small">
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* ── FULL WIDTH GALLERY ──────────────────────────────────────── */}
      {project.media.length > 0 && (
        <section className="py-24 border-t border-(--outline)">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto px-6">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-8">
                Галерея
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {project.media.map((m) => (
                  <figure
                    key={m.id}
                    className="group rounded-2xl overflow-hidden border border-(--outline) bg-(--card) relative aspect-[4/3]"
                  >
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover bg-black"
                      />
                    ) : (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-zoom-in">
                        <Image
                          src={m.url}
                          alt={m.caption || ""}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </a>
                    )}
                    {m.caption && (
                      <figcaption className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white text-sm">
                        {m.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── NEXT PROJECT / RELATED ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-24 md:py-32 border-t border-(--outline)">
          <Container>
            <div className="max-w-[1200px] mx-auto">
              <div className="flex items-end justify-between mb-12">
                <h2 className="text-display-3 md:text-display-2 font-heading font-bold tracking-tight">
                  Следующие проекты
                </h2>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-sm text-(--on-bg-medium) hover:text-(--primary) transition-colors"
                >
                  Все проекты
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/projects/${r.id}/${r.slug}`}
                    className="group block relative aspect-[4/3] rounded-3xl overflow-hidden bg-(--card) border border-(--outline)"
                  >
                    {r.coverImage && (
                      <Image
                        fill
                        src={r.coverImage}
                        alt={r.title}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 text-white">
                      {r.categoryLabel && (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">
                          {r.categoryLabel}
                        </p>
                      )}
                      <h3 className="text-xl md:text-2xl font-heading font-semibold leading-tight">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
