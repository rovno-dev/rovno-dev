"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import ProjectCard from "@/components/layout/projects/project-card";
import { Project } from "@/app/_data/projects";
import { PROJECT_TAGS } from "@/app/_data/project-tags";
import {
  fetchProjectCategories,
  type Taxonomy,
} from "@/utils/api/taxonomies";
import { fetchPublishedProjectsClient } from "@/utils/api/projects";
import {
  MagnifyingGlassIcon,
  XIcon,
  FunnelSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DbProjectRow {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  category?: {
    id: string;
    code: string;
    label?: string;
    labels?: Record<string, string>;
  } | null;
  period?: string | null;
  tags?: Array<{ id?: string; kind?: string; label?: string; name?: string }> | null;
}

function tagsForProject(
  slug: string,
  dbTags: DbProjectRow["tags"],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (s: string) => {
    const v = s.trim();
    if (!v || seen.has(v)) return;
    seen.add(v);
    out.push(v);
  };
  for (const t of PROJECT_TAGS[slug] ?? []) if (t.label) push(t.label);
  for (const t of dbTags ?? []) {
    const label = t.label || t.name;
    if (label) push(label);
  }
  return out;
}

export function FilterBar({
  projects,
  categories: initialCategories,
  categoryMap: initialCategoryMap,
}: {
  projects: Project[];
  categories: Taxonomy[];
  categoryMap: Record<string, string>;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Mobile-only: filters collapsed by default to keep the top of the
  // page quiet. Desktop ignores this state.
  const [mobileOpen, setMobileOpen] = useState(false);

  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [dbTagsBySlug, setDbTagsBySlug] = useState<Record<string, string[]>>({});
  const [loadingDb, setLoadingDb] = useState(true);

  const [categories, setCategories] = useState<Taxonomy[]>(initialCategories);
  const [categoryMap, setCategoryMap] =
    useState<Record<string, string>>(initialCategoryMap);

  useEffect(() => {
    let cancelled = false;
    fetchProjectCategories()
      .then((cats) => {
        if (cancelled || cats.length === 0) return;
        setCategories(cats);
        setCategoryMap(
          Object.fromEntries(
            cats.map((c) => [c.code, c.labels.en || c.label || c.code]),
          ),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const existing = new Set(projects.map((p) => p.slug));
    fetchPublishedProjectsClient()
      .then((rows) => {
        if (cancelled) return;
        const tagMap: Record<string, string[]> = {};
        const mapped: Project[] = (rows as DbProjectRow[])
          .filter((r) => !existing.has(r.slug))
          .map((r) => {
            const tags = tagsForProject(r.slug, r.tags);
            if (tags.length) tagMap[r.slug] = tags;
            return {
              id: r.id,
              slug: r.slug,
              title: r.title,
              description: "",
              shortDescription: r.short_description || "",
              cover: {
                imageSrc: r.cover_image_src,
                videoSrc: r.cover_video_src || undefined,
              },
              href: "",
              category: (r.category?.code || "corporative") as Project["category"],
              clientId: "",
              platform: "",
              period: r.period || "",
              techStack: [],
            };
          });
        setDbProjects(mapped);
        setDbTagsBySlug(tagMap);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDb(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projects]);

  const allProjects = useMemo(
    () => [...projects, ...dbProjects],
    [projects, dbProjects],
  );

  const tagsOf = useMemo(() => {
    const cache = new Map<string, string[]>();
    return (slug: string): string[] => {
      const hit = cache.get(slug);
      if (hit) return hit;
      const computed = dbTagsBySlug[slug] ?? tagsForProject(slug, null);
      cache.set(slug, computed);
      return computed;
    };
  }, [dbTagsBySlug]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of allProjects) {
      for (const t of tagsOf(p.slug)) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [allProjects, tagsOf]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProjects.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activeTag && !tagsOf(p.slug).includes(activeTag)) return false;
      if (q) {
        const haystack = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allProjects, activeCategory, activeTag, search, tagsOf]);

  const hasActiveFilters =
    !!search.trim() || activeCategory !== null || activeTag !== null;

  const activeFilterCount =
    (activeCategory ? 1 : 0) + (activeTag ? 1 : 0);

  const resetAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActiveTag(null);
  };

  const liveCategoryCount = (code: string | null) => {
    const q = search.trim().toLowerCase();
    return allProjects.filter((p) => {
      if (code !== null && p.category !== code) return false;
      if (activeTag && !tagsOf(p.slug).includes(activeTag)) return false;
      if (q) {
        const haystack = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    }).length;
  };
  const liveTagCount = (label: string) => {
    const q = search.trim().toLowerCase();
    return allProjects.filter((p) => {
      if (!tagsOf(p.slug).includes(label)) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (q) {
        const haystack = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
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
      {/* Sticky rail: search always visible, filters collapse below md. */}
      <div className="sticky top-[68px] md:top-[92px] z-40 mt-4 mb-5">
        <Container>
          <div className="rounded-xl border border-(--outline) bg-(--bg)/92 backdrop-blur-glass">
            {/* Row: search + filter toggle (mobile) on one line. */}
            <div className="flex items-center">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск…"
                  className={cn(
                    "w-full h-10 pl-10 pr-9 bg-transparent outline-none",
                    "text-body-4 placeholder:text-(--on-bg-low)",
                  )}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Очистить"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center size-6 rounded text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Filter toggle — mobile only. Shows active count when
                  filters are set so a collapsed state is still legible. */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                className={cn(
                  "md:hidden inline-flex items-center gap-1.5 h-10 px-3.5",
                  "border-l border-(--outline) text-body-4",
                  "text-(--on-bg-medium) hover:text-(--on-bg-high) transition-colors",
                )}
              >
                <FunnelSimpleIcon className="size-4" />
                <span>Фильтры</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-(--primary) text-(--on-primary) text-[10px] font-semibold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter rows — always shown on md+, collapsible on mobile.
                `md:!block` overrides the mobile visibility gate so the
                desktop layout is never at the mercy of the mobile state. */}
            <div
              className={cn(
                "border-t border-(--outline) md:!block",
                mobileOpen ? "block" : "hidden",
              )}
            >
              <FilterRow
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
                <FilterRow
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
                <div className="flex items-center justify-between gap-3 px-4 py-1.5 border-t border-(--outline)">
                  <span className="text-body-5 text-(--on-bg-low) tabular-nums">
                    {filtered.length} из {allProjects.length}
                  </span>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-1.5 text-body-5 text-(--on-bg-medium) hover:text-(--on-bg-high) transition-colors"
                  >
                    <XIcon className="size-3" />
                    Сбросить
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      <section className="pb-24 md:pb-32">
        <Container>
          {filtered.length === 0 && !loadingDb ? (
            <div className="py-20 text-center">
              <p className="text-body-2 text-(--on-bg-medium) mb-3">
                Ничего не найдено
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
                  tags={tagsOf(project.slug).map((label, i) => ({
                    id: `${project.slug}-tag-${i}`,
                    label,
                  }))}
                />
              ))}
              {loadingDb &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="relative aspect-[16/9] rounded-2xl border border-(--outline) bg-(--bg-disabled) overflow-hidden"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
                  </div>
                ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function FilterRow({
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
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-[10px] uppercase tracking-[0.16em] text-(--on-bg-low) shrink-0 w-[68px]">
        {label}
      </span>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {chips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={c.onClick}
            disabled={c.count === 0 && !c.active}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 h-6",
              "text-[12px] font-medium whitespace-nowrap transition-colors",
              c.active
                ? "bg-(--primary) text-(--on-primary) border-(--primary)"
                : "bg-transparent text-(--on-bg-medium) border-(--outline) hover:text-(--on-bg-high) hover:border-(--on-bg-low)/40",
              c.count === 0 &&
                !c.active &&
                "opacity-35 cursor-not-allowed",
            )}
          >
            <span>{c.label}</span>
            <span
              className={cn(
                "tabular-nums text-[10px] leading-none",
                c.active ? "text-(--on-primary)/70" : "text-(--on-bg-low)",
              )}
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
