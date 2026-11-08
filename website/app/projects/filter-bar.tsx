"use client";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import ProjectCard from "@/components/layout/projects/project-card";
import type { Project } from "@/utils/api/projects";
import type { Taxonomy } from "@/utils/api/taxonomies";
import {
  MagnifyingGlassIcon,
  XIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

/** Russian labels for `project_tag_kind` - the DB enum values. */
const TAG_KIND_LABELS: Record<string, string> = {
  from_chief: "От авторов",
  license: "Лицензия",
  github: "Open source",
  custom: "Дополнительно",
};

/** Order the kind groups appear in the drawer. Unknown kinds fall to the end. */
const TAG_KIND_ORDER = ["from_chief", "github", "license", "custom"];

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
  const [activePeriod, setActivePeriod] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<{ kind: string; label: string } | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Derived filter data, straight from the projects' own columns ──
  // (Period and is_featured are plain columns; tags come from
  // project_tags with its `kind` discriminator.)

  /** Distinct `projects.period` values, newest first. Years sort
   *  naturally as strings, so reverse-alpha gives the newest first. */
  const periods = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) if (p.period) set.add(p.period);
    return Array.from(set).sort().reverse();
  }, [projects]);

  /** Tags grouped by `project_tags.kind`, each group with usage counts.
   *  Groups with zero tags are omitted so the drawer only shows what
   *  the DB actually contains. */
  const tagsByKind = useMemo(() => {
    const grouped = new Map<string, Map<string, number>>();
    for (const p of projects) {
      for (const t of p.tags || []) {
        if (!t.kind || !t.title) continue;
        const m = grouped.get(t.kind) || new Map<string, number>();
        m.set(t.title, (m.get(t.title) || 0) + 1);
        grouped.set(t.kind, m);
      }
    }
    const ordered: { kind: string; label: string; entries: [string, number][] }[] = [];
    for (const kind of TAG_KIND_ORDER) {
      const m = grouped.get(kind);
      if (!m || m.size === 0) continue;
      ordered.push({
        kind,
        label: TAG_KIND_LABELS[kind] ?? kind,
        entries: Array.from(m.entries()).sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
        ),
      });
    }
    // Any kind the DB might grow later that isn't in the order list.
    for (const [kind, m] of grouped) {
      if (TAG_KIND_ORDER.includes(kind)) continue;
      ordered.push({
        kind,
        label: TAG_KIND_LABELS[kind] ?? kind,
        entries: Array.from(m.entries()).sort(
          (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
        ),
      });
    }
    return ordered;
  }, [projects]);

  const featuredCount = useMemo(
    () => projects.filter((p) => p.isFeatured).length,
    [projects],
  );

  // ── Filtering ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (activePeriod && p.period !== activePeriod) return false;
      if (featuredOnly && !p.isFeatured) return false;
      if (activeTag) {
        const has = (p.tags || []).some(
          (t) => t.kind === activeTag.kind && t.title === activeTag.label,
        );
        if (!has) return false;
      }
      if (q) {
        const haystack = [p.title, p.shortDescription, p.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    projects,
    activeCategory,
    activePeriod,
    activeTag,
    featuredOnly,
    search,
  ]);

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (activePeriod ? 1 : 0) +
    (activeTag ? 1 : 0) +
    (featuredOnly ? 1 : 0);
  const hasActiveFilters = !!search.trim() || activeFilterCount > 0;

  const resetAll = () => {
    setSearch("");
    setActiveCategory(null);
    setActivePeriod(null);
    setActiveTag(null);
    setFeaturedOnly(false);
  };

  // Per-group "how many match if I pick this" counts, so a chip can say
  // "12" meaning "picking me leaves 12 visible in the whole set".
  const liveCategoryCount = (code: string | null) => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (code !== null && p.category !== code) return false;
      if (activePeriod && p.period !== activePeriod) return false;
      if (featuredOnly && !p.isFeatured) return false;
      if (activeTag) {
        const has = (p.tags || []).some(
          (t) => t.kind === activeTag.kind && t.title === activeTag.label,
        );
        if (!has) return false;
      }
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

  const livePeriodCount = (period: string | null) => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (period !== null && p.period !== period) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (featuredOnly && !p.isFeatured) return false;
      if (activeTag) {
        const has = (p.tags || []).some(
          (t) => t.kind === activeTag.kind && t.title === activeTag.label,
        );
        if (!has) return false;
      }
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

  const liveTagCount = (kind: string, label: string) => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const has = (p.tags || []).some(
        (t) => t.kind === kind && t.title === label,
      );
      if (!has) return false;
      if (activeCategory && p.category !== activeCategory) return false;
      if (activePeriod && p.period !== activePeriod) return false;
      if (featuredOnly && !p.isFeatured) return false;
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

  const activeCategoryLabel = activeCategory
    ? categoryChips.find((c) => c.id === activeCategory)?.label ?? activeCategory
    : null;

  // ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pb-10">
        <Container>
          <div className="flex flex-col gap-4">
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1 min-w-0 group">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--on-bg-low) pointer-events-none transition-colors group-focus-within:text-(--primary)" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию..."
                  inputMode="search"
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(
                    "w-full h-11 pl-10 pr-10 bg-transparent rounded-xl",
                    "border border-(--outline) text-body-3 text-(--on-bg-high)",
                    "placeholder:text-(--on-bg-low)",
                    "transition-all duration-200 outline-none",
                    "hover:border-(--on-bg-low)/40",
                    "focus:border-(--primary)",
                    "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary),transparent_90%)]",
                  )}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Очистить"
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-7 inline-flex items-center justify-center rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                )}
              </div>

              <Button
                onClick={() => setDrawerOpen(true)}
                variant={activeFilterCount > 0 ? "filled" : "outlined"}
                className="h-11! shrink-0 px-3 sm:px-4 gap-2"
              >
                <SlidersHorizontalIcon
                  className="size-4"
                  weight={activeFilterCount > 0 ? "bold" : "regular"}
                />
                <span className="hidden sm:inline">Фильтры</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-(--on-primary)/25 text-(--on-primary) text-[10px] font-bold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <div className="hidden lg:flex items-center shrink-0 pl-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--on-bg-low) tabular-nums">
                  {filtered.length}
                  <span className="mx-1.5 opacity-40">/</span>
                  {projects.length}
                </span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {activeCategory && (
                      <RemovableChip
                        label={activeCategoryLabel ?? activeCategory}
                        onRemove={() => setActiveCategory(null)}
                      />
                    )}
                    {activePeriod && (
                      <RemovableChip
                        label={activePeriod}
                        onRemove={() => setActivePeriod(null)}
                      />
                    )}
                    {featuredOnly && (
                      <RemovableChip
                        label="Избранные"
                        onRemove={() => setFeaturedOnly(false)}
                      />
                    )}
                    {activeTag && (
                      <RemovableChip
                        label={`${TAG_KIND_LABELS[activeTag.kind] ?? activeTag.kind}: ${activeTag.label}`}
                        onRemove={() => setActiveTag(null)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={resetAll}
                      className="ml-1 text-body-5 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors underline-offset-4 hover:underline"
                    >
                      Очистить всё
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </div>

      <section className="pb-24 md:pb-32">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((project, idx) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  index={idx}
                  variant="featured"
                  categoryMap={categoryMap}
                  tags={(project.tags || [])
                    .filter((t) => t.title)
                    .map((t, i) => ({
                      id: `${project.slug}-tag-${i}`,
                      label: t.title,
                    }))}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── Filters drawer ──────────────────────────────────────────
          Sections mirror the DB: `project_categories` (via category_id),
          `projects.period`, `projects.is_featured`, `project_tags`
          split by its `kind` enum. Only sections with actual content
          render, so the drawer scales down to a bare site automatically. */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col"
        >
          <SheetHeader className="px-6 py-5 border-b border-(--outline) shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <SheetTitle className="flex items-center gap-2.5 text-heading-2 tracking-tight">
                  <SlidersHorizontalIcon className="size-5 shrink-0" weight="bold" />
                  Фильтры
                </SheetTitle>
                <SheetDescription className="text-body-4 text-(--on-bg-low) mt-1 tabular-nums">
                  {filtered.length} из {projects.length} проектов
                </SheetDescription>
              </div>
              <SheetClose asChild>
                <Button
                  variant="text"
                  size="icon-small"
                  className="shrink-0 -mr-2"
                  aria-label="Закрыть"
                >
                  <XIcon className="size-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto scrollbar-admin">
            <div className="px-6 py-6 space-y-8">
              {/* Category — projects.category_id → project_categories */}
              {categoryChips.length > 1 && (
                <FilterSection title="Категория">
                  {categoryChips.map((c) => {
                    const code = c.id === "__all__" ? null : c.id;
                    const count = liveCategoryCount(code);
                    return (
                      <DrawerChip
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
                </FilterSection>
              )}

              {/* Period — projects.period */}
              {periods.length > 1 && (
                <FilterSection title="Период">
                  {periods.map((p) => {
                    const count = livePeriodCount(p);
                    const active = activePeriod === p;
                    return (
                      <DrawerChip
                        key={p}
                        label={p}
                        count={count}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() => setActivePeriod(active ? null : p)}
                      />
                    );
                  })}
                </FilterSection>
              )}

              {/* Featured — projects.is_featured */}
              {featuredCount > 0 && (
                <FilterSection title="Особенности">
                  <DrawerChip
                    label="Только избранные"
                    count={featuredCount}
                    active={featuredOnly}
                    onClick={() => setFeaturedOnly((v) => !v)}
                  />
                </FilterSection>
              )}

              {/* Tags — project_tags grouped by its `kind` enum */}
              {tagsByKind.map((group) => (
                <FilterSection key={group.kind} title={group.label}>
                  {group.entries.map(([label, count]) => {
                    const active =
                      activeTag?.kind === group.kind && activeTag?.label === label;
                    return (
                      <DrawerChip
                        key={label}
                        label={label}
                        count={count}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() =>
                          setActiveTag(active ? null : { kind: group.kind, label })
                        }
                      />
                    );
                  })}
                </FilterSection>
              ))}

              {categoryChips.length <= 1 &&
                periods.length <= 1 &&
                featuredCount === 0 &&
                tagsByKind.length === 0 && (
                  <p className="text-body-4 text-(--on-bg-low) text-center py-12">
                    Пока нет фильтров, которые можно применить.
                  </p>
                )}
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t border-(--outline) shrink-0 flex-row gap-2">
            <Button
              variant="outlined"
              onClick={resetAll}
              disabled={!hasActiveFilters}
              className="flex-1 h-11"
            >
              Сбросить
            </Button>
            <Button
              onClick={() => setDrawerOpen(false)}
              className="flex-1 h-11"
            >
              Показать {filtered.length}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h4 className="text-[11px] uppercase tracking-[0.18em] font-medium text-(--on-bg-low)">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 h-8 pl-3 pr-1 rounded-full border border-(--outline) text-body-5 font-medium text-(--on-bg-high)">
      <span className="truncate max-w-[240px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать фильтр ${label}`}
        className="size-6 inline-flex items-center justify-center rounded-full text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
      >
        <XIcon className="size-3" />
      </button>
    </span>
  );
}

function DrawerChip({
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
        "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-body-4 font-medium transition-all duration-200",
        active
          ? "bg-(--on-bg-high) text-(--bg) shadow-sm"
          : "bg-(--card) border border-(--outline) text-(--on-bg-medium) hover:border-(--on-bg-low)/40 hover:text-(--on-bg-high)",
        disabled &&
          "opacity-30 cursor-not-allowed hover:border-(--outline) hover:text-(--on-bg-medium)",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums text-[10px] leading-none",
          active ? "text-(--bg)/60" : "text-(--on-bg-low)",
        )}
      >
        {count}
      </span>
    </button>
  );
}
