import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users } from "@phosphor-icons/react/dist/ssr";
import { fetchPublicTeamServer, type PublicTeamMember } from "@/utils/api/team";

export const revalidate = 60;

function ExpertCard({ member, index }: { member: PublicTeamMember; index: number }) {
  const displayName =
    [member.name, member.surname].filter(Boolean).join(" ") ||
    member.username ||
    "Участник";
  const avatar = member.avatar_url || member.cover_url || "";
  const bio = member.bio || member.short_bio || "";
  const projectsWord =
    member.project_count === 1
      ? "проект"
      : member.project_count < 5
        ? "проекта"
        : "проектов";

  return (
    <Link
      href={`/${member.username}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <Card className="border-none bg-transparent shadow-none ring-0 p-0 overflow-visible">
        <div className="relative mb-6 overflow-hidden rounded-4xl border border-(--outline) bg-(--card) transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-(--primary)/10 group-hover:-translate-y-1">
          <AspectRatio ratio={4 / 5}>
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card) flex items-center justify-center">
                <span className="text-display-1 font-heading font-semibold tracking-tighter text-(--on-bg-high) opacity-30">
                  {displayName.slice(0, 1)}
                </span>
              </div>
            )}
          </AspectRatio>
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            {member.project_count > 0 && (
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/60 mb-1.5 tabular-nums">
                {member.project_count} {projectsWord}
              </p>
            )}
            <p className="text-body-4 text-white/95 leading-tight">
              {member.role}
            </p>
          </div>
          <div className="absolute top-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
              <ArrowUpRight className="size-5" />
            </span>
          </div>
        </div>
        <div className="px-1">
          <h3 className="text-display-4 text-(--on-bg-high) mb-1">
            {displayName}
          </h3>
          {bio && (
            <p className="text-body-4 text-(--on-bg-medium) line-clamp-2 leading-relaxed">
              {bio}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default async function AboutPage() {
  const members = await fetchPublicTeamServer();

  return (
    <main className="min-h-screen bg-(--bg) py-20 md:py-32">
      <section className="bg-(--card)/40">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <div className="max-w-[640px]">
              <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight">
                Наши эксперты
              </h1>
            </div>
            <Button
              variant="glass"
              size="large"
              shape="round"
              asChild
              className="shrink-0"
            >
              <Link
                href="https://forms.yandex.com/u/69975d0849af47b15b4c80df"
                target="_blank"
                rel="noopener noreferrer"
              >
                Присоединиться к нам
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          {members.length === 0 ? (
            <Card className="rounded-3xl border-(--outline) bg-(--card) ring-0 p-10 text-center">
              <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
                <Users className="size-6" />
              </div>
              <p className="text-body-3 text-(--on-bg-medium)">
                Экспертов пока нет. Они появятся здесь, как только будут
                добавлены в команду через админ-панель.
              </p>
            </Card>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                members.length >= 4
                  ? "lg:grid-cols-4"
                  : members.length === 3
                    ? "lg:grid-cols-3"
                    : "lg:grid-cols-2"
              } gap-6 md:gap-8`}
            >
              {members.map((m, idx) => (
                <ExpertCard key={m.id} member={m} index={idx} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
