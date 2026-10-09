"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import ProjectCard from "@/components/layout/projects/project-card";
import type { Project } from "@/app/_data/projects";
import type { Taxonomy } from "@/utils/api/taxonomies";
import {
  MagnifyingGlassIcon,
  XIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Extract the visible tag labels from a project. Tag records come from the
 * backend; the RSC page maps DB rows to `{ title }` entries, so this stays
 * agnostic of the source shape.
 */
function tagsOf(p: Project): string[] {
  return (p.tags || [])
    .map((t) => (t.title || "").trim())
    .filter((v): v is string => v.length > 0);
}

/**
 * Filter bar + project grid. Purely presentational: every project comes
 * down as a prop from the RSC page, which fetches them from the DB with an
 * ISR tag. No client-side fetch, no merge with local data — the grid shows
 * exactly what the database returns, subject to the active filters.
 */
export function FilterBar({
  projects,
  categories,
  categoryMap,
}: {
  projects: Project[];
  categories: Taxonomy[];
  categoryMap: Record<string, string>;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cache tag labels per slug so filtering doesn't recompute on each render.
  const tagsBySlug = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const p of projects) m.set(p.slug, tagsOf(p));
    return m;
  }, [projects]);
  const tagListForSlug = (slug: string) => tagsBySlug.get(slug) ?? [];

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const t of tagsBySlug.get(p.slug) ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [projects, tagsBySlug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeTag && !tagListForSlug(p.slug).includes(activeTag)) return false;
      if (q) {
        const haystack = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, activeCategory, activeTag, search, tagsBySlug]);

  const hasActiveFilters =
    !!search.trim() || activeCategory !== null || activeTag !== null;
  const activeFilterCount = (activeCategory ? 1 : 0) + (activeTag ? 1 : 0);

  const resetAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveTag(null);
  };

  const liveCategoryCount = (code: string | null) => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (code !== null && p.category !== code) return false;
      if (activeTag && !tagListForSlug(p.slug).includes(activeTag)) return false;
      if (q) {
        const h = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    }).length;
  };

  const liveTagCount = (label: string) => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (!tagListForSlug(p.slug).includes(label)) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (q) {
        const h = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!h.includes(q)) return false;
      }
      return true;
    }).length;
  };

  const categoryChips = useMemo(
    () => [
      { id: "__all__", label: "Все", active: activeCategory === null },
      ...categories.map((c) => ({
        id: c.code,
        label: c.labels.en || c.label || c.code,
        active: activeCategory === c.code,
      })),
    ],
    [categories, activeCategory],
  );

  return (
    <>
      {/* Floating pill — same visual language as the header. */}
      <div className="sticky top-[68px] md:top-[92px] z-40 mt-4 mb-5">
        <Container>
          <div
            className={cn(
              "flex items-center gap-1 h-12 md:h-[56px] rounded-full",
              "border border-(--outline) bg-(--bg)/80 backdrop-blur-glass",
              "shadow-[0_1px_2px_rgba(0,0,0,0.04)] pl-4 pr-1.5",
            )}
          >
            <div className="relative flex-1 md:flex-initial md:w-[200px] h-full flex items-center">
              <MagnifyingGlassIcon className="absolute left-0 size-4 text-(--on-bg-low) pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск…"
                className={cn(
                  "w-full h-full pl-7 pr-7 bg-transparent outline-none",
                  "text-body-4 placeholder:text-(--on-bg-low)",
                )}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Очистить"
                  className="absolute right-0 inline-flex items-center justify-center size-5 rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>
            <div className="hidden md:flex flex-1 min-w-0 items-center gap-1.5 pl-3 ml-2 border-l border-(--outline) h-8">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar h-full">
                {categoryChips.map((c) => {
                  const code = c.id === "__all__" ? null : c.id;
                  const count = liveCategoryCount(code);
                  return (
                    <Pill
                      key={c.id}
                      label={c.label}
                      count={count}
                      active={c.active}
                      disabled={count === 0 && !c.active}
                      onClick={() => setActiveCategory(c.active ? null : code)}
                    />
                  );
                })}
                {allTags.length > 0 && (
                  <span
                    aria-hidden
                    className="shrink-0 mx-1 size-1 rounded-full bg-(--on-bg-low)/50"
                  />
                )}
                {allTags.map((t) => {
                  const count = liveTagCount(t.label);
                  return (
                    <Pill
                      key={t.label}
                      label={t.label}
                      count={count}
                      active={activeTag === t.label}
                      disabled={count === 0 && activeTag !== t.label}
                      onClick={() =>
                        setActiveTag(activeTag === t.label ? null : t.label)
                      }
                    />
                  );
                })}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  aria-label="Сбросить фильтры"
                  className="shrink-0 inline-flex items-center justify-center size-7 rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                  title="Сбросить"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              className={cn(
                "md:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-full",
                "text-body-4 font-medium transition-colors shrink-0",
                mobileOpen
                  ? "bg-(--primary) text-(--on-primary)"
                  : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
              )}
            >
              <FunnelSimpleIcon className="size-4" />
              {activeFilterCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold tabular-nums",
                    mobileOpen
                      ? "bg-(--on-primary)/20 text-(--on-primary)"
                      : "bg-(--primary) text-(--on-primary)",
                  )}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          {mobileOpen && (
            <div
              className={cn(
                "md:hidden mt-2 rounded-3xl border border-(--outline)",
                "bg-(--bg)/92 backdrop-blur-glass p-3 space-y-3",
              )}
            >
              <ChipRow
                label="Категория"
                chips={categoryChips.map((c) => {
                  const code = c.id === "__all__" ? null : c.id;
                  return {
                    key: c.id,
                    label: c.label,
                    active: c.active,
                    count: liveCategoryCount(code),
                    onClick: () => setActiveCategory(c.active ? null : code),
                  };
                })}
              />
              {allTags.length > 0 && (
                <ChipRow
                  label="Метки"
                  chips={allTags.map((t) => ({
                    key: t.label,
                    label: t.label,
                    active: activeTag === t.label,
                    count: liveTagCount(t.label),
                    onClick: () =>
                      setActiveTag(activeTag === t.label ? null : t.label),
                  }))}
                />
              )}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-1 border-t border-(--outline)">
                  <span className="text-body-5 text-(--on-bg-low) tabular-nums">
                    {filtered.length} из {projects.length}
                  </span>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-1 text-body-5 text-(--on-bg-medium) hover:text-(--on-bg-high) transition-colors"
                  >
                    <XIcon className="size-3" />
                    Сбросить
                  </button>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>

      <section className="pb-24 md:pb-32">
        <Container>
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-body-2 text-(--on-bg-medium) mb-3">
                {projects.length === 0
                  ? "Здесь пока нет проектов"
                  : "Ничего не найдено"}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-body-4 text-(--on-bg-low) underline underline-offset-4 hover:text-(--on-bg-high) transition-colors"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((project, idx) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  index={idx}
                  categoryMap={categoryMap}
                  tags={tagListForSlug(project.slug).map((label, i) => ({
                    id: `${project.slug}-tag-${i}`,
                    label,
                  }))}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function Pill({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 h-7",
        "text-[12px] font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-(--primary) text-(--on-primary)"
          : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
        disabled && "opacity-30 cursor-not-allowed",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums text-[10px] leading-none",
          active ? "text-(--on-primary)/60" : "text-(--on-bg-low)",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ChipRow({
  label,
  chips,
}: {
  label: string;
  chips: {
    key: string;
    label: string;
    active: boolean;
    count: number;
    onClick: () => void;
  }[];
}) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-[0.16em] text-(--on-bg-low) block px-1">
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {chips.map((c) => (
          <Pill
            key={c.key}
            label={c.label}
            count={c.count}
            active={c.active}
            disabled={c.count === 0 && !c.active}
            onClick={c.onClick}
          />
        ))}
      </div>
    </div>
  );
}
