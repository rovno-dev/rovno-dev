import { Project } from "@/app/_data/projects";
import Image from "next/image";
import Link from "next/link";
export default function ProjectCard({
  project,
  index,
  categoryMap = {},
}: {
  project: Project;
  index?: number;
  categoryMap?: Record<string, string>;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index ? index * 100 : 100}ms` }}
    >
      <div className="relative h-full flex flex-col overflow-hidden rounded-2xl bg-(--card) border border-(--outline) transition-all duration-300 hover:border-(--primary)/30 hover:shadow-lg hover:shadow-(--primary)/5">
        <div className="relative aspect-[16/9] w-full overflow-hidden shrink-0">
          <Image
            src={project.cover.imageSrc}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-5 md:p-6 flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-body-1 md:text-display-5 font-semibold text-(--on-bg-high) leading-tight">
              {project.title}
            </h3>
            <span className="text-(--on-bg-low) text-xs">↗</span>
          </div>
          {project.category && (
            <p className="text-body-4 text-(--on-bg-medium) font-medium">
              {categoryMap[project.category] || project.category}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
