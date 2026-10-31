"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageBrokenIcon, ArrowUpRight, ArrowSquareOut } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { Project } from "@/app/_data/projects";
import { CLIENTS } from "@/app/_data/clients";

export interface ProjectTagRef {
  id?: string;
  name?: string;
  label?: string;
  slug?: string;
}

function CoverFallback({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-(--bg)">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-(--outline) bg-(--card) shadow-sm">
          <ImageBrokenIcon className="size-7 text-(--on-bg-low)" weight="duotone" />
        </div>
        <div>
          <p className="text-body-3 font-medium leading-tight text-(--on-bg-high)">{label}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low)">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function ScrollableTitle({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setIsOverflowing(textRef.current.offsetWidth > containerRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div className={`flex whitespace-nowrap ${isOverflowing ? 'group-hover:animate-marquee' : ''}`}>
        <span ref={textRef} className="text-lg md:text-xl font-heading font-medium text-white leading-[1.2] tracking-tight pr-8">
          {text}
        </span>
        {isOverflowing && (
          <span className="text-lg md:text-xl font-heading font-medium text-white leading-[1.2] tracking-tight pr-8">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  index,
  tags = [],
  variant = "classic",
}: {
  project: Project;
  index?: number;
  categoryMap?: Record<string, string>;
  tags?: ProjectTagRef[];
  variant?: "classic" | "featured";
}) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);
  const hasCover = Boolean(project.cover?.imageSrc?.trim());
  const showFallback = !hasCover || failed;

  const client = project.clientId ? CLIENTS[project.clientId] : null;
  const normalizedTags = (tags || [])
    .map((t) => (typeof t === "string" ? t : t.name || t.label || ""))
    .filter(Boolean)
    .slice(0, 3);

  // ── FEATURED VARIANT (Top-aligned Elegant) ───────────────────────────
  if (variant === "featured") {
    return (
      <Link
        href={`/projects/${project.slug}`}
        className="group block animate-reveal fill-mode-both relative w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden border border-(--outline) bg-(--card) shadow-2xl transition-all duration-500 hover:border-(--primary)/50"
        style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
      >
        {showFallback ? (
          <CoverFallback label={t("projects.cover.fallback")} hint={t("projects.cover.fallback_hint")} />
        ) : (
          <Image
            src={project.cover.imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 50vw"
            className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            onError={() => setFailed(true)}
          />
        )}
        
        {/* Strong top gradient for guaranteed text contrast */}
        <div className="absolute inset-x-0 top-0 h-[65%] bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
        
        {/* Top Content Container */}
        <div className="absolute top-0 inset-x-0 p-4 md:p-5 flex flex-col z-10 pointer-events-none">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between w-full mb-3">
            {client ? (
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full pl-1 pr-3 py-1">
                <div className="size-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {client.logotype ? (
                    <Image src={client.logotype} alt={client.name} width={24} height={24} className="object-contain p-0.5" />
                  ) : (
                    <span className="text-black font-bold text-[9px]">{client.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-white font-medium text-[11px] truncate max-w-[120px]">{client.name}</span>
              </div>
            ) : <div />}

            <div className="size-8 md:size-9 rounded-lg bg-white text-black flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 pointer-events-auto">
              <ArrowSquareOut className="size-4 md:size-5" weight="bold" />
            </div>
          </div>

          {/* Title with Gradient Fade and Autoscroll */}
          <div
            className="w-[90%] pointer-events-none"
            style={{
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
            }}
          >
            <ScrollableTitle text={project.title} />
          </div>

        </div>
      </Link>
    );
  }

  // ── CLASSIC VARIANT (Default) ────────────────────────────────────────
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
    >
      <div className="relative h-full flex flex-col overflow-hidden rounded-3xl bg-(--card) border border-(--outline) transition-all duration-300 hover:border-(--primary)/30 hover:shadow-xl hover:shadow-(--primary)/5">
        
        <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0 border-b border-(--outline)">
          {showFallback ? (
            <CoverFallback label={t("projects.cover.fallback")} hint={t("projects.cover.fallback_hint")} />
          ) : (
            <Image
              src={project.cover.imageSrc}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              onError={() => setFailed(true)}
            />
          )}
        </div>
        
        <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
          {normalizedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {normalizedTags.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="inline-flex items-center rounded-full border border-(--outline) bg-(--bg) px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-(--on-bg-medium)"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-start justify-between gap-4 mt-auto">
            <div className="min-w-0">
              <h3 className="text-xl md:text-2xl font-heading font-semibold text-(--on-bg-high) leading-[1.2] line-clamp-3 text-balance transition-colors group-hover:text-(--primary)">
                {project.title}
              </h3>
              {project.shortDescription && (
                <p className="mt-2 text-body-4 text-(--on-bg-medium) line-clamp-2">
                  {project.shortDescription}
                </p>
              )}
            </div>
            
            <div className="size-10 shrink-0 rounded-full border border-(--outline) bg-(--bg) flex items-center justify-center text-(--on-bg-low) group-hover:bg-(--primary) group-hover:text-(--on-primary) group-hover:border-(--primary) transition-all duration-300">
              <ArrowUpRight className="size-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
