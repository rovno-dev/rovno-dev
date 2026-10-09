"use client";

import { Container } from "@/components/ui/container";
import ProjectCard from "@/components/layout/projects/project-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useLanguage } from "@/providers/language-provider";
import { dbRowToProject, type DbProjectList } from "@/utils/api/projects";
import type { Project } from "@/app/_data/projects";

/**
 * Featured projects on the home page. Data comes down as a prop from the
 * RSC home route, which fetches published projects from the database once
 * per ISR window.
 *
 * Selection: only rows with `is_featured: true`. The grid is a mirror
 * of what an admin flagged in the project editor — no fill from recent
 * rows. Zero featured projects renders the empty state below.
 */
export default function BestWorksSection({
  projects,
}: {
  projects: DbProjectList[];
}) {
  const { t } = useLanguage();

  // Featured-only: the home section shows exactly the rows an admin has
  // flagged `is_featured`. No fill-from-recent fallback — an empty list
  // is a valid, meaningful state that surfaces the empty card below.
  const picked = projects.filter((p) => p.is_featured);
  const cards: Project[] = picked.map(dbRowToProject);

  return (
    <section className="py-8 md:py-10">
      <Container>
        <h2 className="text-display-2 sm:text-display-1 mb-10 text-center">
          {t("home.best_works_title")}
        </h2>

        {cards.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-(--outline)">
            <p className="text-body-3 text-(--on-bg-medium) mb-2">
              {t("projects.empty_home")}
            </p>
            <p className="text-body-5 text-(--on-bg-low)">
              {t("projects.empty_home_hint")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((project, idx) => (
              <ProjectCard
                key={project.id || project.slug}
                project={project}
                index={idx}
                tags={(project.tags || [])
                  .map((tg) => tg.title)
                  .filter((v): v is string => !!v)
                  .map((label, i) => ({
                    id: `${project.slug}-tag-${i}`,
                    label,
                  }))}
              />
            ))}
          </div>
        )}

        <Button
          className="w-full md:w-fit mt-8"
          variant="glass"
          size="large"
          asChild
        >
          <Link href="/projects">
            {t("home.view_all_projects")}
            <CaretRightIcon className="size-4" />
          </Link>
        </Button>
      </Container>
    </section>
  );
}
