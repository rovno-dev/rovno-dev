import { Container } from "@/components/ui/container";
import { getAllProjects } from "@/app/_data/projects/parser";
import { PROJECTS } from "@/app/_data/projects";
import { FilterBar } from "./filter-bar";
import { fetchProjectCategories } from "@/utils/api/taxonomies";

export const revalidate = 60;

export default async function ProjectsPage() {
  const mdxProjects = getAllProjects();
  const fallbackProjects = Object.values(PROJECTS);
  const seen = new Set<string>();
  const projects = [...mdxProjects, ...fallbackProjects].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  let categories: Awaited<ReturnType<typeof fetchProjectCategories>> = [];
  try {
    categories = await fetchProjectCategories();
  } catch {
    /* backend unreachable — client refetch will populate */
  }

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
        categories={categories}
        categoryMap={categoryMap}
        projects={projects as any}
      />
    </main>
  );
}
