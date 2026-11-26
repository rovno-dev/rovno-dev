"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListToolbar } from "@/components/layout/filter/list-toolbar";
import { FilterSection, DrawerChip } from "@/components/layout/filter/filter-chip";
import { FilterDrawer } from "@/components/layout/filter/filter-drawer";
import {
  ActiveFilters,
  type ActiveFilter,
} from "@/components/layout/filter/active-filters";
import {
  CalendarBlank,
  MapPin,
  ArrowUpRight,
  Ticket,
} from "@phosphor-icons/react";
import type { EventListItem } from "@/utils/api/events";

/**
 * Full events page body. A Client Component because the header, section
 * headings, empty state, and every card label need the `useLanguage` hook.
 * The RSC shell (`page.tsx`) fetches events once and hands them here.
 *
 * The header is deliberately slim - a single heading, same rhythm as the
 * blog strip - so the list gets the vertical budget.
 */

function formatDate(iso: string | null | undefined, lang: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function formatMonth(iso: string | null | undefined, lang: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d
      .toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "short" })
      .replace(".", "")
      .toUpperCase();
  } catch {
    return "";
  }
}

function formatDay(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return String(new Date(iso).getDate()).padStart(2, "0");
  } catch {
    return "-";
  }
}

function isPast(iso: string | null | undefined): boolean {
  if (!iso) return false;
  try {
    return new Date(iso).getTime() < Date.now();
  } catch {
    return false;
  }
}

/** Russian labels for the DB `tag_kind` enum used by event tags. */
const TAG_KIND_LABELS: Record<string, string> = {
  category: "Категория",
  brand: "Бренд",
  tag: "Тег",
};
const TAG_KIND_ORDER = ["category", "brand", "tag"];

type EventStatusFilter = "upcoming" | "past";
type EventTagRef = { kind: string; name: string };

