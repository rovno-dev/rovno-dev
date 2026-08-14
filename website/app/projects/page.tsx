import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getAllProjects } from "@/app/_data/projects/parser";
import ProjectCard from "@/components/layout/project-card/project-card";
import PageHeadingSection from "@/components/layout/page/page-heading-section";
import { FilterBar } from "./filter-bar";

export default async function ProjectsPage() {
  const projects = getAllProjects();
  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  ).sort() as string[];

  return (
    <main className="min-h-screen bg-(--bg)">
      <PageHeadingSection title="Проекты" description="Высокопроизводительные цифровые решения. Фокус на архитектуре и метриках." />
      <FilterBar categories={categories} projects={projects} />
    </main>
  );
}
