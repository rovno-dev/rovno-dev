"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

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
  const isVideo =
    project.coverVideo?.endsWith(".webm") ||
    project.coverVideo?.endsWith(".mp4");

  const [bgColor, setBgColor] = useState<{ r: number; g: number; b: number } | null>(null);

  // Вычисляем средний цвет нижней трети обложки, чтобы понять, какой текст использовать
  useEffect(() => {
    if (!project.coverImage || isVideo) return;
    let isCancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = project.coverImage;
    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        // Сэмплируем нижние 30% (там, где обычно лежит текст)
        const sampleHeight = img.naturalHeight * 0.3;
        const yOffset = img.naturalHeight - sampleHeight;
        ctx.drawImage(img, 0, yOffset, img.naturalWidth, sampleHeight, 0, 0, 10, 10);
        
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count > 0) {
          setBgColor({
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count),
          });
        }
      } catch (err) {}
    };
    return () => {
      isCancelled = true;
    };
  }, [project.coverImage, isVideo]);

  const isLight = useMemo(() => {
    if (!bgColor) return false; // По умолчанию (если не удалось определить) используем белый текст
    const luminance = (0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b) / 255;
    return luminance > 0.55; 
  }, [bgColor]);

  const textColor = isLight ? "text-[var(--dark-8)]" : "text-[var(--gray-0)]";
  const textShadow = isLight 
    ? "drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]" 
    : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]";

  return (
    <main className="min-h-screen bg-(--bg) text-(--on-bg-high) selection:bg-(--primary) selection:text-(--on-primary)">
      {/* ── HERO (Чистый, без полноэкранного градиента) ─────────────── */}
      <section className="relative w-full h-[85vh] md:h-[90vh] flex flex-col justify-end overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video
              src={project.coverVideo}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
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
        </div>

        <Container className="relative z-10 w-full pb-12 md:pb-24">
          <div className="max-w-[1200px] mx-auto">
            <div className="animate-reveal">
              <div className={cn("flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] mb-6", textColor, textShadow)}>
                <Link href="/projects" className="hover:opacity-70 transition-opacity flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Все проекты
                </Link>
                <span className="h-px w-8 bg-current opacity-30" />
                <span>{project.categoryLabel || "Case Study"}</span>
              </div>
              
              <h1 className={cn(
                "text-[clamp(3rem,8vw,7rem)] font-heading font-bold leading-[0.9] tracking-[-0.04em] uppercase max-w-[1200px] mb-6",
                textColor, textShadow
              )}>
                {project.title}
              </h1>
              
              {project.shortDescription && (
                <p className={cn(
                  "text-lg md:text-xl max-w-[600px] leading-relaxed animate-reveal [animation-delay:200ms] fill-mode-both",
                  isLight ? "text-[var(--dark-8)]/80" : "text-[var(--gray-0)]/80",
                  textShadow
                )}>
                  {project.shortDescription}
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── META STRIP (Как в Vercel) ──────────────────────────────── */}
      <section className="border-b border-(--outline) bg-(--bg)">
        <Container>
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 py-8 md:py-12">
            {project.clientName && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-2">Client</h4>
                <p className="text-body-3 font-medium">{project.clientName}</p>
              </div>
            )}
            {project.period && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-2">Year</h4>
                <p className="text-body-3 font-medium">{project.period}</p>
              </div>
            )}
            {project.platform && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-2">Platform</h4>
                <p className="text-body-3 font-medium">{project.platform}</p>
              </div>
            )}
            {project.techStack && project.techStack.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-2">Stack</h4>
                <p className="text-body-3 font-medium">{project.techStack.join(", ")}</p>
              </div>
            )}
            {project.href && (
              <div className="col-span-2 md:col-span-4 pt-4 md:pt-0">
                <Button variant="outlined" size="small" asChild>
                  <a href={project.href} target="_blank" rel="noopener noreferrer">
                    Посмотреть оригинал <ArrowUpRight className="size-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      {content && (
        <section className="py-16 md:py-24">
          <Container>
            <div className="max-w-[720px] mx-auto prose-case">
              {content}
            </div>
          </Container>
        </section>
      )}

      {/* ── GALLERY ─────────────────────────────────────────────────── */}
      {project.media.length > 0 && (
        <section className="py-16 md:py-24 border-t border-(--outline)">
          <Container>
            <div className="max-w-[1200px] mx-auto">
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
                      <Image
                        src={m.url}
                        alt={m.caption || ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
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

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-(--outline)">
        <Container>
          <div className="max-w-[800px] mx-auto text-center rounded-4xl border border-(--outline) bg-(--card) p-8 md:p-16">
            <h2 className="text-display-3 md:text-display-2 font-heading font-semibold tracking-tight mb-4">
              Хотите такой же проект?
            </h2>
            <p className="text-body-2 text-(--on-bg-medium) mb-8 max-w-lg mx-auto">
              Расскажите о задаче — ответим в течение 3 часов и предложим план.
            </p>
            <QuickOrderDialog serviceName={project.title || "Разработка"}>
              <Button size="xlarge" variant="filled">
                Обсудить задачу
                <ArrowUpRight className="size-5" />
              </Button>
            </QuickOrderDialog>
          </div>
        </Container>
      </section>

      {/* ── RELATED ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-24 border-t border-(--outline)">
          <Container>
            <div className="max-w-[1200px] mx-auto">
              <div className="flex items-end justify-between mb-12">
                <h2 className="text-display-3 md:text-display-2 font-heading font-semibold tracking-tight">
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
