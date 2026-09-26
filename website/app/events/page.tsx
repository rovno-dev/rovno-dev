import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarBlank,
  MapPin,
  ArrowUpRight,
  Ticket,
} from "@phosphor-icons/react/dist/ssr";
import { fetchPublishedEventsServer, type EventListItem } from "@/utils/api/events";

export const revalidate = 60;

export const metadata = {
  title: "События · Rovno.dev",
  description:
    "Мероприятия агентства Rovno.dev — воркшопы, митапы, конференции для IT-сообщества.",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Дата уточняется";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatMonth(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d
      .toLocaleDateString("ru-RU", { month: "short" })
      .replace(".", "")
      .toUpperCase();
  } catch {
    return "";
  }
}

function formatDay(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return String(new Date(iso).getDate()).padStart(2, "0");
  } catch {
    return "—";
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

function EventCard({ event, index }: { event: EventListItem; index: number }) {
  const past = isPast(event.start_at);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card className="relative h-full overflow-hidden rounded-3xl border border-(--outline) bg-(--card) ring-0 transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-xl hover:shadow-(--primary)/5">
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {event.cover_image_src ? (
            <Image
              src={event.cover_image_src}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className={`object-cover transition-transform duration-700 group-hover:scale-105 ${past ? "grayscale" : ""}`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Date tile top-left */}
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/50 backdrop-blur-sm px-3 py-2 text-white">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/70">
              {formatMonth(event.start_at)}
            </span>
            <span className="text-display-3 font-heading font-semibold leading-none tabular-nums">
              {formatDay(event.start_at)}
            </span>
          </div>

          {/* Status pill top-right */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {past && (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70">
                Прошло
              </span>
            )}
            {event.is_featured && !past && (
              <span className="inline-flex items-center rounded-full border border-(--primary)/40 bg-(--primary)/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
                Featured
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
            {formatDate(event.start_at)}
          </div>
          {event.location_name && (
            <div className="inline-flex items-center gap-1.5 text-body-5 text-(--on-bg-medium)">
              <MapPin className="size-3.5 text-(--on-bg-low)" />
              {event.location_name}
            </div>
          )}
          {event.price && (
            <div className="inline-flex items-center gap-1.5 text-body-5 text-(--primary) font-medium ml-auto">
              <Ticket className="size-3.5" />
              {event.price}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default async function EventsPage() {
  const events = await fetchPublishedEventsServer();
  const upcoming = events.filter((e) => !isPast(e.start_at));
  const past = events.filter((e) => isPast(e.start_at));

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero */}
      <section className="relative py-16 md:py-24 border-b border-(--outline) overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 60% 70% at 25% 0%, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 70% at 25% 0%, black 40%, transparent 90%)",
          }}
        />
        <Container className="relative">
          <div className="max-w-[820px] animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.32em] text-(--on-bg-low) mb-5">
              События
            </p>
            <h1 className="text-display-2 md:text-display-0 text-(--on-bg-high) mb-6 leading-[1.02] tracking-[-0.03em]">
              Мы делаем <span className="text-(--primary)">ивенты</span>.
            </h1>
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[640px]">
              Воркшопы, митапы и конференции для IT-сообщества. Регистрация
              открыта, вход обычно бесплатный.
            </p>
          </div>
        </Container>
      </section>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="py-14 md:py-20">
          <Container>
            <div className="flex items-baseline justify-between gap-4 mb-8">
              <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) tracking-tight">
                Скоро
              </h2>
              <span className="text-body-5 text-(--on-bg-low) tabular-nums">
                {upcoming.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcoming.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
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
              <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) tracking-tight">
                Прошли
              </h2>
              <span className="text-body-5 text-(--on-bg-low) tabular-nums">
                {past.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-80">
              {past.map((e, i) => (
                <EventCard key={e.id} event={e} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {events.length === 0 && (
        <section className="py-20">
          <Container>
            <Card className="rounded-3xl border-(--outline) p-12 text-center max-w-xl mx-auto">
              <p className="text-body-2 text-(--on-bg-medium) mb-4">
                События появятся здесь, как только будут опубликованы.
              </p>
              <Button asChild>
                <Link href="/">На главную</Link>
              </Button>
            </Card>
          </Container>
        </section>
      )}
    </main>
  );
}
