"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyboardArrowRightIcon } from "@/components/icons";
import { PROJECTS } from "../(slug)/(Project)/data";
import type { Project } from "../(slug)/(Project)/data";

const projectsList = Object.values(PROJECTS);

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <a
      href={project.href || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <Card className="relative overflow-hidden rounded-4xl border border-(--outline) bg-card ring-0 transition-all active:scale-[0.99] aspect-[600/450]">
        <Image
          fill
          src={project.image}
          alt={project.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
          {project.category && (
            <Badge
              variant="glass-static"
              size="chip-small"
              className="text-white border-white/20 mb-2 w-fit"
            >
              {project.category}
            </Badge>
          )}
          <h3 className="text-display-3 md:text-display-2 text-white leading-tight max-w-[90%] transition-transform group-hover:-translate-y-1">
            {project.title}
          </h3>
        </div>
        {/* Arrow button */}
        <div className="absolute bottom-6 right-6 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="icon-small"
            shape="round"
            className="bg-white text-black hover:bg-white"
          >
            <KeyboardArrowRightIcon className="size-5!" />
          </Button>
        </div>
      </Card>
    </a>
  );
}

export default function ProjectsPage() {
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

      {/* Projects Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectsList.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
