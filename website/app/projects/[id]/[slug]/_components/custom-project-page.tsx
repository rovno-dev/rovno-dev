"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
import ProjectCard from "@/components/layout/projects/project-card";
import type { Project } from "@/utils/api/projects";
import { ContentMeta } from "@/components/layout/content-meta";
import { Toc, type TocHeading } from "@/components/layout/toc/toc";
import { NovelReadOnly } from "@/components/editor/novel/novel-readonly";

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
  media: { id: string; type: "image" | "video"; url: string; caption?: string | null }[];
}

export interface RelatedRef {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  categoryLabel?: string;
}

// Minimalist case-info table: label left / value right, thin row rules.
// No chips, no icons, no numbers.
function CaseInfo({ project }: { project: CustomProject }) {
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (project.categoryLabel)
    rows.push({ label: "Industry", value: project.categoryLabel });
  if (project.clientName)
    rows.push({ label: "Client", value: project.clientName });
  if (project.period) rows.push({ label: "Year", value: project.period });
  if (project.platform)
    rows.push({ label: "Platform", value: project.platform });
  if (project.techStack.length > 0)
    rows.push({ label: "Stack", value: project.techStack.join(", ") });
  if (project.href)
    rows.push({
      label: "Link",
      value: (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-(--primary) underline-offset-2 hover:underline"
        >
          {project.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          <ArrowUpRight className="size-3.5" />
        </a>
      ),
    });

  if (rows.length === 0) return null;

  return (
    <section className="pt-10 md:pt-14">
      <Container>
        <div className="mx-auto max-w-[1200px] divide-y divide-(--outline) border-y border-(--outline)">
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[120px_1fr] md:grid-cols-[200px_1fr] items-baseline gap-4 md:gap-8 py-4 md:py-5"
            >
              <span className="text-body-4 text-(--on-bg-low)">{r.label}</span>
              <span className="text-body-3 text-(--on-bg-high) md:text-right">
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CustomProjectPage({
  project,
  content,
  contentJson,
  related,
  headings,
  forceMobileToc = true,
}: {
  project: CustomProject & { id: string };
  content: React.ReactNode;
  contentJson?: any;
  related: RelatedRef[];
  headings?: TocHeading[];
  forceMobileToc?: boolean;
}) {
  const [liveHeadings, setLiveHeadings] = useState<TocHeading[]>([]);

  const isVideo =
    project.coverVideo?.endsWith(".webm") ||
    project.coverVideo?.endsWith(".mp4");

  const fallbackHeadings: TocHeading[] = [];
  if (content)
    fallbackHeadings.push({ id: "content", text: "Описание", level: 2 });
  if (project.media.length > 0)
    fallbackHeadings.push({ id: "gallery", text: "Галерея", level: 2 });
  if (related.length > 0)
    fallbackHeadings.push({
      id: "next-projects",
      text: "Следующие проекты",
      level: 2,
    });

  const effectiveHeadings: TocHeading[] =
    liveHeadings.length > 0
      ? liveHeadings
      : headings && headings.length > 0
        ? headings
        : fallbackHeadings;

  // Parallax: cover drifts + grows as the hero scrolls out. Oversized
  // inset so no edge appears during the drift.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <main className="mt-20">
      {/* HERO - cover block, no page gradient, display-4 title at bottom */}
      <section ref={heroRef} className="relative isolate overflow-hidden ">
        <Container variant="full-width">
          <div className="mx-auto max-w-[1400px] space-y-6 md:space-y-8">
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-3xl md:rounded-4xl bg-(--card) border border-(--outline)">
              {isVideo ? (
                <motion.div
                  style={{ scale: mediaScale, y: mediaY }}
                  className="absolute inset-[-15%]"
                >
                  <video
                    src={project.coverVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ) : project.coverImage ? (
                <motion.div
                  style={{ scale: mediaScale, y: mediaY }}
                  className="absolute inset-[-15%]"
                >
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <div className="absolute inset-0 bg-(--bg)" />
              )}
            </div>
            <h1 className="text-display-4 text-(--on-bg-medium) tracking-tight px-1 md:px-0">
              {project.title}
            </h1>
          </div>
        </Container>
      </section>

      <CaseInfo project={project} />

      <Container>
        <div className="mx-auto max-w-[1200px]">
          <ContentMeta
            entityType="project"
            entityId={project.slug}
            content={contentJson || content}
            updatedAt={project.period || new Date().toISOString()}
            imageUrl={project.coverImage}
          />
        </div>
      </Container>

      {(contentJson || content) && (
        <section id="content" className="py-12">
          <Container>
            <article className="min-w-0">
              {contentJson ? (
                <NovelReadOnly
                  content={contentJson}
                  onHeadingsChange={setLiveHeadings}
                />
              ) : (
                content
              )}
            </article>
            <div className="space-y-8">
              {effectiveHeadings.length > 0 && (
                <Toc
                  variant={forceMobileToc ? "floating" : "sidebar"}
                  headings={effectiveHeadings}
                  label="Содержание"
                  ariaLabel="Содержание проекта"
                />
              )}
            </div>
          </Container>
        </section>
      )}

      {project.media.length > 0 && (
        <section id="gallery" className="py-12 border-(--outline)">
          <Container>
            <div className="max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
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

      <section className="py-12 border-(--outline) relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, var(--primary-glass), transparent 70%)",
          }}
        />
        <Container className="relative z-10">
          <div className="w-full mx-auto">
            <div className="relative rounded-3xl p-8 md:p-16 flex flex-col items-center text-center bg-(--bg)/50 backdrop-blur-sm">
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-(--on-bg-medium)"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
              >
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  rx="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeDasharray="0.01 11"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 px-4">
                <div className="flex size-11 items-center justify-center bg-(--bg) text-(--on-bg-high)">
                  <Sparkle className="size-5" weight="fill" />
                </div>
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tighter text-(--on-bg-high) mb-6 leading-[1.05]">
                Хотите{" "}
                <span className="italic font-serif text-(--on-bg-medium)">
                  такой же
                </span>{" "}
                <br />
                проект?
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) max-w-md mx-auto mb-10 leading-relaxed">
                Расскажите о задаче. Мы ответим в течение рабочего дня,
                обсудим детали и предложим пошаговый план реализации.
              </p>
              <QuickOrderDialog serviceName={project.title || "Разработка"}>
                <Button
                  size="xlarge"
                  shape="round"
                  className="group px-8 hover:scale-105 transition-transform"
                >
                  Обсудить задачу
                  <ArrowUpRight className="size-5 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </QuickOrderDialog>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section id="next-projects" className="py-12 pb-24 border-(--outline)">
          <Container>
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-display-3 md:text-display-2 font-heading tracking-tight">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {related.map((r, idx) => {
                const rp: Project = {
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
                    project={rp}
                    index={idx}
                    variant="clean"
                  />
                );
              })}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
