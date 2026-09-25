"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EXPERTS_DATA } from "@/app/_data/experts";
import ProjectCard from "@/components/layout/projects/project-card";
import TatarstanIcon from "@/components/icons/experts-icons/Tatarstan-icon";
import { fetchTeamMemberByUsername, type TeamMemberPublic } from "@/utils/api/team";

const CONTENT_MAX = "max-w-[1200px] mx-auto";

export default function ExpertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const expert = EXPERTS_DATA[slug];
  if (!expert) notFound();

  // Overlay the DB-backed team record (cover_url + long bio) on top of the
  // hardcoded EXPERTS_DATA. Anyone in the admin list who's been made a team
  // member gets their /uploads/images/… cover and full bio rendered here.
  const [teamInfo, setTeamInfo] = useState<TeamMemberPublic | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchTeamMemberByUsername(slug)
      .then((t) => { if (!cancelled) setTeamInfo(t); })
      .catch(() => { /* no DB record → fall back to hardcoded */ });
    return () => { cancelled = true; };
  }, [slug]);

  const heroImage = teamInfo?.cover_url || expert.avatar;
  const longBio = teamInfo?.bio || null;

  const projectCount = expert.projects.length;
  const projectWord =
    projectCount === 1 ? "кейс" : projectCount < 5 ? "кейса" : "кейсов";

  return (
    <main className="min-h-screen bg-(--bg) pb-20 md:pb-32">
      {/* ───────── Hero ───────── */}
      <Container variant="full-width" className="pt-4 md:pt-8">
        <div className={CONTENT_MAX}>
          <div className="relative w-full h-[480px] md:h-[600px] rounded-5xl md:rounded-7xl overflow-hidden bg-(--card) border border-(--outline) animate-reveal">
            <Image
              src={heroImage}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover object-center"
              alt={expert.name}
              priority
            />

            {/* Bottom fade for name legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
            {/* Top subtle fade so back button + socials sit on a readable surface */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

            {/* Back to team — top-left glass chip */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30">
              <Button variant="glass" size="icon-medium" shape="round" asChild>
                <Link href="/about" aria-label="Назад к команде">
                  <ArrowLeftIcon className="size-5" />
                </Link>
              </Button>
            </div>

            {/* Socials — top-right, vertical on desktop, horizontal on mobile */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-row md:flex-col gap-2">
              {expert.socials.map((social, key) => (
                <Button
                  key={key}
                  variant="glass"
                  size="icon-medium"
                  shape="round"
                  asChild
                  className="animate-reveal"
                  style={{ animationDelay: `${300 + key * 80}ms` }}
                >
                  <Link href={social.href} target="_blank" rel="noopener noreferrer">
                    {social.icon}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Name + role anchored at the bottom of the hero */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-10">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 animate-reveal delay-200 fill-mode-both">
                <h1 className="text-display-3 md:text-display-1 text-white tracking-tight leading-none">
                  {expert.name}
                </h1>
                {slug === "niyazgim" && (
                  <TatarstanIcon className="size-9 md:size-12 shrink-0 drop-shadow-lg" />
                )}
              </div>
              <p className="text-body-3 md:text-body-1 text-white/70 max-w-2xl leading-snug animate-reveal delay-300 fill-mode-both">
                {expert.role}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ───────── About + Tags ───────── */}
      <Container variant="full-width" className="pt-10 md:pt-14">
        <div
          className={`${CONTENT_MAX} grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-16 items-start`}
        >
          <div className="space-y-4 animate-reveal">
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed">
              {expert.description}
            </p>
            {longBio && (
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed whitespace-pre-line">
                {longBio}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {expert.tags.map((tag, idx) => (
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
        </div>
      </Container>

      {/* ───────── Projects ───────── */}
      <Container variant="full-width" className="pt-16 md:pt-24">
        <div className={CONTENT_MAX}>
          <div className="flex items-baseline justify-between gap-6 mb-8 md:mb-12">
            <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight">
              Проекты
            </h2>
            <span className="text-body-4 text-(--on-bg-low)">
              {projectCount} {projectWord}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expert.projects.map((project, idx) => (
              <ProjectCard key={project.id || idx} project={project} index={idx} />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
