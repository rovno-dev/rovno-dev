import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchClientsServer,
  type ClientListItem,
} from "@/utils/api/companies";
import { ArrowUpRight, HandshakeIcon } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 300;
export const metadata = {
  title: "Компании · Rovno.dev",
  description:
    "Организации, с которыми мы работали — от брендинга и айдентики до продуктовых сайтов и 3D.",
};

/** Two-letter initials for the fallback tile when no logotype is set. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Russian pluralisation: 1 организация, 2 организации, 5 организаций. */
function pluralize(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

export default async function ClientsPage() {
  const clients = await fetchClientsServer();

  const industries = new Set(
    clients.map((c) => c.industry).filter((v): v is string => !!v),
  );
  const totalProjects = clients.reduce((s, c) => s + c.project_count, 0);

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative border-b border-(--outline) pt-20 md:pt-28 pb-14 md:pb-20 overflow-hidden">
        {/* Blueprint grid, faded to a radial so it dissolves at the edges. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 70% 70% at 30% 0%, black 35%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 70% at 30% 0%, black 35%, transparent 90%)",
          }}
        />
        {/* Single accent bloom in the corner. */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 15% 10%, var(--primary-glass), transparent 65%)",
          }}
        />

        <Container className="relative">
          <div className="max-w-[860px] animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.34em] text-(--on-bg-low) mb-5">
              Компании
            </p>
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-6 leading-[1.02] tracking-[-0.02em]">
              Те, для кого мы <span className="text-(--primary)">работали</span>.
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-[620px]">
              {clients.length > 0
                ? "Портфолио по каждому кейсу — в разделе «Проекты»."
                : "Здесь появятся клиенты, с которыми мы работаем."}
            </p>
          </div>

          {clients.length > 0 && (
            <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6 max-w-[640px] animate-reveal [animation-delay:180ms] fill-mode-both">
              <Stat
                value={String(clients.length)}
                label={pluralize(clients.length, "организация", "организации", "организаций")}
              />
              <Stat
                value={String(industries.size)}
                label={pluralize(industries.size, "отрасль", "отрасли", "отраслей")}
              />
              <Stat
                value={String(totalProjects)}
                label={pluralize(totalProjects, "проект", "проекта", "проектов")}
              />
            </div>
          )}
        </Container>
      </section>

      {/* ─────────────────────────── BODY ─────────────────────────── */}
      <section className="py-14 md:py-20">
        <Container>
          {clients.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {clients.map((c, idx) => (
                <ClientTile key={c.id} client={c} index={idx} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ─────────────────────────── CTA ──────────────────────────── */}
      {clients.length > 0 && (
        <section className="pb-24">
          <Container>
            <div className="relative rounded-4xl border border-(--outline) bg-(--card) p-8 md:p-12 overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 120% at 100% 0%, var(--primary-glass), transparent 65%)",
                }}
              />
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-heading-2 md:text-display-4 text-(--on-bg-high) mb-2 tracking-tight">
                    Хотите в этот список?
                  </h2>
                  <p className="text-body-3 text-(--on-bg-medium) max-w-xl">
                    Расскажите о задаче — ответим в течение 3 часов.
                  </p>
                </div>
                <Button size="large" asChild className="shrink-0">
                  <Link href="/order">
                    Оформить заказ
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-(--outline) pl-5">
      <div className="text-display-4 md:text-display-3 text-(--on-bg-high) leading-none mb-2 tabular-nums tracking-tight">
        {value}
      </div>
      <div className="text-body-5 uppercase tracking-[0.22em] text-(--on-bg-low)">
        {label}
      </div>
    </div>
  );
}

/**
 * Empty state rendered as a specimen wall: ten dashed tiles fading at the
 * edges with the message floating in the center. Reads as "logos land here"
 * rather than "no data found."
 */
function EmptyState() {
  const GHOSTS = 10;
  return (
    <div className="relative animate-reveal">
      {/* Ghost tile grid — masked to a soft radial so edges dissolve. */}
      <div
        aria-hidden
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
        style={{
          maskImage:
            "radial-gradient(ellipse 75% 75% at 50% 50%, black 25%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 75% at 50% 50%, black 25%, transparent 92%)",
        }}
      >
        {Array.from({ length: GHOSTS }).map((_, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-3xl border border-dashed border-(--outline) bg-(--card)/40"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono tabular-nums tracking-[0.3em] text-(--on-bg-low)/40">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Centered message. A soft radial vignette behind it keeps the copy
          readable regardless of how busy the ghost grid appears underneath. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 40% 45% at 50% 50%, var(--bg) 30%, transparent 85%)",
          }}
        />
        <div className="relative pointer-events-auto max-w-sm text-center px-6">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-5">
            <HandshakeIcon className="size-6" />
          </div>
          <h2 className="text-display-4 text-(--on-bg-high) mb-3 tracking-tight">
            Пока пусто
          </h2>
          <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-7">
            Как только появятся первые проекты с&nbsp;привязанным клиентом,
            они окажутся здесь.
          </p>
          <Button size="large" asChild>
            <Link href="/projects">
              Смотреть проекты
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClientTile({
  client,
  index,
}: {
  client: ClientListItem;
  index: number;
}) {
  const hasLogo = !!client.logotype_url;
  const href = `/companies/${client.slug}`;

  return (
    <Link
      href={href}
      className="group relative animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Card className="relative aspect-square rounded-3xl border border-(--outline) bg-(--card) ring-0 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-(--primary)/40 group-hover:shadow-xl group-hover:shadow-(--primary)/5">
        {/* Corner bloom, hover-revealed. */}
        <div
          aria-hidden
          className="absolute top-0 right-0 size-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 100% 0%, var(--primary-glass), transparent 70%)",
          }}
        />

        {/* Logo (or initials fallback). */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {hasLogo ? (
            <div className="relative w-full h-full max-w-[70%] max-h-[70%]">
              <Image
                src={client.logotype_url!}
                alt={client.name}
                fill
                sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 20vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <span className="text-display-2 font-heading font-semibold tracking-tighter text-(--on-bg-high) opacity-40 group-hover:opacity-70 transition-opacity">
              {initials(client.name)}
            </span>
          )}
        </div>

        {/* Industry tag — top-left, muted at rest. */}
        {client.industry && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.22em] text-(--on-bg-low)">
            {client.industry}
          </span>
        )}

        {/* Project count — bottom-right, tabular, subtle accent on hover. */}
        {client.project_count > 0 && (
          <span className="absolute bottom-3 right-3 text-[10px] font-medium tabular-nums text-(--on-bg-low) group-hover:text-(--primary) transition-colors">
            {client.project_count}{" "}
            {pluralize(client.project_count, "проект", "проекта", "проектов")}
          </span>
        )}

        {/* Name overlay — hover-revealed, bottom gradient. */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-body-3 font-medium text-white truncate">
            {client.name}
          </p>
        </div>
      </Card>
    </Link>
  );
}
