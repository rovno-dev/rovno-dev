"use client";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { ListToolbar } from "@/components/layout/filter/list-toolbar";
import { FilterSection, DrawerChip } from "@/components/layout/filter/filter-chip";
import ProjectCard from "@/components/layout/projects/project-card";
import { ActiveFilters, type ActiveFilter } from "@/components/layout/filter/active-filters";
import { FilterDrawer } from "@/components/layout/filter/filter-drawer";
import type { Project } from "@/utils/api/projects";
import type { Taxonomy } from "@/utils/api/taxonomies";

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
  title,
  projects,
  categories,
  categoryMap,
}: {
  title: string;
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
      <div className="pt-6 pb-10 md:pt-8">
        <Container>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <h1 className="text-display-4 md:text-display-3">{title}</h1>
              <div className="sm:min-w-0 sm:max-w-[520px] sm:flex-1">
                <ListToolbar
                  value={search}
                  onChange={setSearch}
                  placeholder="Поиск по названию..."
                  onFilters={() => setDrawerOpen(true)}
                  activeFilterCount={activeFilterCount}
                  resultCount={filtered.length}
                  total={projects.length}
                />
              </div>
            </div>
            <ActiveFilters
              filters={[
                activeCategory
                  ? { id: "category", label: activeCategoryLabel ?? activeCategory, onRemove: () => setActiveCategory(null) }
                  : null,
                activePeriod
                  ? { id: "period", label: activePeriod, onRemove: () => setActivePeriod(null) }
                  : null,
                featuredOnly
                  ? { id: "featured", label: "Избранные", onRemove: () => setFeaturedOnly(false) }
                  : null,
                activeTag
                  ? { id: "tag", label: `${TAG_KIND_LABELS[activeTag.kind] ?? activeTag.kind}: ${activeTag.label}`, onRemove: () => setActiveTag(null) }
                  : null,
              ].filter((f): f is ActiveFilter => f !== null)}
              onClearAll={resetAll}
            />
          </div>
        </Container>
      </div>

      <section className="pb-24 md:pb-32">
        <Container>
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-2xl font-heading  text-(--on-bg-medium) mb-4">
                {projects.length === 0
                  ? "Здесь пока нет проектов"
                  : "Ничего не найдено"}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-sm  text-(--primary) underline underline-offset-4 hover:opacity-80 transition-opacity"
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
                  variant="clean"
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
      <FilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Фильтры"
        description={`${filtered.length} из ${projects.length} проектов`}
        onReset={resetAll}
        hasActiveFilters={hasActiveFilters}
        resultCount={filtered.length}
      >
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
      </FilterDrawer>
    </>
  );
}