function matchesEvent(
  event: EventListItem,
  status: EventStatusFilter | null,
  tag: EventTagRef | null,
  city: string | null,
  featuredOnly: boolean,
  query: string,
): boolean {
  if (status === "upcoming" && isPast(event.start_at)) return false;
  if (status === "past" && !isPast(event.start_at)) return false;
  if (featuredOnly && !event.is_featured) return false;
  if (city && event.city !== city) return false;
  if (
    tag &&
    !(event.tags || []).some(
      (t) => (t.kind || "tag") === tag.kind && t.name === tag.name,
    )
  ) {
    return false;
  }
  if (query) {
    const haystack = [
      event.title,
      event.short_description,
      event.location_name,
      event.city,
      ...(event.tags || []).map((t) => t.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function EventCard({
  event,
  index,
  lang,
  t,
}: {
  event: EventListItem;
  index: number;
  lang: string;
  t: (key: string) => string;
}) {
  const past = isPast(event.start_at);
  const dateLabel = formatDate(event.start_at, lang) || t("events.date_tbd");
  const monthLabel = formatMonth(event.start_at, lang);
  const dayLabel = formatDay(event.start_at);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card className="relative h-full overflow-hidden rounded-3xl border border-(--outline) bg-(--card) ring-0 transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-xl hover:shadow-(--primary)/5 p-0! gap-0!">
        <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
          {event.cover_video_src ? (
            event.cover_video_src.endsWith(".webm") || event.cover_video_src.endsWith(".mp4") ? (
              <video
                src={event.cover_video_src}
                poster={event.cover_image_src}
                preload="metadata"
                muted
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 `}
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
            ) : (
              <iframe
                src={`${event.cover_video_src}?autoplay=0&muted=1`}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none border-0"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              />
            )
          ) : event.cover_image_src ? (
            <Image
              src={event.cover_image_src}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${past ? "grayscale" : ""}`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">{"{ event }"}</span>
                <h3 className="text-xl font-heading  text-white leading-tight">{event.title}</h3>
                <span className="font-mono text-xs text-gray-500">{event.start_at ? new Date(event.start_at).toLocaleDateString("ru-RU") : "Дата уточняется"}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Date tile top-left */}
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/50 backdrop-blur-sm px-3 py-2 text-white">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
              {monthLabel}
            </span>
            <span className="text-display-3 font-heading  leading-none tabular-nums">
              {dayLabel}
            </span>
          </div>

          {/* Status pill top-right */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {past && (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px]  uppercase tracking-wider text-white/70">
                {t("events.past_badge")}
              </span>
            )}
            {event.is_featured && !past && (
              <span className="inline-flex items-center rounded-full border border-(--primary)/40 bg-(--primary)/20 backdrop-blur-sm px-2 py-0.5 text-[10px]  uppercase tracking-wider text-white">
                {t("events.featured_badge")}
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="text-body-2 md:text-heading-3 text-white leading-tight mb-1">
              {event.title}
            </h3>
            {event.short_description && (
              <p className="text-body-5 text-white/75 line-clamp-2">
                {event.short_description}
              </p>
            )}
          </div>
          <div className="absolute bottom-5 right-5 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-(--outline)">
          <div className="inline-flex items-center gap-1.5 text-body-5 text-(--on-bg-medium)">
            <CalendarBlank className="size-3.5 text-(--on-bg-low)" />
            {dateLabel}
          </div>
          {event.location_name && (
            <div className="inline-flex items-center gap-1.5 text-body-5 text-(--on-bg-medium)">
              <MapPin className="size-3.5 text-(--on-bg-low)" />
              {event.location_name}
            </div>
          )}
          {event.price && (
            <div className="inline-flex items-center gap-1.5 text-body-5 text-(--primary) ml-auto">
              <Ticket className="size-3.5" />
              {event.price}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function EventsList({ events }: { events: EventListItem[] }) {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter | null>(null);
  const [activeTag, setActiveTag] = useState<EventTagRef | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // --- Derived filter data ------------------------------
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of events) {
      if (!e.city) continue;
      counts.set(e.city, (counts.get(e.city) || 0) + 1);
    }
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [events]);

  const tagsByKind = useMemo(() => {
    const grouped = new Map<string, Map<string, number>>();
    for (const e of events) {
      for (const tag of e.tags || []) {
        const kind = tag.kind || "tag";
        const m = grouped.get(kind) || new Map<string, number>();
        m.set(tag.name, (m.get(tag.name) || 0) + 1);
        grouped.set(kind, m);
      }
    }
    const ordered: {
      kind: string;
      label: string;
      entries: [string, number][];
    }[] = [];
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
  }, [events]);

  const featuredCount = useMemo(
    () => events.filter((e) => e.is_featured).length,
    [events],
  );

  // --- Filtering ----------------------------------------
  const query = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      events.filter((e) =>
        matchesEvent(e, statusFilter, activeTag, activeCity, featuredOnly, query),
      ),
    [events, statusFilter, activeTag, activeCity, featuredOnly, query],
  );

  const upcoming = filtered.filter((e) => !isPast(e.start_at));
  const past = filtered.filter((e) => isPast(e.start_at));

  // Live counts for the drawer: swap one dimension for the candidate
  // while keeping every other active filter in place.
  const countWith = (overrides: {
    status?: EventStatusFilter | null;
    tag?: EventTagRef | null;
    city?: string | null;
    featured?: boolean;
  }) => {
    const status =
      overrides.status === undefined ? statusFilter : overrides.status;
    const tag = overrides.tag === undefined ? activeTag : overrides.tag;
    const city = overrides.city === undefined ? activeCity : overrides.city;
    const featured =
      overrides.featured === undefined ? featuredOnly : overrides.featured;
    return events.filter((e) =>
      matchesEvent(e, status, tag, city, featured, query),
    ).length;
  };

  const activeFilterCount =
    (statusFilter ? 1 : 0) +
    (activeCity ? 1 : 0) +
    (activeTag ? 1 : 0) +
    (featuredOnly ? 1 : 0);
  const hasActiveFilters = !!query || activeFilterCount > 0;

  const resetAll = () => {
    setSearch("");
    setStatusFilter(null);
    setActiveTag(null);
    setActiveCity(null);
    setFeaturedOnly(false);
  };

  const activeFilters: ActiveFilter[] = [
    statusFilter
      ? {
          id: "status",
          label:
            statusFilter === "upcoming"
              ? t("events.upcoming")
              : t("events.past"),
          onRemove: () => setStatusFilter(null),
        }
      : null,
    activeCity
      ? {
          id: "city",
          label: activeCity,
          onRemove: () => setActiveCity(null),
        }
      : null,
    featuredOnly
      ? {
          id: "featured",
          label: t("events.featured_badge"),
          onRemove: () => setFeaturedOnly(false),
        }
      : null,
    activeTag
      ? {
          id: "tag",
          label: `${
            TAG_KIND_LABELS[activeTag.kind] ?? activeTag.kind
          }: ${activeTag.name}`,
          onRemove: () => setActiveTag(null),
        }
      : null,
  ].filter((f): f is ActiveFilter => f !== null);

  return (
    <>
      <div className="min-h-screen bg-(--bg) mt-header">
        <section className="pt-6 md:pt-8 pb-6 border-b border-(--outline)">
          <Container>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <h1 className="text-heading-2 md:text-heading-1 text-(--on-bg-high) tracking-tight">
                  {t("events.title")}
                </h1>
                <div className="sm:min-w-0 sm:max-w-[520px] sm:flex-1">
                  <ListToolbar
                    value={search}
                    onChange={setSearch}
                    placeholder={t("events.search_placeholder")}
                    onFilters={() => setDrawerOpen(true)}
                    filterLabel={t("events.filters")}
                    activeFilterCount={activeFilterCount}
                    resultCount={filtered.length}
                    total={events.length}
                  />
                </div>
              </div>
              <ActiveFilters
                filters={activeFilters}
                onClearAll={resetAll}
              />
            </div>
          </Container>
        </section>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="py-10 md:py-14">
            <Container>
              <div className="flex items-baseline justify-between gap-4 mb-8">
                <h2 className="text-display-5 md:text-display-3 text-(--on-bg-high) tracking-tight">
                  {t("events.upcoming")}
                </h2>
                <span className="text-body-5 text-(--on-bg-low) tabular-nums">
                  {upcoming.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} lang={lang} t={t} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section className="pb-14 md:pb-20">
            <Container>
              <div className="flex items-baseline justify-between gap-4 mb-8">
                <h2 className="text-display-5 md:text-display-3 text-(--on-bg-high) tracking-tight">
                  {t("events.past")}
                </h2>
                <span className="text-body-5 text-(--on-bg-low) tabular-nums">
                  {past.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-80">
                {past.map((e, i) => (
                  <EventCard key={e.id} event={e} index={i} lang={lang} t={t} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Nothing matched the active search/filters */}
        {events.length > 0 && filtered.length === 0 && (
          <section className="py-20">
            <Container>
              <div className="py-16 text-center">
                <p className="text-2xl font-heading text-(--on-bg-medium) mb-4">
                  {t("events.not_found")}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-sm text-(--primary) underline underline-offset-4 hover:opacity-80 transition-opacity"
                  >
                    {t("events.reset_filters")}
                  </button>
                )}
              </div>
            </Container>
          </section>
        )}

        {/* Empty */}
        {events.length === 0 && (
          <section className="py-20">
            <Container>
              <Card className="rounded-3xl border-(--outline) p-12 text-center max-w-xl mx-auto">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
                  <CalendarBlank className="size-6" />
                </div>
                <h2 className="text-heading-3 text-(--on-bg-high) mb-2">
                  {t("events.empty_title")}
                </h2>
                <p className="text-body-3 text-(--on-bg-medium) mb-6">
                  {t("events.empty_body")}
                </p>
                <Button asChild>
                  <Link href="/">{t("events.back_home")}</Link>
                </Button>
              </Card>
            </Container>
          </section>
        )}
      </div>

      {/* Filters drawer */}
      <FilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={t("events.filters")}
        description={`${filtered.length} / ${events.length}`}
        onReset={resetAll}
        hasActiveFilters={hasActiveFilters}
        resultCount={filtered.length}
      >
        <FilterSection title={t("events.filter_when")}>
          <DrawerChip
            label={t("events.filter_all")}
            count={countWith({ status: null })}
            active={statusFilter === null}
            onClick={() => setStatusFilter(null)}
          />
          <DrawerChip
            label={t("events.upcoming")}
            count={countWith({ status: "upcoming" })}
            active={statusFilter === "upcoming"}
            disabled={
              countWith({ status: "upcoming" }) === 0 &&
              statusFilter !== "upcoming"
            }
            onClick={() =>
              setStatusFilter(statusFilter === "upcoming" ? null : "upcoming")
            }
          />
          <DrawerChip
            label={t("events.past")}
            count={countWith({ status: "past" })}
            active={statusFilter === "past"}
            disabled={
              countWith({ status: "past" }) === 0 && statusFilter !== "past"
            }
            onClick={() =>
              setStatusFilter(statusFilter === "past" ? null : "past")
            }
          />
        </FilterSection>

        {cities.length > 1 && (
          <FilterSection title={t("events.filter_city")}>
            <DrawerChip
              label={t("events.filter_all")}
              count={countWith({ city: null })}
              active={activeCity === null}
              onClick={() => setActiveCity(null)}
            />
            {cities.map(([city, count]) => {
              const active = activeCity === city;
              const liveCount = countWith({ city });
              return (
                <DrawerChip
                  key={city}
                  label={city}
                  count={liveCount}
                  active={active}
                  disabled={liveCount === 0 && !active}
                  onClick={() => setActiveCity(active ? null : city)}
                />
              );
            })}
          </FilterSection>
        )}

        {featuredCount > 0 && (
          <FilterSection title={t("events.filter_featured")}>
            <DrawerChip
              label={t("events.filter_featured_only")}
              count={countWith({ featured: true })}
              active={featuredOnly}
              onClick={() => setFeaturedOnly((v) => !v)}
            />
          </FilterSection>
        )}

        {tagsByKind.map((group) => (
          <FilterSection key={group.kind} title={group.label}>
            {group.entries.map(([name]) => {
              const active =
                activeTag?.kind === group.kind && activeTag?.name === name;
              const liveCount = countWith({
                tag: { kind: group.kind, name },
              });
              return (
                <DrawerChip
                  key={name}
                  label={name}
                  count={liveCount}
                  active={active}
                  disabled={liveCount === 0 && !active}
                  onClick={() =>
                    setActiveTag(active ? null : { kind: group.kind, name })
                  }
                />
              );
            })}
          </FilterSection>
        ))}
      </FilterDrawer>
    </>
  );
}
