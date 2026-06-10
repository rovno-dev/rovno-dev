import { Container } from "@/components/ui/container";
import { PROJECTS } from "../[slug]/(Project)/data";
import ProjectCard from "@/components/layout/project-card/project-card";
import { Button } from "@/components/ui/button";
import Link from 'next/link'
import { KeyboardArrowRightIcon } from "@/components/icons";

export default function BestWorksSection() {
  return (
    <section className="py-8 md:py-10">
      <Container>
        <h2 className="mb-8 text-display-2 md:text-display-2 text-(--on-bg-high) tracking-tight">ИЗБРАННЫЕ ПРОЕКТЫ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {[PROJECTS.alx, PROJECTS.sadovod, PROJECTS.vanguard, PROJECTS.courtElegance].map((project, idx) => (
            <ProjectCard key={idx} project={project} index={idx} />
          ))}
        </div>
        <Button className="w-full md:w-fit mt-8" variant="glass" size="large" asChild>
          <Link href="https://dprofile.ru/rovno_dev">
            Все проекты
            <KeyboardArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </Container>
    </section>
  );
}