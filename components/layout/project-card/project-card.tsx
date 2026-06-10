import { Project } from "@/app/[slug]/(Project)/data";
import { Card } from "@/components/ui/card";
import Image from "next/image"

export default function ProjectCard({ project, index }: { project: Project, index?: number }) {
  return (
    <a
      href={`/${project.id}`}
      rel="noopener noreferrer"
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${index ? index : 1 * 100}ms` }}
    >
      <Card className="relative overflow-hidden rounded-2xl border border-(--outline) aspect-4/3! bg-card ring-0 transition-all active:scale-[0.99]">
        <Image
          fill
          src={project.image}
          alt={project.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-transparent to-transparent flex flex-col justify-end p-3 md:p-5">
          <h3 className="text-display-4 md:text-display-2 text-[var(--on-bg-high)] leading-tight max-w-[90%] transition-transform group-hover:-translate-y-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="mt-4 text-body-3 md:text-body-2 text-(--on-bg-high) leading-tight max-w-[90%] transition-transform group-hover:-translate-y-1">
              {project.description}
            </p>
          )}
        </div>
      </Card>
    </a>
  );
}