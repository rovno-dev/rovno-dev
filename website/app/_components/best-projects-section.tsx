import { Container } from "@/components/ui/container";
import { PROJECTS } from "@/app/_data/projects";
import ProjectCard from "@/components/layout/projects/project-card";
import { Button } from "@/components/ui/button";
import Link from 'next/link'
import { ChevronRight } from "lucide-react";

export default function BestWorksSection() {
  return (
    <section className="py-8 md:py-10">
      <Container>
        <h2 className="text-display-2 sm:text-display-1 mb-10 text-center">
          Избранные проекты
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[PROJECTS.alx, PROJECTS.sadovod, PROJECTS.vanguard, PROJECTS.courtElegance, PROJECTS.bread, PROJECTS.concord].map((project, idx) => (
            <ProjectCard key={idx} project={project} index={idx} />
          ))}
        </div>
        <Button className="w-full md:w-fit mt-8" variant="glass" size="large" asChild>
          <Link href="/projects">
            Все проекты
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </Container>
    </section>
  );
}
