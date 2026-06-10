"use client";

import React, { useState, useMemo } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/app/[slug]/(Project)/data";
import ProjectCard from "@/components/layout/project-card/project-card";
import PageHeadingSection from "@/components/layout/page/page-heading-section";

export default function ProjectsPage() {
  const projectsList = useMemo(() => Object.values(PROJECTS), []);

  // Extract unique categories from projects
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projectsList.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [projectsList]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!activeCategory) return projectsList;
    return projectsList.filter((p) => p.category === activeCategory);
  }, [activeCategory, projectsList]);

  return (
    <main className="min-h-screen bg-(--bg)">
      <PageHeadingSection title={"Проекты"} description={"Высокопроизводительные цифровые решения. Фокус на архитектуре и метриках."} />
      {/* Filter Bar */}
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
                key={cat}
                variant={activeCategory === cat ? "filled" : "tonal-card"}
                size="chip-large"
                shape="round"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </Container>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 md:pb-32">
        <Container>
          {filteredProjects.length === 0 ? (
            <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
              Нет проектов в этой категории
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {filteredProjects.map((project, idx) => (
                <ProjectCard key={project.id} project={project} index={idx} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
