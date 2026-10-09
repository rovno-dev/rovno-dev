import { Container } from "@/components/ui/container";
import { FilterBar } from "./filter-bar";
import {
  fetchProjectCategories,
  type Taxonomy,
} from "@/utils/api/taxonomies";
import {
  fetchPublishedProjectsServer,
  dbRowToProject,
} from "@/utils/api/projects";

export const revalidate = 60;

export default async function ProjectsPage() {
  // Fetch projects and categories in parallel. Categories fail-soft to
  // an empty list — the filter bar just shows the "Все" chip then.
  const [dbRows, categories] = await Promise.all([
    fetchPublishedProjectsServer(),
    fetchProjectCategories().catch(() => [] as Taxonomy[]),
  ]);

  const projects = dbRows.map(dbRowToProject);

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.code, c.labels.en || c.label || c.code]),
  );

  return (
    <main className="min-h-screen bg-(--bg)">
      <Container>
        {/* Single heading line. No eyebrow, no description. */}
        <h1 className="pt-6 md:pt-8 text-display-4 md:text-display-3 tracking-[-0.02em] leading-none">
          Проекты
        </h1>
      </Container>
      <FilterBar
        projects={projects}
        categories={categories}
        categoryMap={categoryMap}
      />
    </main>
  );
}
