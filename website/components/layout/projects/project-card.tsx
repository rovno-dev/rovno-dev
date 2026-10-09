"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageBrokenIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { Project } from "@/app/_data/projects";

export interface ProjectTagRef {
  id?: string;
  name?: string;
  label?: string;
  slug?: string;
}

/**
 * Framed placeholder rendered when a project has no cover URL, or when the
 * cover URL fails to load. Reads as a design element rather than an error:
 * blueprint grid + accent bloom + tinted hairlines, with a broken-image
 * glyph and a bilingual label from useLanguage.
 */
function CoverFallback({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-(--bg)">
      {/* Blueprint grid, low opacity */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px),
            linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Diagonal hairlines — subtle texture under everything */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0, transparent 10px, var(--outline) 10px, var(--outline) 11px)",
        }}
      />
      {/* Accent bloom behind the icon */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 50%, var(--primary-glass), transparent 72%)",
        }}
      />
      {/* Centre content */}
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-(--outline) bg-(--card) shadow-sm">
          <ImageBrokenIcon
            className="size-7 text-(--on-bg-low)"
            weight="duotone"
          />
        </div>
        <div>
          <p className="text-body-3 font-medium leading-tight text-(--on-bg-high)">
            {label}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low)">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  index,
  categoryMap = {},
  tags = [],
}: {
  project: Project;
  index?: number;
  categoryMap?: Record<string, string>;
  tags?: ProjectTagRef[];
}) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState(false);
  const hasCover = Boolean(project.cover?.imageSrc?.trim());
  const showFallback = !hasCover || failed;
  const catLabel = project.category ? categoryMap[project.category] || project.category : "";
  // Normalize whatever shape we got — some sources send {name}, others
  // {label}, and legacy strings.
  const normalizedTags = (tags || [])
    .map((t) => {
      if (typeof t === "string") return t;
      return t.name || t.label || "";
    })
    .filter(Boolean)
    .slice(0, 8);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
    >
      <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-(--card) border border-(--outline) transition-all duration-300 hover:border-(--primary)/30 hover:shadow-lg hover:shadow-(--primary)/5">
        <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
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
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <div className="p-5 md:p-6 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-body-1 md:text-display-5 font-semibold text-(--on-bg-high) leading-tight truncate">
              {project.title}
            </h3>
            <span className="text-(--on-bg-low) text-xs shrink-0">↗</span>
          </div>

          {catLabel && (
            <p className="text-body-5 text-(--on-bg-medium) font-medium uppercase tracking-[0.14em]">
              {catLabel}
            </p>
          )}

          {/* Tags strip. One horizontal line, no scrollbar chrome. Overflow
              fades under the edge — the fade is what hints "there's more". */}
          {normalizedTags.length > 0 && (
            <div className="mt-1 flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
              {normalizedTags.map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="shrink-0 inline-flex items-center rounded-full border border-(--outline) bg-(--bg) px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-(--on-bg-medium)"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
