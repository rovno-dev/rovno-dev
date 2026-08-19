"use client";
import { useState, useMemo } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/layout/projects/project-card";
import { Project } from "@/app/_data/projects";
import { ProjectCategory } from "@/utils/api/categories";

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

  const filteredProjects = useMemo(() => {
    if (!activeCategory) return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [activeCategory, projects]);

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
          {filteredProjects.length === 0 ? (
            <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
              Нет проектов в этой категории
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project, idx) => (
                <ProjectCard key={project.id} project={project} index={idx} categoryMap={categoryMap} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
