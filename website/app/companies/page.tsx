import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchClientsServer } from "@/utils/api/companies";
import { ArrowUpRight, Handshake } from "@phosphor-icons/react";

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

export default async function ClientsPage() {
  const clients = await fetchClientsServer();

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero */}
      <section className="border-b border-(--outline) py-16 md:py-24">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-4">
              Компании
            </p>
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-6 leading-[1.05]">
              Те, для кого мы <span className="text-(--primary)">работали</span>.
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
              {clients.length > 0
                ? `${clients.length} ${clients.length === 1 ? "организация" : clients.length < 5 ? "организации" : "организаций"} — от небольших студий до крупных брендов. Портфолио по каждому кейсу смотрите в разделе «Проекты».`
                : "Здесь появятся клиенты, с которыми мы работаем."}
            </p>
          </div>
        </Container>
      </section>

      {/* Logo wall */}
      <section className="py-12 md:py-20">
        <Container>
          {clients.length === 0 ? (
            <Card className="rounded-3xl border-(--outline) p-12 text-center max-w-xl mx-auto">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
                <Handshake className="size-6" />
              </div>
              <h2 className="text-heading-3 mb-2">Пока пусто</h2>
              <p className="text-body-4 text-(--on-bg-medium) mb-6">
                Как только появятся первые проекты с привязанным клиентом, они окажутся здесь.
              </p>
              <Button asChild>
                <Link href="/projects">
                  Смотреть проекты
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {clients.map((c, idx) => (
                <ClientTile key={c.id} client={c} index={idx} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Bottom CTA */}
      {clients.length > 0 && (
        <section className="pb-24">
          <Container>
            <div className="rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-heading-2 text-(--on-bg-high) mb-2">
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
          </Container>
        </section>
      )}
    </main>
  );
}

function ClientTile({
  client,
  index,
}: {
  client: import("@/utils/api/clients").ClientListItem;
  index: number;
}) {
  const hasLogo = !!client.logotype_url;
  // Prefer the internal profile page — it shows every project and reads
  // as a client dossier. The website link lives on the profile header.
  const href = `/companies/${client.slug}`;
  const isExternal = false;

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group relative animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Card className="relative aspect-square rounded-3xl border border-(--outline) bg-(--card) ring-0 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-(--primary)/40 group-hover:shadow-xl group-hover:shadow-(--primary)/5">
        {/* Logo (or initial fallback) centred in the tile */}
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

        {/* Industry tag — top-left, shown only if we have one. Subtle enough
            not to fight the logo. */}
        {client.industry && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-(--on-bg-low) opacity-0 group-hover:opacity-100 transition-opacity">
            {client.industry}
          </span>
        )}

        {/* Bottom overlay with name + count, hover reveal */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-body-3 font-medium text-white truncate">
            {client.name}
          </p>
          {client.project_count > 0 && (
            <p className="text-body-5 text-white/70">
              {client.project_count}{" "}
              {client.project_count === 1
                ? "проект"
                : client.project_count < 5
                ? "проекта"
                : "проектов"}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
