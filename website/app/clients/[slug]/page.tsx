import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpRight, Globe } from "lucide-react";
import { fetchClientServer } from "@/utils/api/clients";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await fetchClientServer(slug);
  if (!client) return { title: "Клиент не найден · Rovno.dev" };
  return {
    title: `${client.name} · Rovno.dev`,
    description: client.description || `Проекты для ${client.name}`,
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = await fetchClientServer(slug);
  if (!client) notFound();

  const projectCount = client.projects.length;

  return (
    <main className="min-h-screen bg-(--bg) pb-24">
      {/* Hero — logo + name + meta */}
      <section className="border-b border-(--outline) py-12 md:py-20">
        <Container>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Все клиенты
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start">
            {/* Logo tile */}
            <div className="relative size-40 md:size-[200px] rounded-4xl border border-(--outline) bg-(--card) overflow-hidden flex items-center justify-center shrink-0">
              {client.logotype_url ? (
                <Image
                  src={client.logotype_url}
                  alt={client.name}
                  fill
                  sizes="200px"
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <span className="text-display-2 font-heading font-semibold tracking-tighter text-(--on-bg-high) opacity-40">
                  {initials(client.name)}
                </span>
              )}
            </div>

            {/* Text */}
            <div className="min-w-0">
              {client.industry && (
                <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-3">
                  {client.industry}
                </p>
              )}
              <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05] mb-4">
                {client.name}
              </h1>
              {client.description && (
                <p className="text-body-1 text-(--on-bg-medium) leading-relaxed max-w-2xl mb-6">
                  {client.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {client.website && (
                  <Button variant="outlined" size="small" asChild>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="size-4" />
                      {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </Button>
                )}
                <Badge variant="tonal-card-static" size="chip-medium">
                  {projectCount}{" "}
                  {projectCount === 1
                    ? "проект"
                    : projectCount < 5
                    ? "проекта"
                    : "проектов"}
                </Badge>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Projects grid */}
      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) mb-8">
            {projectCount > 0 ? "Проекты" : "Пока нет проектов"}
          </h2>

          {projectCount === 0 ? (
            <Card className="rounded-3xl border-(--outline) p-10 text-center">
              <p className="text-body-3 text-(--on-bg-medium)">
                Мы пока не опубликовали проекты для этого клиента.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.projects.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="group block animate-reveal fill-mode-both"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <Card className="relative overflow-hidden rounded-4xl border border-(--outline) bg-(--card) ring-0 aspect-[16/10]">
                    {p.cover_image_src ? (
                      <Image
                        fill
                        src={p.cover_image_src}
                        alt={p.title}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                      {p.period && (
                        <p className="text-body-5 uppercase tracking-widest text-white/60 mb-2">
                          {p.period}
                        </p>
                      )}
                      <h3 className="text-display-4 md:text-display-3 text-white leading-tight max-w-[92%] transition-transform group-hover:-translate-y-1">
                        {p.title}
                      </h3>
                      {p.short_description && (
                        <p className="mt-2 text-body-4 text-white/80 line-clamp-2">
                          {p.short_description}
                        </p>
                      )}
                    </div>
                    <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
                        <ArrowUpRight className="size-5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
