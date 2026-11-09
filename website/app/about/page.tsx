import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Users } from "@phosphor-icons/react/dist/ssr";
import { fetchPublicTeamServer, type PublicTeamMember } from "@/utils/api/team";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";
import { HandshakeIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata = pageMetadata({
  title: "О нас",
  description:
    "Команда экспертов Rovno.dev — дизайн, разработка, 3D и продуктовые решения.",
  path: "/about",
  ogImage: buildOgImageUrl("О нас", "Эксперты Rovno.dev"),
});

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
      {/* Image: 4:5, no rounding, no border. */}
      <div className="relative w-full aspect-square overflow-hidden bg-(--card)">
        {avatar ? (
          <Image
            src={avatar}
            alt={displayName}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card) flex items-center justify-center">
            <span className="text-display-1 font-heading tracking-tighter text-(--on-bg-high) opacity-30">
              {displayName.slice(0, 1)}
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10 flex items-center justify-center size-10 bg-black/40 backdrop-blur-md text-white opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <ArrowUpRight className="size-5" weight="bold" />
        </div>
      </div>

      {/* Text block under the image */}
      <div className="pt-4 md:pt-5">
        <h3 className="text-xl md:text-2xl lg:text-3xl text-(--on-bg-high) leading-[1.15] tracking-tight font-heading  group-hover:text-(--primary) transition-colors">
          {displayName}
        </h3>
        <p className="mt-2 text-body-4 text-(--on-bg-medium)">
          {member.role}
          {member.project_count > 0 && (
            <span>
              {" "}• {member.project_count} {projectsWord}
            </span>
          )}
        </p>
        {/* {bio && (
          <p className="mt-2 text-sm text-(--on-bg-low) line-clamp-2 leading-relaxed">
            {bio}
          </p>
        )} */}
      </div>
    </Link>
  );
}

export default async function AboutPage() {
  const members = await fetchPublicTeamServer();

  return (
    <main className="min-h-screen bg-(--bg) py-20 md:py-32">
      <section >
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
            <h1 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight">
              Наши эксперты
            </h1>
            <Button
              variant="text"
              size="small"
              asChild
              className="shrink-0 text-(--on-bg-medium)"
            >
              <Link
                href="https://forms.yandex.com/u/69975d0849af47b15b4c80df"
                target="_blank"
                rel="noopener noreferrer"
              >
                Присоединиться к нам
                <HandshakeIcon className="size-4" />
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
              className={`grid grid-cols-1 sm:grid-cols-2 ${members.length >= 4
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
