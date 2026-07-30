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
      <Card className="relative overflow-hidden rounded-3xl bg-card aspect-4/3! transition-all active:scale-[0.98]">
        <Image
          fill
          src={project.image}
          alt={project.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Enhanced gradient overlay for ultimate contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
          <h3 className="text-display-3 md:text-display-2 text-white leading-tight max-w-[90%] drop-shadow-lg transition-transform group-hover:-translate-y-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="mt-2 text-body-2 md:text-body-1 text-white/80 leading-relaxed max-w-[90%] drop-shadow-md line-clamp-3 transition-transform group-hover:-translate-y-1">
              {project.description}
            </p>
          )}
        </div>
      </Card>
    </a>
  );
}
