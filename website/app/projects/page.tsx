import { Container } from "@/components/ui/container";
import { getAllProjects } from "@/app/_data/projects/parser";
import PageHeadingSection from "@/components/layout/page/page-heading-section";
import { FilterBar } from "./filter-bar";
import { fetchProjectCategories } from "@/utils/api/categories";

export default async function ProjectsPage() {
  const projects = getAllProjects();
  const categories = await fetchProjectCategories();
  const categoryMap = Object.fromEntries(categories.map(c => [c.code, c.label]));

  return (
    <main className="min-h-screen bg-(--bg)">
      <PageHeadingSection title="Проекты" description="Высокопроизводительные цифровые решения." />
      <FilterBar categories={categories} categoryMap={categoryMap} projects={projects} />
    </main>
  );
}
