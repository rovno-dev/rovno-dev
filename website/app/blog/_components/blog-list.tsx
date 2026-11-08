"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { ArticleCard } from "./article-card";
import type { ArticleListItem } from "@/utils/api/articles";
import { useLanguage } from "@/providers/language-provider";
import {
  MagnifyingGlassIcon,
  XIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

/** Russian labels for the DB `tag_kind` enum. */
const TAG_KIND_LABELS: Record<string, string> = {
  category: "Категория",
  brand: "Бренд",
  tag: "Тег",
};
/** Section order in the drawer. Unknown kinds fall to the end. */
const TAG_KIND_ORDER = ["category", "brand", "tag"];

export function BlogList({ articles }: { articles: ArticleListItem[] }) {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<{ kind: string; name: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // --- Derived filter data -------------------------------
  // Authors: only articles that actually have an author_id. Display
  // name prefers "name surname" over the username, matching how the
  // article byline is rendered.
  const authors = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const a of articles) {
      if (!a.author_id) continue;
      const label =
        [a.author?.name, a.author?.surname].filter(Boolean).join(" ").trim() ||
        a.author?.username ||
        "Без автора";
      const cur = map.get(a.author_id);
      if (cur) cur.count += 1;
      else map.set(a.author_id, { label, count: 1 });
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [articles]);

  // Years derived from the `date` field, newest first.
  const years = useMemo(() => {
    const map = new Map<number, number>();
    for (const a of articles) {
      const y = new Date(a.date).getFullYear();
      if (!Number.isFinite(y)) continue;
      map.set(y, (map.get(y) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [articles]);

  // Tags grouped by their `kind` (category / brand / tag). Groups with
  // zero tags are omitted so the drawer only shows what the DB has.
  const tagsByKind = useMemo(() => {
    const grouped = new Map<string, Map<string, number>>();
    for (const a of articles) {
      for (const tag of a.tags || []) {
        const kind = tag.kind || "tag";
        const m = grouped.get(kind) || new Map<string, number>();
        m.set(tag.name, (m.get(tag.name) || 0) + 1);
        grouped.set(kind, m);
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
    // Any kind the DB grows later that isn't in the order list.
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
  }, [articles]);

  // --- Predicates ---------------------------------------
  // Each dimension is isolated so live counts can swap one predicate
  // for a candidate without duplicating the whole filter chain.
  const matchesSearch = (a: ArticleListItem, q: string) => {
    if (!q) return true;
    return [a.title, a.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  };
  const matchesAuthor = (a: ArticleListItem, author: string | null) => {
    if (!author) return true;
    return a.author_id === author;
  };
  const matchesYear = (a: ArticleListItem, year: number | null) => {
    if (year === null) return true;
    return new Date(a.date).getFullYear() === year;
  };
  const matchesTag = (
    a: ArticleListItem,
    tag: { kind: string; name: string } | null,
  ) => {
    if (!tag) return true;
    return (a.tags || []).some(
      (t) => (t.kind || "tag") === tag.kind && t.name === tag.name,
    );
  };

  // --- Filtering ----------------------------------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        matchesAuthor(a, activeAuthor) &&
        matchesYear(a, activeYear) &&
        matchesTag(a, activeTag) &&
        matchesSearch(a, q),
    );
  }, [articles, activeAuthor, activeYear, activeTag, search]);

  // --- Live counts --------------------------------------
  // "How many would match if I picked this" — swaps that dimension for
  // the candidate, keeps all others, ignores the current selection.
  const liveAuthorCount = (id: string | null) => {
    const q = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        matchesAuthor(a, id) &&
        matchesYear(a, activeYear) &&
        matchesTag(a, activeTag) &&
        matchesSearch(a, q),
    ).length;
  };
  const liveYearCount = (year: number | null) => {
    const q = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        matchesYear(a, year) &&
        matchesAuthor(a, activeAuthor) &&
        matchesTag(a, activeTag) &&
        matchesSearch(a, q),
    ).length;
  };
  const liveTagCount = (kind: string, name: string) => {
    const q = search.trim().toLowerCase();
    return articles.filter(
      (a) =>
        matchesTag(a, { kind, name }) &&
        matchesAuthor(a, activeAuthor) &&
        matchesYear(a, activeYear) &&
        matchesSearch(a, q),
    ).length;
  };

  const activeFilterCount =
    (activeAuthor ? 1 : 0) +
    (activeYear !== null ? 1 : 0) +
    (activeTag ? 1 : 0);
  const hasActiveFilters = !!search.trim() || activeFilterCount > 0;

  const resetAll = () => {
    setSearch("");
    setActiveAuthor(null);
    setActiveYear(null);
    setActiveTag(null);
  };

  const activeAuthorLabel = activeAuthor
    ? authors.find((a) => a.id === activeAuthor)?.label ?? activeAuthor
    : null;

  return (
    <>
      {/* --- Search + filters button --------------------- */}
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
                  placeholder="Поиск по статьям..."
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
                  {articles.length}
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
                    {activeAuthor && activeAuthorLabel && (
                      <RemovableChip
                        label={activeAuthorLabel}
                        onRemove={() => setActiveAuthor(null)}
                      />
                    )}
                    {activeYear !== null && (
                      <RemovableChip
                        label={String(activeYear)}
                        onRemove={() => setActiveYear(null)}
                      />
                    )}
                    {activeTag && (
                      <RemovableChip
                        label={`${TAG_KIND_LABELS[activeTag.kind] ?? activeTag.kind}: ${activeTag.name}`}
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

      {/* --- Article grid ---------------------------------- */}
      <section className="pb-24 md:pb-32">
        <Container>
          {filtered.length === 0 ? (
            <div className="py-32 text-center">
              <p className="text-2xl font-heading font-medium text-(--on-bg-medium) mb-4">
                {articles.length === 0
                  ? t("blog.empty")
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((article, idx) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={idx}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* --- Filters drawer -------------------------------- */}
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
                  {filtered.length} из {articles.length} статей
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
              {authors.length > 0 && (
                <FilterSection title="Автор">
                  <DrawerChip
                    label="Все"
                    count={liveAuthorCount(null)}
                    active={activeAuthor === null}
                    onClick={() => setActiveAuthor(null)}
                  />
                  {authors.map((a) => {
                    const count = liveAuthorCount(a.id);
                    const active = activeAuthor === a.id;
                    return (
                      <DrawerChip
                        key={a.id}
                        label={a.label}
                        count={count}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() => setActiveAuthor(active ? null : a.id)}
                      />
                    );
                  })}
                </FilterSection>
              )}

              {years.length > 1 && (
                <FilterSection title="Год">
                  <DrawerChip
                    label="Все"
                    count={liveYearCount(null)}
                    active={activeYear === null}
                    onClick={() => setActiveYear(null)}
                  />
                  {years.map(([year]) => {
                    const count = liveYearCount(year);
                    const active = activeYear === year;
                    return (
                      <DrawerChip
                        key={year}
                        label={String(year)}
                        count={count}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() => setActiveYear(active ? null : year)}
                      />
                    );
                  })}
                </FilterSection>
              )}

              {tagsByKind.map((group) => (
                <FilterSection key={group.kind} title={group.label}>
                  {group.entries.map(([name, count]) => {
                    const active =
                      activeTag?.kind === group.kind && activeTag?.name === name;
                    return (
                      <DrawerChip
                        key={name}
                        label={name}
                        count={liveTagCount(group.kind, name)}
                        active={active}
                        disabled={count === 0 && !active}
                        onClick={() =>
                          setActiveTag(active ? null : { kind: group.kind, name })
                        }
                      />
                    );
                  })}
                </FilterSection>
              ))}

              {authors.length === 0 &&
                years.length <= 1 &&
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

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
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
