import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import TatarstanIcon from "@/components/icons/experts-icons/Tatarstan-icon";
import { EXPERTS_DATA } from "@/app/_data/experts";
import {
  fetchTeamMemberServer,
  fetchTeamMemberProjectsServer,
  type PublicTeamMember,
  type TeamMemberPublicProject,
} from "@/utils/api/team";

// Render on every request. The expert page reflects admin-pinned projects
// immediately — no ISR staleness window.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RenderProject {
  slug: string;
  title: string;
  coverImage: string;
  period?: string;
  categoryLabel?: string;
  roleOnProject?: string;
  shortDescription?: string;
}

/**
 * Merge DB-pinned projects with any hardcoded fallback list. The DB list
 * wins — hardcoded is only used when a member has no DB assignments yet.
 */
function mergeProjects(
  fromDb: TeamMemberPublicProject[],
  fallback: Array<{ slug: string; title: string; cover?: { imageSrc: string }; period?: string; shortDescription?: string }>,
): RenderProject[] {
  const seen = new Set<string>();
  const out: RenderProject[] = [];

  for (const p of fromDb) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push({
      slug: p.slug,
      title: p.title,
      coverImage: p.cover_image_src,
      period: p.period || undefined,
      categoryLabel: p.category_label || undefined,
      roleOnProject: p.role_on_project || undefined,
      shortDescription: p.short_description || undefined,
    });
  }
  for (const p of fallback) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push({
      slug: p.slug,
      title: p.title,
      coverImage: p.cover?.imageSrc || "",
      period: p.period,
      shortDescription: p.shortDescription,
    });
  }
  return out;
}

