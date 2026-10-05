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
        const h = [p.title, p.shortDescription, p.description]
          .filter(Boolean).join(" ").toLowerCase();
        if (!h.includes(q)) return false;
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
        const h = [p.title, p.shortDescription, p.description]
          .filter(Boolean).join(" ").toLowerCase();
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
      {/* Floating pill — same visual language as the header:
          rounded-full, backdrop blur, hairline border, one row. */}
      <div className="sticky top-[68px] md:top-[92px] z-40 mt-4 mb-5">
        <Container>
          <div
            className={cn(
              "flex items-center gap-1 h-12 md:h-[56px] rounded-full",
              "border border-(--outline) bg-(--bg)/80 backdrop-blur-glass",
              "shadow-[0_1px_2px_rgba(0,0,0,0.04)] pl-4 pr-1.5",
            )}
          >
            {/* Search — fixed width on desktop, flexible on mobile. */}
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

            {/* Desktop: chips inline, all in one scrollable strip. */}
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
                      onClick={() =>
                        setActiveCategory(c.active ? null : code)
                      }
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
                  className={cn(
                    "shrink-0 inline-flex items-center justify-center size-7 rounded-full",
                    "text-(--on-bg-low) hover:text-(--on-bg-high)",
                    "hover:bg-(--state-hover) transition-colors",
                  )}
                  title="Сбросить"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>

            {/* Mobile: filter toggle. */}
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

          {/* Mobile chips panel — a small card below the pill. Hidden on
              md+, where the chips already live inside the pill. */}
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
                    onClick: () =>
                      setActiveCategory(c.active ? null : code),
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
                    {filtered.length} из {allProjects.length}
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
