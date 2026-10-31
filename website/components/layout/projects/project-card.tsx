"use client";
import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageBrokenIcon, ArrowUpRight } from "@phosphor-icons/react";
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

function MarqueeText({
  text,
  className,
  style,
  speed = 40, // Faster animation
  gap = 40,
  pause = 2,  // Starts moving almost immediately
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  gap?: number;
  pause?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isMarquee, setIsMarquee] = useState(false);
  const [travel, setTravel] = useState(0);
  const [animName] = useState(
    () => `__mq_${Math.random().toString(36).slice(2, 7)}`
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const probe = probeRef.current;
    if (!wrapper || !probe) return;

    const measure = () => {
      const lh = parseFloat(getComputedStyle(probe).lineHeight);
      const wraps = probe.scrollHeight > Math.ceil(lh) + 2;
      setIsMarquee(wraps);
    };

    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    measure();
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    if (isMarquee && trackRef.current) {
      const cycleWidth = trackRef.current.scrollWidth / 2;
      setTravel(cycleWidth / speed);
    }
  }, [isMarquee, text, gap, speed]);

  const total = travel + pause;
  const holdPct = total > 0 ? (pause / total) * 100 : 0;
  const trackClass = `mq-track-${animName}`;

  return (
    <div ref={wrapperRef} className="relative min-w-0 flex-1 overflow-hidden">
      <span
        ref={probeRef}
        aria-hidden="true"
        className={className}
        style={{
          ...style,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          visibility: "hidden",
          whiteSpace: "normal",
          pointerEvents: "none",
        }}
      >
        {text}
      </span>

      {isMarquee ? (
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <style>{`
            @keyframes ${animName} {
              0%, ${holdPct}% { transform: translateX(0); }
              100%            { transform: translateX(-50%); }
            }
            .${trackClass} {
              animation: ${animName} ${total}s linear infinite;
              animation-play-state: paused;
            }
            .group:hover .${trackClass} {
              animation-play-state: running;
            }
          `}</style>

          <div
            ref={trackRef}
            className={`${trackClass} flex w-max whitespace-nowrap`}
            style={{ willChange: "transform" }}
          >
            <span className={className} style={style}>
              {text}
            </span>
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: gap, flexShrink: 0 }}
            />
            <span className={className} style={style} aria-hidden="true">
              {text}
            </span>
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: gap, flexShrink: 0 }}
            />
          </div>
        </div>
      ) : (
        <h3 className={className} style={style}>
          {text}
        </h3>
      )}
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

  const clientInitials = client?.name
    ? client.name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";

  // ── Color Extraction for Featured Variant ─────────────────────────
  const [bgColor, setBgColor] = useState<{ r: number; g: number; b: number } | null>(null);

  useEffect(() => {
    if (variant !== "featured" || !project.cover?.imageSrc || showFallback) return;

    let isCancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = project.cover.imageSrc;

    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Sample top 30% of the image
        const sampleHeight = img.naturalHeight * 0.3;
        ctx.drawImage(img, 0, 0, img.naturalWidth, sampleHeight, 0, 0, 10, 10);
        
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue; // ignore transparent pixels
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
      } catch (err) {
        // CORS error, fallback to default black gradient
      }
    };

    return () => {
      isCancelled = true;
    };
  }, [project.cover?.imageSrc, variant, showFallback]);

  const isLight = useMemo(() => {
    if (!bgColor) return false; // Default to dark bg, white text
    const luminance = (0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b) / 255;
    return luminance > 0.55; 
  }, [bgColor]);

  const gradientStyle = bgColor 
    ? { background: `linear-gradient(to bottom, rgba(${bgColor.r},${bgColor.g},${bgColor.b}, 0.9) 0%, rgba(${bgColor.r},${bgColor.g},${bgColor.b}, 0.4) 50%, transparent 100%)` }
    : { background: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" };

  const textColorClass = isLight ? "text-[var(--dark-8)]" : "text-[var(--gray-0)]";
  const shadowClass = isLight ? "drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]";

  // ── FEATURED VARIANT ─────────────────────────────────────────────
  if (variant === "featured") {
    return (
      <Link
        href={`/projects/${project.slug}`}
        className="group block animate-reveal fill-mode-both relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-(--outline) bg-(--card) transition-colors duration-500 hover:border-(--primary)/40"
        style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
      >
        {showFallback ? (
          <CoverFallback
            label={t("projects.cover.fallback")}
            hint={t("projects.cover.fallback_hint")}
          />
        ) : (
          <Image
            src={project.cover.imageSrc}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 50vw"
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            onError={() => setFailed(true)}
          />
        )}

        {/* Dynamic Gradient - uses dominant color of image top */}
        <div 
          className="absolute inset-x-0 top-0 h-[55%] pointer-events-none z-[1] transition-colors duration-500" 
          style={gradientStyle}
        />

        {/* Top Row - Title, Description, Action */}
        <div className="absolute inset-x-0 top-0 p-3 md:p-4 z-10 flex items-center justify-between gap-4 pointer-events-none">
          <div className="flex flex-col max-w-[85%] min-w-0">
            <MarqueeText
              text={project.title}
              className={`text-lg md:text-xl font-heading font-semibold leading-tight tracking-tight ${textColorClass} ${shadowClass}`}
            />
            {project.shortDescription && (
              <p className={`mt-1.5 text-xs md:text-sm leading-snug line-clamp-2 ${isLight ? 'text-[var(--dark-8)]/80' : 'text-[var(--gray-0)]/80'} ${shadowClass}`}>
                {project.shortDescription}
              </p>
            )}
          </div>

          {/* Fixed Arrow Container */}
          <div 
            className={`flex items-center justify-center shrink-0 size-8 rounded-md shadow-sm transition-transform duration-300 group-hover:scale-105 ${
              isLight 
                ? "bg-[var(--dark-8)] text-[var(--gray-0)]" 
                : "bg-white text-black"
            }`}
          >
            <ArrowUpRight className="size-4!" weight="bold" />
          </div>
        </div>

        {/* Bottom Row - Client Logo */}
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 z-10 pointer-events-none">
          {client ? (
            <div
              className="size-11 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg ring-1 ring-black/10 pointer-events-auto"
              aria-label={client.name}
            >
              {client.logotype ? (
                <Image
                  src={client.logotype}
                  alt={client.name}
                  width={44}
                  height={44}
                  className="object-contain p-1.5"
                />
              ) : (
                <span className="text-black font-bold text-xs tracking-tight">
                  {clientInitials}
                </span>
              )}
            </div>
          ) : <div />}
        </div>
      </Link>
    );
  }

  // ── CLASSIC VARIANT ──────────────────────────────────────────────
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block animate-reveal fill-mode-both h-full"
      style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
    >
      <div className="relative h-full flex flex-col overflow-hidden rounded-3xl bg-(--card) border border-(--outline) transition-all duration-300 hover:border-(--primary)/30 hover:shadow-xl hover:shadow-(--primary)/5">
        <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0 border-b border-(--outline)">
          {showFallback ? (
            <CoverFallback
              label={t("projects.cover.fallback")}
              hint={t("projects.cover.fallback_hint")}
            />
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
