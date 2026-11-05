"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { ArrowUpRight, ArrowLeft, Sparkle, Diamond, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import ProjectCard from "@/components/layout/projects/project-card";
import type { Project } from "@/utils/api/projects";
import { ContentMeta } from "@/components/layout/content-meta";

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
      } catch (err) { }
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
      {/* --- HERO (Чистый, без полноэкранного градиента) ---------------------─ */}
      <section className="relative w-full h-[80vh] md:h-[85vh] flex flex-col justify-end overflow-hidden bg-black">
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

        <Container className="relative z-10 w-full pb-8 md:pb-10">
          <div className="max-w-[1200px] mx-auto">
            <div className="animate-reveal">
              <div className={cn("flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] mb-6", textColor, textShadow)}>
                <Link href="/projects" className="hover:opacity-70 transition-opacity flex items-center gap-2">
                  <ArrowLeft className="size-4" />
                  Все проекты
                </Link>
              </div>

              <h1 className={cn(
                "text-6xl font-medium max-w-[1200px] mb-6",
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

              <div className="animate-reveal [animation-delay:300ms] fill-mode-both">
                <ContentMeta
                  slug={project.slug}
                  content={content}
                  updatedAt={project.period || new Date().toISOString()}
                  imageUrl={project.coverImage}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* --- CONTENT ------ */}
      {content && (
        <section className="py-12">
          <Container>
            <div className="max-w-[720px] mx-auto prose-case">
              {content}
            </div>
          </Container>
        </section>
      )}

      {/* --- GALLERY ------ */}
      {project.media.length > 0 && (
        <section className="py-12 border-(--outline)">
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

      {/* --- FANCY CTA --- */}
      <section className="py-12 border-(--outline) relative overflow-hidden">
        {/* Ambient background glow */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, var(--primary-glass), transparent 70%)" }}
        />

        <Container className="relative z-10">
          <div className="max-w-[900px] mx-auto">

            {/* Dotted Blueprint Frame */}
            <div className="relative rounded-3xl border-2 border-dotted border-(--on-bg-low)/30 p-8 md:p-16 flex flex-col items-center text-center bg-(--bg)/50 backdrop-blur-sm">

              {/* Top breaking icon */}
              <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 px-4">
                <div className="flex size-11 items-center justify-center bg-(--bg) text-(--on-bg-high) shadow-sm">
                  <Sparkle className="size-5" weight="fill" />
                </div>
              </div>

              {/* Editorial Headlines */}
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tighter text-(--on-bg-high) mb-6 leading-[1.05]">
                Хотите <span className="italic font-serif text-(--on-bg-medium)">такой же</span> <br />
                проект?
              </h2>

              <p className="text-body-2 text-(--on-bg-medium) max-w-md mx-auto mb-10 leading-relaxed">
                Расскажите о задаче. Мы ответим в течение рабочего дня, обсудим детали и предложим пошаговый план реализации.
              </p>

              {/* Pill CTA */}
              <QuickOrderDialog serviceName={project.title || "Разработка"}>
                <Button size="xlarge" shape="round" className="group px-8 hover:scale-105 transition-transform">
                  Обсудить задачу
                  <ArrowUpRight className="size-5 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </QuickOrderDialog>

              {/* <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 bg-(--bg) px-4">
                <div className="flex size-11 items-center justify-center rounded-full border border-(--outline) bg-(--card) text-(--on-bg-low) shadow-sm">
                  <Diamond className="size-5" weight="fill" />
                </div>
              </div> */}

            </div>
          </div>
        </Container>
      </section>

      {/* --- RELATED ------ */}
      {related.length > 0 && (
        <section className="py-12 pb-24 border-(--outline)">
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
                {related.map((r, idx) => {
                  const relatedProject: Project = {
                    id: r.id,
                    slug: r.slug,
                    title: r.title,
                    description: "",
                    shortDescription: "",
                    cover: { imageSrc: r.coverImage },
                    category: r.categoryLabel || "",
                    clientId: "",
                  };
                  return (
                    <ProjectCard
                      key={r.id || r.slug}
                      project={relatedProject}
                      index={idx}
                      variant="featured"
                    />
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      )
      }
    </main >
  );
}
