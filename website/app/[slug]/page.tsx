import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import ProjectCard from "@/components/layout/projects/project-card";
import { ExpertCTA } from "./_components/expert-cta";
import { ExpertHero } from "./_components/expert-hero";
import { ExpertTags } from "./_components/expert-tags";
import { fetchTeamMemberServer, fetchTeamMemberProjectsServer, type TeamMemberPublicProject } from "@/utils/api/team";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";
import type { Project } from "@/utils/api/projects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await fetchTeamMemberServer(slug);
  if (!member) return { title: "Эксперт не найден · Rovno.dev" };
  const name = [member.name, member.surname].filter(Boolean).join(" ") || member.username || "Эксперт";
  return pageMetadata({
    title: `${name} — ${member.role}`,
    description: member.bio || member.short_bio || `Профиль эксперта Rovno.dev — ${name}, ${member.role}`,
    path: `/${slug}`,
    ogImage: buildOgImageUrl(name, member.role),
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExpertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [member, dbProjects] = await Promise.all([
    fetchTeamMemberServer(slug),
    fetchTeamMemberProjectsServer(slug),
  ]);
  if (!member) notFound();

  const stats = member.expert_stats ?? [];
  const skills = member.expert_skills ?? [];
  const milestones = member.expert_milestones ?? [];
  const tags = member.expert_tags ?? [];
  const socials = member.expert_socials ?? [];
  const location = member.location || null;

  const displayName = [member.name, member.surname].filter(Boolean).join(" ") || member.username || "Участник";
  const heroImage = member.cover_url || member.avatar_url || "";

  // Map TeamMemberPublicProject to the shape ProjectCard expects
  const projects: Project[] = dbProjects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: "",
    shortDescription: p.short_description || "",
    cover: { imageSrc: p.cover_image_src },
    category: p.category_label || "",
    clientId: "",
  }));

  return (
    <main className="min-h-screen bg-(--bg) pb-24 md:pb-32">
      <ExpertHero
        slug={slug}
        displayName={displayName}
        role={member.role}
        location={location}
        heroImage={heroImage}
        socials={socials}
      />

      {stats.length > 0 && (
        <Container variant="full-width" className="pt-10 md:pt-14">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-6xl md:text-7xl lg:text-8xl font-heading  tracking-[-0.04em] leading-none mb-4 text-(--on-bg-high) tabular-nums">
                  {s.value}
                </div>
                <p className="text-body-4 md:text-body-2 text-(--on-bg-medium) leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      )}

      <Container variant="full-width" className="pt-10 md:pt-14">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-start">
          <div className="space-y-6">
            {member.short_bio && <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed">{member.short_bio}</p>}
            {member.bio && <p className="text-body-2 text-(--on-bg-medium) leading-relaxed whitespace-pre-line">{member.bio}</p>}
          </div>
          <ExpertTags tags={tags} />
        </div>
      </Container>

      {skills.length > 0 && (
        <ScrollReveal threshold={0.05}>
          <Container variant="full-width" className="pt-12 md:pt-16">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) mb-10 tracking-tight">Что делает лучше всех</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {skills.map((skill, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-body-2 md:text-body-1  text-(--on-bg-high)">{skill.label}</span>
                      <span className="font-mono text-sm text-(--on-bg-low)">{skill.level}</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-(--bg-disabled) overflow-hidden">
                      <div className="h-full rounded-full bg-(--primary)" style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </ScrollReveal>
      )}

      {milestones.length > 0 && (
        <ScrollReveal threshold={0.05}>
          <Container variant="full-width" className="pt-12 md:pt-16">
            <div className="max-w-[1200px] mx-auto">
              <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) mb-10 tracking-tight">Карьерный путь</h2>
              <div>
                {milestones.map((m, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 md:gap-10 py-8 border-b border-(--outline) last:border-b-0">
                    <div className="font-mono text-display-3 md:text-display-2 text-(--primary) leading-none mt-1">{m.year}</div>
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
        <Container variant="full-width" className="pt-12 md:pt-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex items-baseline justify-between gap-6 mb-8 md:mb-12">
              <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight">Проекты</h2>
              <span className="text-body-4 text-(--on-bg-low)">{projects.length} кейсов</span>
            </div>
            {/* Using the new minimalist project cards! */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map((project, idx) => (
                <ProjectCard key={project.slug} project={project} index={idx} variant="clean" />
              ))}
            </div>
          </div>
        </Container>
      </ScrollReveal>

      <ExpertCTA displayName={displayName} />
    </main>
  );
}
