"use client";

import React, { useState, useMemo } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/app/[slug]/(Project)/data";
import { ProjectCard } from "@/app/[slug]/(Expert)/expert-page";

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
      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-(--outline)">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-4">
              Проекты
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
              Высокопроизводительные цифровые решения. Фокус на архитектуре и метриках.
            </p>
          </div>
        </Container>
      </section>

      {/* Filter Bar */}
      <section className="py-6 md:py-8">
        <Container>
          <div className="flex flex-wrap gap-2 animate-reveal delay-100 fill-mode-both">
            <Button
              variant={activeCategory === null ? "filled" : "tonal-card"}
              size="chip-medium"
              shape="round"
              onClick={() => setActiveCategory(null)}
            >
              Все
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "filled" : "tonal-card"}
                size="chip-medium"
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
      <section className="py-8 md:py-16">
        <Container>
          {filteredProjects.length === 0 ? (
            <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
              Нет проектов в этой категории
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
