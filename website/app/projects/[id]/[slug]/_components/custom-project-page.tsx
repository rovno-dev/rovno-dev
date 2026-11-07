"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { ArrowUpRight, Sparkle } from "@phosphor-icons/react/dist/ssr";
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
  media: { id: string; type: "image" | "video"; url: string; caption?: string | null }[];
}

export interface RelatedRef {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  categoryLabel?: string;
}

type RGB = { r: number; g: number; b: number };

function extractHueFromRGB(c: RGB): number {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.03) return -1;
  let h: number;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return h * 60;
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hh = h / 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

function rgba({ r, g, b }: RGB, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Designed mesh - hue from the cover, every S/L fixed. */
function designMesh(hue: number) {
  return {
    base: hslToRgb(hue, 0.44, 0.68),
    highlight: hslToRgb(hue, 0.40, 0.86),
    bright: hslToRgb(hue, 0.28, 0.95),
    shadow: hslToRgb(hue, 0.52, 0.56),
    deep: hslToRgb(hue, 0.48, 0.50),
  };
}

const FALLBACK_HUE = 223;

function useCoverHue(src?: string): number | null {
  const [hue, setHue] = useState<number | null>(null);
  useEffect(() => {
    if (!src) { setHue(FALLBACK_HUE); return; }
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const settle = (h: number) => { if (!cancelled) setHue(h); };
    const timer = setTimeout(() => settle(FALLBACK_HUE), 2000);
    img.onload = () => {
      clearTimeout(timer);
      if (cancelled) return;
      try {
        const W = 24, H = 24;
        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) { settle(FALLBACK_HUE); return; }
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        let sx = 0, sy = 0, weight = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const c = Math.max(r, g, b) - Math.min(r, g, b);
          if (c < 10) continue;
          const h = extractHueFromRGB({ r, g, b });
          if (h < 0) continue;
          const rad = (h * Math.PI) / 180;
          sx += Math.cos(rad) * c;
          sy += Math.sin(rad) * c;
          weight += c;
        }
        if (weight === 0) { settle(FALLBACK_HUE); return; }
        let avg = (Math.atan2(sy, sx) * 180) / Math.PI;
        if (avg < 0) avg += 360;
        settle(avg);
      } catch { settle(FALLBACK_HUE); }
    };
    img.onerror = () => { clearTimeout(timer); settle(FALLBACK_HUE); };
    img.src = src;
    return () => { cancelled = true; clearTimeout(timer); };
  }, [src]);
  return hue;
}

