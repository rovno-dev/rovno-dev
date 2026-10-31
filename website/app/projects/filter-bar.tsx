"use client";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import ProjectCard from "@/components/layout/projects/project-card";
import type { Project } from "@/utils/api/projects";
import type { Taxonomy } from "@/utils/api/taxonomies";
import {
  MagnifyingGlassIcon,
  XIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function tagsOf(p: Project): string[] {
  return (p.tags || [])
    .map((t) => (t.title || "").trim())
    .filter((v): v is string => v.length > 0);
}

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
      <div className="sticky top-[68px] md:top-[92px] z-40 pt-6 pb-8 backdrop-blur-xl bg-(--bg)/80 border-b border-(--outline)">
        <Container>
          <div className="flex items-center gap-2 h-14 rounded-2xl border border-(--outline) bg-(--card) shadow-sm pl-4 pr-2">

            {/* Search Input */}
            <div className="relative flex-1 md:flex-initial md:w-[240px] h-full flex items-center min-w-0">
              <MagnifyingGlassIcon className="absolute left-0 size-4 text-(--on-bg-low) pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию..."
                className={cn(
                  "w-full h-full pl-7 pr-7 bg-transparent outline-none",
                  "text-sm font-medium placeholder:text-(--on-bg-low)",
                )}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Очистить"
                  className="absolute right-0 inline-flex items-center justify-center size-6 rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                >
                  <XIcon className="size-3" />
                </button>
              )}
            </div>

            {/* Desktop Category Chips */}
            <div className="hidden md:flex flex-1 min-w-0 items-center gap-2 pl-4 ml-2 border-l border-(--outline) h-8">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar h-full">
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
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              className={cn(
                "md:hidden inline-flex shrink-0 items-center justify-center gap-2 h-10 px-4 rounded-xl",
                "text-sm font-medium transition-colors",
                mobileOpen
                  ? "bg-(--primary) text-(--on-primary)"
                  : "bg-(--bg) text-(--on-bg-medium) hover:bg-(--state-hover) hover:text-(--on-bg-high)",
              )}
            >
              <FunnelSimpleIcon className="size-4" />
              {activeFilterCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full text-[10px] font-semibold tabular-nums",
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

          {/* Mobile Filters Dropdown */}
          {mobileOpen && (
            <div className="md:hidden mt-3 rounded-2xl border border-(--outline) bg-(--card) p-4 space-y-4 shadow-lg">
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
                <div className="flex items-center justify-between pt-3 border-t border-(--outline)">
                  <span className="text-xs text-(--on-bg-low) tabular-nums">
                    {filtered.length} из {projects.length}
                  </span>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-1 text-xs text-(--on-bg-medium) hover:text-(--on-bg-high) transition-colors"
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

      <section className="pt-8 pb-24 md:pb-32">
        <Container>
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-2xl font-heading font-medium text-(--on-bg-medium) mb-4">
                {projects.length === 0
                  ? "Здесь пока нет проектов"
                  : "Ничего не найдено"}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-sm font-medium text-(--primary) underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
              {filtered.map((project, idx) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  index={idx}
                  variant="featured"
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
        "shrink-0 inline-flex items-center gap-2 rounded-xl px-3 h-8",
        "text-xs font-semibold whitespace-nowrap transition-colors",
        active
          ? "bg-(--primary) text-(--on-primary) shadow-sm"
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
