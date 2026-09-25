import { Container } from "@/components/ui/container";
import { getAllProjects } from "@/app/_data/projects/parser";
import { PROJECTS } from "@/app/_data/projects";
import PageHeadingSection from "@/components/layout/page/page-heading-section";
import { FilterBar } from "./filter-bar";
import { PROJECT_CATEGORIES } from "@/app/_data/categories";

// Static projects are on disk — they render on the server in one pass. The
// DB-backed projects are appended on the client by <FilterBar> after mount.
// This avoids the server-side fetch, which fails in local dev because the
// Next.js process can't resolve the public API URL the browser uses.
export const revalidate = 60;

export default function ProjectsPage() {
  const mdxProjects = getAllProjects();
  const fallbackProjects = Object.values(PROJECTS);

  const seen = new Set<string>();
  const projects = [...mdxProjects, ...fallbackProjects].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });

  const categories = PROJECT_CATEGORIES.map((c) => ({
    id: c.code,
    code: c.code,
    label: c.label,
  }));
  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.code, c.label]),
  );

  return (
    <main className="min-h-screen bg-(--bg)">
      <PageHeadingSection
        title="Проекты"
        description="Высокопроизводительные цифровые решения."
      />
      <FilterBar
        categories={categories}
        categoryMap={categoryMap}
        projects={projects as any}
      />
    </main>
  );
}
