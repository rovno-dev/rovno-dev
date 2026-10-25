import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { ExpertCTA } from "./_components/expert-cta";
import TatarstanIcon from "@/components/icons/experts-icons/Tatarstan-icon";
import { resolveExpertSocialIcon, resolveExpertTagIcon } from "@/components/icons/expert-icon-map";
import { fetchTeamMemberServer, fetchTeamMemberProjectsServer, type TeamMemberPublicProject } from "@/utils/api/team";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function mapProjects(fromDb: TeamMemberPublicProject[]) {
  const seen = new Set<string>();
  return fromDb.filter(p => { if (seen.has(p.slug)) return false; seen.add(p.slug); return true; });
}

export default async function ExpertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [member, dbProjects] = await Promise.all([fetchTeamMemberServer(slug), fetchTeamMemberProjectsServer(slug)]);
  if (!member) notFound();

  const stats = member.expert_stats ?? [];
  const skills = member.expert_skills ?? [];
  const milestones = member.expert_milestones ?? [];
  const tags = member.expert_tags ?? [];
  const socials = member.expert_socials ?? [];
  const location = member.location || null;
  const projects = mapProjects(dbProjects);
  const displayName = [member.name, member.surname].filter(Boolean).join(" ") || member.username || "Участник";
  const heroImage = member.cover_url || member.avatar_url || "";

  return (
    <main className="min-h-screen bg-(--bg) pb-24 md:pb-32">
      <Container variant="full-width" className="pt-4 md:pt-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative w-full h-[560px] md:h-[680px] rounded-5xl md:rounded-7xl overflow-hidden bg-(--card) border border-(--outline) animate-reveal">
            {heroImage ? <Image src={heroImage} fill sizes="(max-width: 768px) 100vw, 1200px" className="object-cover object-center" alt={displayName} priority /> : <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30">
              <Button variant="glass" size="icon-medium" shape="round" asChild className="[&_path]:fill-white! bg-black/30 border-white/25 hover:bg-black/50"><Link href="/about"><ArrowLeft className="size-5" /></Link></Button>
            </div>
            {socials.length > 0 && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-row md:flex-col gap-2">
                {socials.map((social, key) => (
                  <Button key={key} variant="glass" size="icon-medium" shape="round" asChild className="[&_path]:fill-white! bg-black/30 border-white/25 hover:bg-black/50" style={{ animationDelay: `${300 + key * 80}ms` }}>
                    <Link href={social.href} target="_blank">{resolveExpertSocialIcon(social.kind)}</Link>
                  </Button>
                ))}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-12">
              <div className="flex items-center gap-3 md:gap-4 mb-4 animate-reveal">
                <h1 className="text-display-2 md:text-display-1 text-white tracking-tight leading-none">{displayName}</h1>
                {slug === "niyazgim" && <TatarstanIcon className="size-9 md:size-12 shrink-0" />}
              </div>
              <p className="text-body-2 md:text-display-5 text-white/75 mb-4 animate-reveal">{member.role}</p>
              {location && <p className="inline-flex items-center gap-1.5 text-body-4 text-white/55 animate-reveal"><MapPin className="size-4" />{location}</p>}
            </div>
          </div>
        </div>
      </Container>

      {stats.length > 0 && (
        <Container variant="full-width" className="pt-12 md:pt-16">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
            {stats.map((s, i) => (
              <div key={i} className="bg-(--bg) p-6 md:p-8">
                <div className="text-4xl md:text-5xl font-heading font-semibold text-(--primary) leading-none mb-2">{s.value}</div>
                <p className="text-body-5 uppercase tracking-[0.16em] text-(--on-bg-low)">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      )}

      <Container variant="full-width" className="pt-16 md:pt-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-16 items-start">
          <div className="space-y-5">
            {member.short_bio && <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed">{member.short_bio}</p>}
            {member.bio && <p className="text-body-2 text-(--on-bg-medium) leading-relaxed whitespace-pre-line">{member.bio}</p>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {tags.map((tag, idx) => {
                const icon = resolveExpertTagIcon(tag.icon_key);
                return (
                  <Badge key={idx} variant="tonal-card-static" size="chip-medium" className="gap-2">
                    {icon && <span className="size-3.5 inline-flex items-center justify-center">{icon}</span>}
                    {tag.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      {skills.length > 0 && (
        <ScrollReveal threshold={0.05}>
          <Container variant="full-width" className="pt-20 md:pt-28">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) mb-10 tracking-tight">Что делает лучше всех</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {skills.map((skill, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-body-2 md:text-body-1 font-medium text-(--on-bg-high)">{skill.label}</span>
                      <span className="font-mono text-sm text-(--on-bg-low)">{skill.level}</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-(--bg-disabled) overflow-hidden"><div className="h-full rounded-full bg-(--primary)" style={{ width: `${skill.level}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </ScrollReveal>
      )}

      {milestones.length > 0 && (
        <ScrollReveal threshold={0.05}>
          <Container variant="full-width" className="pt-20 md:pt-28">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) mb-10 tracking-tight">Карьерный путь</h2>
              <div>
                {milestones.map((m, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 md:gap-10 py-8 border-b border-(--outline) last:border-b-0">
                    <div className="font-mono text-display-3 md:text-display-2 text-(--primary) font-semibold leading-none mt-1">{m.year}</div>
                    <div>
                      <h3 className="text-heading-2 md:text-display-4 text-(--on-bg-high) mb-3 tracking-tight">{m.title}</h3>
                      <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-2xl">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </ScrollReveal>
      )}

      <ScrollReveal threshold={0.02}>
        <Container variant="full-width" className="pt-20 md:pt-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-baseline justify-between gap-6 mb-8 md:mb-12">
              <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight">Проекты</h2>
              <span className="text-body-4 text-(--on-bg-low)">{projects.length} кейсов</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, idx) => (
                <Link key={project.slug} href={`/projects/${project.slug}`} className="group block">
                  <Card className="relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) aspect-[16/10]">
                    {project.cover_image_src && <Image fill src={project.cover_image_src} alt={project.title} className="object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5">
                      <h3 className="text-body-2 md:text-heading-3 text-white leading-tight">{project.title}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </ScrollReveal>

      <ExpertCTA displayName={displayName} />
    </main>
  );
}