import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  ArrowLeft,
  CalendarBlank,
  MapPin,
  Ticket,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchEventServer, type EventDetail } from "@/utils/api/events";
import {
  findEventCustomPageRenderer,
  type EventCustomContext,
} from "./_components/event-custom-pages";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ev = await fetchEventServer(slug);
  if (!ev) return { title: "Событие не найдено · Rovno.dev" };
  const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "http://localhost:3000";

  const fallbackImage = `/api/og/event/${ev.slug}`;
  
  // Telegram requires absolute URLs and cannot render videos as previews.
  const isVideo = ev.cover_image_src?.match(/\.(webm|mp4|mov)$/i);
  const rawImage = ev.cover_image_src && !isVideo ? ev.cover_image_src : fallbackImage;
  
  const ogImage = rawImage.startsWith("http") 
    ? rawImage 
    : `${baseUrl}${rawImage}`;

  return {
    title: ev.seo_title || `${ev.title} · Rovno.dev`,
    description: ev.meta_description || ev.short_description || ev.description,
    openGraph: {
      title: ev.seo_title || ev.title,
      description: ev.meta_description || ev.short_description || ev.description,
      url: `${baseUrl}/events/${ev.slug}`,
      siteName: "Rovno.dev",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ev.title,
        }
      ],
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ev.seo_title || ev.title,
      description: ev.meta_description || ev.short_description || ev.description,
      images: [ogImage],
    },
  };
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const mdxComponents = {
  h2: (p: any) => (
    <h2
      className="text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight"
      {...p}
    />
  ),
  h3: (p: any) => (
    <h3 className="text-heading-3 text-(--on-bg-high) mt-8 mb-3" {...p} />
  ),
  p: (p: any) => (
    <p className="text-body-3 text-(--on-bg-medium) leading-[1.75] mb-4" {...p} />
  ),
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ev = await fetchEventServer(slug);
  if (!ev) notFound();

  // Bespoke template takes priority.
  const renderer = findEventCustomPageRenderer(ev.custom_page);
  const mdxContent = ev.mdx_content
    ? (
        await compileMDX({
          source: ev.mdx_content,
          components: mdxComponents,
          options: { parseFrontmatter: false },
        })
      ).content
    : null;

  if (renderer) {
    const ctx: EventCustomContext = {
      slug: ev.slug,
      title: ev.title,
      shortDescription: ev.short_description || "",
      description: ev.description || "",
      coverImage: ev.cover_image_src || "",
      coverVideo: ev.cover_video_src || undefined,
      startAt: ev.start_at || undefined,
      endAt: ev.end_at || undefined,
      locationName: ev.location_name || undefined,
      address: ev.address || undefined,
      metro: ev.metro || undefined,
      city: ev.city || undefined,
      price: ev.price || undefined,
      registrationUrl: ev.registration_url || undefined,

      registeredCount: ev.registered_count ?? 0,
    seatTypes: ev.seat_types || [],

      tags: (ev.tags || []).map((t) => ({ id: t.id, name: t.name })),
      content: mdxContent,
    };
    return <>{renderer.render(ctx)}</>;
  }

  // Default event layout.
  return (
    <main className="min-h-screen bg-(--bg) pb-24">
      <Container variant="full-width" className="pt-4 md:pt-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative w-full h-[480px] md:h-[600px] rounded-5xl md:rounded-7xl overflow-hidden bg-(--card) border border-(--outline) animate-reveal">
            {ev.cover_video_src ? (
              ev.cover_video_src.endsWith(".webm") || ev.cover_video_src.endsWith(".mp4") ? (
                <video
                  src={ev.cover_video_src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={`${ev.cover_video_src}?autoplay=1&muted=1&loop=1`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )
            ) : ev.cover_image_src ? (
              <Image
                src={ev.cover_image_src}
                alt={ev.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1400px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(to right, #CCFF00 1px, transparent 1px), linear-gradient(to bottom, #CCFF00 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="relative z-10 text-[#CCFF00] font-mono text-sm tracking-widest uppercase mb-4">System // Event</div>
                <div className="relative z-10 h-px w-24 bg-[#CCFF00] mb-4" />
                <div className="relative z-10 text-4xl md:text-6xl font-heading font-black text-white/20 select-none">NO COVER</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
              <Button variant="glass" size="icon-medium" shape="round" asChild>
                <Link href="/events" aria-label="Все события">
                  <ArrowLeft className="size-5" />
                </Link>
              </Button>
            </div>

            {ev.tags && ev.tags.length > 0 && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex flex-wrap gap-2 justify-end max-w-[60%]">
                {ev.tags.slice(0, 4).map((t) => (
                  <Badge
                    key={t.id}
                    variant="glass-static"
                    size="chip-small"
                    className="text-white border-white/20"
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-10">
              <h1 className="text-display-3 md:text-display-1 text-white leading-[1.05] tracking-tight mb-4 max-w-4xl">
                {ev.title}
              </h1>
              {ev.short_description && (
                <p className="text-body-3 md:text-body-1 text-white/80 leading-relaxed max-w-2xl mb-6">
                  {ev.short_description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-4 text-white/70">
                {ev.start_at && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarBlank className="size-4" />
                    {formatDate(ev.start_at)}
                    {formatTime(ev.start_at) && ` · ${formatTime(ev.start_at)}`}
                  </span>
                )}
                {ev.location_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {ev.location_name}
                  </span>
                )}
                {ev.price && (
                  <span className="inline-flex items-center gap-1.5">
                    <Ticket className="size-4" />
                    {ev.price}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <Container className="py-12 md:py-16">
        <div className="max-w-[760px] mx-auto">
          {mdxContent}
          {(ev.registration_url || ev.custom_page) && (
            <Card className="mt-12 rounded-3xl border-(--outline) bg-(--card) ring-0 p-8 text-center">
              <h2 className="text-display-4 text-(--on-bg-high) mb-3 tracking-tight">
                Хотите прийти?
              </h2>
              <p className="text-body-3 text-(--on-bg-medium) mb-6">
                Регистрация занимает меньше минуты.
              </p>
              {ev.registration_url ? (
                <Button size="large" asChild>
                  <a
                    href={ev.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Зарегистрироваться
                    <ArrowUpRight className="size-4" />
                  </a>
                </Button>
              ) : (
                <Button size="large" asChild>
                  <Link href={`/events/${ev.slug}/register`}>
                    Зарегистрироваться
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              )}
            </Card>
          )}
        </div>
      </Container>
    </main>
  );
}
