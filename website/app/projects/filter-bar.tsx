"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/layout/projects/project-card";
import { Project } from "@/app/_data/projects";
import {
  fetchProjectCategories,
  fetchProjectRoles,
  pickLabel,
  type Taxonomy,
} from "@/utils/api/taxonomies";
import { fetchPublishedProjectsClient } from "@/utils/api/projects";

interface DbProject {
  id: string;
  slug: string;
  title: string;
  short_description?: string | null;
  cover_image_src: string;
  cover_video_src?: string | null;
  category?: { id: string; code: string; label?: string; labels?: Record<string, string> } | null;
  period?: string | null;
}

export function FilterBar({
  projects,
  categories: initialCategories,
  categoryMap: initialCategoryMap,
}: {
  projects: Project[];
  categories: Taxonomy[];
  categoryMap: Record<string, string>;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [categories, setCategories] = useState<Taxonomy[]>(initialCategories);
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>(initialCategoryMap);
  // Populated but currently unused for filtering — reserved for a role filter
  // once project cards surface per-role info.
  const [, setRoles] = useState<Taxonomy[]>([]);

  // Fetch fresh taxonomy so codes added since the last build appear.
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchProjectCategories(), fetchProjectRoles()]).then(
      ([cats, rls]) => {
        if (cancelled) return;
        if (cats.length > 0) {
          setCategories(cats);
          setCategoryMap(
            Object.fromEntries(cats.map((c) => [c.code, c.labels.en || c.label || c.code])),
          );
        }
        setRoles(rls);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch DB projects once.
  useEffect(() => {
    let cancelled = false;
    const existing = new Set(projects.map((p) => p.slug));

    fetchPublishedProjectsClient()
      .then((rows) => {
        if (cancelled) return;
        const mapped: Project[] = (rows as DbProject[])
          .filter((r) => !existing.has(r.slug))
          .map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            description: "",
            shortDescription: r.short_description || "",
            cover: {
              imageSrc: r.cover_image_src,
              videoSrc: r.cover_video_src || undefined,
            },
            href: "",
            category: (r.category?.code || "corporative") as Project["category"],
            clientId: "",
            platform: "",
            period: r.period || "",
            techStack: [],
          }));
        setDbProjects(mapped);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingDb(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projects]);

  const allProjects = useMemo(() => [...projects, ...dbProjects], [projects, dbProjects]);

  const filteredProjects = useMemo(() => {
    if (!activeCategory) return allProjects;
    return allProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory, allProjects]);

  // Counts per category (client-side).
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProjects) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [allProjects]);

  return (
    <>
      {/* Category chips row — sticky so the filter stays reachable while
          scrolling a long grid. */}
      <section className="sticky top-[46px] md:top-[88px] z-30 -mb-2 py-3 backdrop-blur-md bg-(--bg)/85 border-b border-(--outline)">
        <Container>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <Button
              variant={activeCategory === null ? "filled" : "tonal-card"}
              size="chip-medium"
              shape="round"
              onClick={() => setActiveCategory(null)}
              className="shrink-0"
            >
              Все
              <span className="ml-1 text-[10px] opacity-60 tabular-nums">
                {allProjects.length}
              </span>
            </Button>
            {categories.map((cat) => {
              const label = cat.labels.en || cat.label || cat.code;
              const count = categoryCounts[cat.code] || 0;
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.code ? "filled" : "tonal-card"}
                  size="chip-medium"
                  shape="round"
                  onClick={() => setActiveCategory(cat.code)}
                  className="shrink-0"
                >
                  {label}
                  <span className="ml-1 text-[10px] opacity-60 tabular-nums">
                    {count}
                  </span>
                </Button>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="pt-6 pb-24 md:pb-32">
        <Container>
          {filteredProjects.length === 0 && !loadingDb ? (
            <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
              Нет проектов в этой категории
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  index={idx}
                  categoryMap={categoryMap}
                />
              ))}
              {loadingDb &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="relative aspect-[16/9] rounded-2xl border border-(--outline) bg-(--bg-disabled) overflow-hidden"
                  >
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-(--state-hover) to-transparent" />
                  </div>
                ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
