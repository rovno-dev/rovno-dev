import { Container } from "@/components/ui/container";
import { getAllProjects } from "@/app/_data/projects/parser";
import { PROJECTS } from "@/app/_data/projects";
import PageHeadingSection from "@/components/layout/page/page-heading-section";
import { FilterBar } from "./filter-bar";
import { fetchProjectCategories } from "@/utils/api/categories";
export default async function ProjectsPage() {
  // 1. Projects from MDX files in _data/projects/content/
  const mdxProjects = getAllProjects();
  // 2. Fallback projects from _data/projects/index.tsx (PROJECTS object)
  const fallbackProjects = Object.values(PROJECTS);
  // Merge, dedupe by slug (MDX version takes priority)
  const seen = new Set<string>();
  const projects = [...mdxProjects, ...fallbackProjects].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  const categories = await fetchProjectCategories();
  const categoryMap = Object.fromEntries(categories.map(c => [c.code, c.label]));
  return (
    <main className="min-h-screen bg-(--bg)">
      <PageHeadingSection title="Проекты" description="Высокопроизводительные цифровые решения." />
      <FilterBar categories={categories} categoryMap={categoryMap} projects={projects as any} />
    </main>
  );
}
