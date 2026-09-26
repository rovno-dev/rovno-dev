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

  // Fetch categories from the DB. If the backend is down, fall back to an
  // empty list — <FilterBar> refetches client-side anyway and will populate.
  let categories: Awaited<ReturnType<typeof fetchProjectCategories>> = [];
  try {
    categories = await fetchProjectCategories();
  } catch {
    /* backend unreachable — client-side fetch will retry */
  }
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.code, c.labels.en || c.label || c.code]),
  );

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Compact hero — the filter chips row below is sticky and takes over
          navigation, so this section only needs to orient the reader. */}
      <section className="pt-8 md:pt-12 pb-4">
        <Container>
          <div className="max-w-[720px]">
            <p className="text-body-5 uppercase tracking-[0.32em] text-(--on-bg-low) mb-3">
              Портфолио
            </p>
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-[-0.02em] leading-[1.05] mb-3">
              Проекты
            </h1>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
              Избранные кейсы агентства — от айдентики до 3D и веб-разработки.
            </p>
          </div>
        </Container>
      </section>

      <FilterBar
        categories={categories}
        categoryMap={categoryMap}
        projects={projects as any}
      />
    </main>
  );
}
