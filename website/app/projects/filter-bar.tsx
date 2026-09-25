"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/layout/projects/project-card";
import { Project } from "@/app/_data/projects";
import { ProjectCategory } from "@/utils/api/categories";
import { fetchPublishedProjectsClient } from "@/utils/api/projects";

/** Shape returned by GET /api/v1/projects — see DbProjectList in utils/api. */
interface DbProject {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  category?: { id: string; code: string; label: string } | null;
  period?: string | null;
}

export function FilterBar({
  projects,
  categories,
  categoryMap,
}: {
  projects: Project[];
  categories: ProjectCategory[];
  categoryMap: Record<string, string>;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fetch admin-created projects on mount. Static projects render
  // immediately; these append when the request lands.
  useEffect(() => {
    let cancelled = false;
    const existing = new Set(projects.map((p) => p.slug));

    fetchPublishedProjectsClient()
      .then((rows) => {
        if (cancelled) return;
        const mapped: Project[] = (rows as DbProject[])
          .filter((r) => !existing.has(r.slug))
          .map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            description: "",
            shortDescription: r.short_description || "",
            cover: {
              imageSrc: r.cover_image_src,
              videoSrc: r.cover_video_src || undefined,
            },
            href: "",
            category: (r.category?.code || "corporative") as Project["category"],
            clientId: "",
            platform: "",
            period: r.period || "",
            techStack: [],
          }));
        setDbProjects(mapped);
      })
      .catch(() => {
        // Silent: the static projects still render.
      })
      .finally(() => {
        if (!cancelled) setLoadingDb(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projects]);

  const allProjects = useMemo(
    () => [...projects, ...dbProjects],
    [projects, dbProjects],
  );

  const filteredProjects = useMemo(() => {
    if (!activeCategory) return allProjects;
    return allProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory, allProjects]);

  return (
    <>
      <section className="pb-8">
        <Container>
          <div className="flex flex-wrap gap-2 animate-reveal delay-100 fill-mode-both">
            <Button
              variant={activeCategory === null ? "filled" : "tonal-card"}
              size="chip-large"
              shape="round"
              onClick={() => setActiveCategory(null)}
            >
              Все
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.code}
                variant={activeCategory === cat.code ? "filled" : "tonal-card"}
                size="chip-large"
                shape="round"
                onClick={() => setActiveCategory(cat.code)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          {filteredProjects.length === 0 && !loadingDb ? (
            <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
              Нет проектов в этой категории
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  index={idx}
                  categoryMap={categoryMap}
                />
              ))}
              {/* Placeholder tiles for the in-flight DB fetch. Keeps the grid
                  from reflowing when the response lands. */}
              {loadingDb &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="relative aspect-[16/9] rounded-2xl border border-(--outline) bg-(--bg-disabled) overflow-hidden"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
                  </div>
                ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