export function CustomProjectPage({
  project, content, related,
}: {
  project: CustomProject & { id: string };
  content: React.ReactNode;
  related: RelatedRef[];
}) {
  const isVideo =
    project.coverVideo?.endsWith(".webm") ||
    project.coverVideo?.endsWith(".mp4");
  const hue = useCoverHue(isVideo ? undefined : project.coverImage);
  const mesh = designMesh(hue ?? FALLBACK_HUE);

  const textColor = "text-[var(--dark-8)]";
  const subTextColor = "text-[var(--dark-8)]/70";
  const textShadow = "drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]";

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const headingY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <>
      <section ref={heroRef} className="relative isolate overflow-hidden">
        {/* ── Dia-style mesh backdrop ──────────────────────────────────
            Mask changes since the last pass:
             - Fade-in is faster (8-22% instead of 20-58%): the mesh now
               reaches full strength near the header instead of half-way
               down, so the pattern reads as "the hero" rather than "a
               band behind the title". That is what "full cover size"
               means in practice.
             - Fade-out is later (88-100% instead of 85-100%): the mesh
               stays dense until it hands off to --bg under ContentMeta.
             - Stops are still 8 discrete alphas, not 2 endpoints, so the
               ramp reads as continuous - a 2-stop mask bands badly on
               wide hero fields.

            The mask is alpha-only. A `linear-gradient(var(--bg), ...,
            transparent)` veil would interpolate toward transparent-black
            and produce a gray band - that was the previous behaviour. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          style={{
            WebkitMaskImage: `linear-gradient(to bottom,
              rgba(0,0,0,0.92) 0%,
              black 5%,
              black 100%)`,
            maskImage: `linear-gradient(to bottom,
              rgba(0,0,0,0.92) 0%,
              black 5%,
              black 100%)`,
            // Instant swap - no transition. The 900ms fade used to run
            // concurrently with body's transition-colors on every theme
            // toggle, producing a muddy intermediate state. Hidden while
            // hue is null (during extraction), shown the moment it
            // resolves.
            opacity: hue === null ? 0 : 1,
          }}
        >
          {/* Base fill */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `color-mix(in srgb, var(--bg) 20%, ${rgba(mesh.base, 1)} 80%)`,
            }}
          />

          {/* Mesh blobs. Each in its own div so CSS can drift the
              transform independently - `at X% Y%` cannot be animated. */}
          <div className="mesh-blob-1 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 60% 55% at 20% 82%, ${rgba(mesh.highlight, 1)} 0%, ${rgba(mesh.highlight, 0)} 65%)` }} />
          <div className="mesh-blob-2 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 50% 45% at 80% 18%, ${rgba(mesh.bright, 0.85)} 0%, ${rgba(mesh.bright, 0)} 60%)` }} />
          <div className="mesh-blob-3 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 75% 65% at 82% 88%, ${rgba(mesh.shadow, 0.95)} 0%, ${rgba(mesh.shadow, 0)} 70%)` }} />
          <div className="mesh-blob-4 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 50% 55% at 15% 15%, ${rgba(mesh.deep, 0.75)} 0%, ${rgba(mesh.deep, 0)} 62%)` }} />

          {/* Drifting dot pattern. Light glints at 20% opacity, 22px
              spacing, moved diagonally on a 20s loop. Subtle, but it
              gives the surface a real "pattern" that reads as texture
              rather than a flat wash. `background-position` animates
              without a transform, which keeps this off the compositor. */}
          <div
            className="hero-dot-drift pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1.4px)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Fine grain - drifting film texture. */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 0.42, mixBlendMode: "overlay" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <filter id="hero-grain-fine">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              filter="url(#hero-grain-fine)"
              className="hero-grain-drift"
            />
          </svg>

          {/* Coarse grain - broad tonal variation. */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{ opacity: 0.16, mixBlendMode: "soft-light" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <filter id="hero-grain-coarse">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect x="-20%" y="-20%" width="140%" height="140%" filter="url(#hero-grain-coarse)" />
          </svg>

          {/* Soft light sweep - the "magic". A single oversized radial
              gradient drifting across the hero on a 26s loop at ~18%
              opacity in soft-light blend. Reads as light moving through
              a clouded sky, not as an effect. `will-change` promotes it
              once; `translate3d` keeps the drift on the compositor. */}
          <div
            className="hero-light-sweep pointer-events-none absolute"
            style={{
              inset: "-30%",
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 30%, transparent 60%)",
              mixBlendMode: "soft-light",
              opacity: 0.5,
            }}
          />
        </div>

        {/* Centred headline. Padding tightened ~40% from the last pass:
            the previous pb-32/44/56 with a fast mask was over 60% empty
            gradient, which is exactly the "cheap" read - the field was
            dominating instead of the content. */}
        <Container variant="full-width" className="relative z-10">
          <motion.div
            style={{ y: headingY, opacity: headingOpacity }}
            className="mx-auto max-w-[1400px] pt-24 sm:pt-36 md:pt-38 lg:pt-30 pb-16 md:pb-20 lg:pb-28 text-center"
          >
            {/* Title fades + lifts on mount. This is the extra "magic"
                on top of the drifting field: one orchestrated entrance
                reads as considered, a dozen small effects read as
                amateur. 1.2s is slow enough to feel intentional, fast
                enough not to block reading. */}
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className={cn(
                "text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8.5rem] font-medium tracking-[-0.045em] leading-[0.9] mb-6 text-balance",
                textColor,
                textShadow,
              )}
            >
              {project.title}
            </motion.h1>
            {project.shortDescription && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
                className={cn(
                  "text-lg md:text-xl max-w-[640px] mx-auto leading-relaxed text-balance",
                  subTextColor,
                  textShadow,
                )}
              >
                {project.shortDescription}
              </motion.p>
            )}
          </motion.div>
        </Container>
      </section>

      {/* ──────────────────────────── META ──────────────────────────── */}
      <Container variant="full-width" className="relative pt-10 md:pt-12">
        <div className="mx-auto max-w-[1000px]">
          <ContentMeta
            entityType="project"
            entityId={project.slug}
            content={content}
            updatedAt={project.period || new Date().toISOString()}
            imageUrl={project.coverImage}
          />
        </div>
      </Container>

      {/* ──────────────────────────── CONTENT ──────────────────────────── */}
      {
        content && (
          <section className="py-12">
            <Container>
              <div className="max-w-[720px] mx-auto prose-case">{content}</div>
            </Container>
          </section>
        )
      }

      {/* ──────────────────────────── GALLERY ──────────────────────────── */}
      {
        project.media.length > 0 && (
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
                        <video src={m.url} controls playsInline preload="metadata" className="w-full h-full object-cover bg-black" />
                      ) : (
                        <Image src={m.url} alt={m.caption || ""} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
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
        )
      }

      {/* ──────────────────────────── CTA ──────────────────────────── */}
      <section className="py-12 border-(--outline) relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, var(--primary-glass), transparent 70%)" }} />
        <Container className="relative z-10">
          <div className="max-w-[900px] mx-auto">
            <div className="relative rounded-3xl p-8 md:p-16 flex flex-col items-center text-center bg-(--bg)/50 backdrop-blur-sm">
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-(--on-bg-medium)"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="geometricPrecision"
              >
                <rect x="0" y="0" width="100%" height="100%" rx="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="0.01 11" strokeLinecap="round" />
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
                <br />проект?
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) max-w-md mx-auto mb-10 leading-relaxed">
                Расскажите о задаче. Мы ответим в течение рабочего дня, обсудим детали и предложим пошаговый план реализации.
              </p>
              <QuickOrderDialog serviceName={project.title || "Разработка"}>
                <Button size="xlarge" shape="round" className="group px-8 hover:scale-105 transition-transform">
                  Обсудить задачу
                  <ArrowUpRight className="size-5 ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </QuickOrderDialog>
            </div>
          </div>
        </Container>
      </section>

      {/* ──────────────────────────── RELATED ──────────────────────────── */}
      {
        related.length > 0 && (
          <section className="py-12 pb-24 border-(--outline)">
            <Container>
              <div className="max-w-[1200px] mx-auto">
                <div className="flex items-end justify-between mb-12">
                  <h2 className="text-display-3 md:text-display-2 font-heading font-semibold tracking-tight">
                    Следующие проекты
                  </h2>
                  <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-(--on-bg-medium) hover:text-(--primary) transition-colors">
                    Все проекты
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {related.map((r, idx) => {
                    const rp: Project = {
                      id: r.id, slug: r.slug, title: r.title, description: "",
                      shortDescription: "", cover: { imageSrc: r.coverImage },
                      category: r.categoryLabel || "", clientId: "",
                    };
                    return <ProjectCard key={r.id || r.slug} project={rp} index={idx} variant="featured" />;
                  })}
                </div>
              </div>
            </Container>
          </section>
        )
      }
    </>
  );
}