export default async function ExpertPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // DB is the source of truth for identity.
  const [member, dbProjects] = await Promise.all([
    fetchTeamMemberServer(slug),
    fetchTeamMemberProjectsServer(slug),
  ]);

  // Hardcoded enrichment — stats, skills, milestones, tags, socials. This
  // is optional; the page renders fine without it.
  const enrichment = EXPERTS_DATA[slug];

  if (!member) notFound();

  const displayName =
    [member.name, member.surname].filter(Boolean).join(" ") ||
    member.username ||
    "Участник";
  const heroImage = member.cover_url || member.avatar_url || "";
  const longBio = member.bio;
  const shortBio = member.short_bio;

  const projects = mergeProjects(dbProjects, enrichment?.projects || []);
  const projectWord =
    projects.length === 1
      ? "кейс"
      : projects.length < 5
      ? "кейса"
      : "кейсов";

  return (
    <main className="min-h-screen bg-(--bg) pb-24 md:pb-32">
      {/* ═══════════ HERO ═══════════ */}
      <Container variant="full-width" className="pt-4 md:pt-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative w-full h-[560px] md:h-[680px] rounded-5xl md:rounded-7xl overflow-hidden bg-(--card) border border-(--outline) animate-reveal">
            {heroImage ? (
              <Image
                src={heroImage}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover object-center"
                alt={displayName}
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30">
              <Button
                variant="glass"
                size="icon-medium"
                shape="round"
                asChild
                className="[&_path]:fill-white! bg-black/30 border-white/25 hover:bg-black/50"
              >
                <Link href="/about" aria-label="Назад к команде">
                  <ArrowLeft className="size-5" />
                </Link>
              </Button>
            </div>

            {enrichment?.socials && enrichment.socials.length > 0 && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-row md:flex-col gap-2">
                {enrichment.socials.map((social, key) => (
                  <Button
                    key={key}
                    variant="glass"
                    size="icon-medium"
                    shape="round"
                    asChild
                    className="animate-reveal [&_path]:fill-white! bg-black/30 border-white/25 hover:bg-black/50 [&_svg]:text-white!"
                    style={{ animationDelay: `${300 + key * 80}ms` }}
                  >
                    <Link
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-12">
              <div className="flex items-center gap-3 md:gap-4 mb-4 animate-reveal delay-200 fill-mode-both">
                <h1 className="text-display-2 md:text-display-1 text-white tracking-tight leading-none">
                  {displayName}
                </h1>
                {slug === "niyazgim" && (
                  <TatarstanIcon className="size-9 md:size-12 shrink-0 drop-shadow-lg" />
                )}
              </div>
              <p className="text-body-2 md:text-display-5 text-white/75 max-w-2xl leading-snug mb-4 animate-reveal delay-300 fill-mode-both">
                {member.role}
              </p>
              {enrichment?.location && (
                <p className="inline-flex items-center gap-1.5 text-body-4 text-white/55 animate-reveal delay-400 fill-mode-both">
                  <MapPin className="size-4" weight="fill" />
                  {enrichment.location}
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* ═══════════ STATS (hardcoded enrichment only) ═══════════ */}
      {enrichment?.stats && enrichment.stats.length > 0 && (
        <Container variant="full-width" className="pt-12 md:pt-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
              {enrichment.stats.map((s, i) => (
                <div key={i} className="bg-(--bg) p-6 md:p-8">
                  <div className="text-4xl md:text-5xl font-heading font-semibold tracking-tight text-(--primary) leading-none mb-2 tabular-nums">
                    {s.value}
                  </div>
                  <p className="text-body-5 uppercase tracking-[0.16em] text-(--on-bg-low)">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* ═══════════ BIO + TAGS ═══════════ */}
      <Container variant="full-width" className="pt-16 md:pt-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-16 items-start">
          <div className="space-y-5 animate-reveal">
            {shortBio && (
              <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed">
                {shortBio}
              </p>
            )}
            {longBio && (
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed whitespace-pre-line">
                {longBio}
              </p>
            )}
          </div>

          {enrichment?.tags && enrichment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {enrichment.tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="tonal-card-static"
                  size="chip-medium"
                  className="gap-2 animate-reveal fill-mode-both"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {tag.icon && (
                    <span className="size-3.5 inline-flex items-center justify-center [&>svg]:size-3.5">
                      {tag.icon}
                    </span>
                  )}
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* ═══════════ SKILLS (hardcoded enrichment only) ═══════════ */}
      {enrichment?.skills && enrichment.skills.length > 0 && (
        <ScrollReveal threshold={0.05}>
          <Container variant="full-width" className="pt-20 md:pt-28">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) mb-8 tracking-tight">
                Что делает лучше всех
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                {enrichment.skills.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-body-3 text-(--on-bg-high)">
                        {skill.label}
                      </span>
                      <span className="font-mono text-[11px] text-(--on-bg-low) tabular-nums">
                        {skill.level}
                      </span>
                    </div>
                    <div className="h-[3px] rounded-full bg-(--bg-disabled) overflow-hidden">
                      <div
                        className="h-full rounded-full bg-(--primary) transition-[width] duration-1000"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </ScrollReveal>
      )}

      {/* ═══════════ MILESTONES (hardcoded enrichment only) ═══════════ */}
      {enrichment?.milestones && enrichment.milestones.length > 0 && (
        <ScrollReveal threshold={0.05}>
          <Container variant="full-width" className="pt-20 md:pt-28">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) mb-8 tracking-tight">
                Карьерный путь
              </h2>
              <div>
                {enrichment.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-8 py-6 border-b border-(--outline) last:border-b-0"
                  >
                    <div className="font-mono text-display-4 text-(--primary) font-semibold tabular-nums leading-none">
                      {m.year}
                    </div>
                    <div>
                      <h3 className="text-heading-3 text-(--on-bg-high) mb-2">
                        {m.title}
                      </h3>
                      <p className="text-body-3 text-(--on-bg-medium) leading-relaxed max-w-2xl">
                        {m.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </ScrollReveal>
      )}

      {/* ═══════════ LINKED PROJECTS ═══════════ */}
      <ScrollReveal threshold={0.02}>
        <Container variant="full-width" className="pt-20 md:pt-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-baseline justify-between gap-6 mb-8 md:mb-12">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-8 bg-(--primary)" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                    Портфолио
                  </span>
                </div>
                <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight">
                  Проекты
                </h2>
              </div>
              <span className="text-body-4 text-(--on-bg-low) tabular-nums">
                {projects.length} {projectWord}
              </span>
            </div>

            {projects.length === 0 ? (
              <p className="text-body-3 text-(--on-bg-medium) text-center py-12">
                Пока нет привязанных проектов.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, idx) => (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className="group block animate-reveal fill-mode-both"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <Card className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) ring-0 aspect-[16/10]">
                      {project.coverImage ? (
                        <Image
                          fill
                          src={project.coverImage}
                          alt={project.title}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
                        {project.categoryLabel && (
                          <p className="text-[10px] uppercase tracking-[0.24em] text-white/60 mb-1.5">
                            {project.categoryLabel}
                          </p>
                        )}
                        <h3 className="text-body-2 md:text-heading-3 text-white leading-tight">
                          {project.title}
                        </h3>
                        {project.roleOnProject && (
                          <p className="text-body-5 text-white/70 mt-1">
                            {project.roleOnProject}
                          </p>
                        )}
                      </div>
                      <div className="absolute bottom-5 right-5 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
                          <ArrowUpRight className="size-4" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Container>
      </ScrollReveal>

      {/* ═══════════ CTA ═══════════ */}
      <ScrollReveal threshold={0.02}>
        <Container variant="full-width" className="pt-24 md:pt-32">
          <div className="max-w-[1200px] mx-auto">
            <div className="relative rounded-5xl border border-(--outline) bg-(--card) p-8 md:p-14 overflow-hidden text-center">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 90% at 50% 0%, var(--primary-glass), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="inline-flex items-center gap-2 mb-6">
                  <Sparkle className="size-4 text-(--primary)" weight="fill" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                    Сотрудничество
                  </span>
                </div>
                <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight mb-6 max-w-2xl mx-auto">
                  Хотите работать с {displayName.split(" ")[0]}?
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="large" asChild>
                    <Link href="/order">
                      Оформить заказ
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  {enrichment?.socials?.[0] && (
                    <Button size="large" variant="outlined" asChild>
                      <Link
                        href={enrichment.socials[0].href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Написать напрямую
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </ScrollReveal>
    </main>
  );
}
