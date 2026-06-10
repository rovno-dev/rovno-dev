/* LLM context: Refactoring Dispatcher logic to resolve projects by their internal unique ID instead of record keys. */

import ExpertPage from "./(Expert)/expert-page";
import ProjectPage from "./(Project)/project-page";
import { PROJECTS } from "./(Project)/data";
import { EXPERTS_DATA } from "./(Expert)/_data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DispatcherPage({ params }: PageProps) {
  const { slug } = await params;

  const project = Object.values(PROJECTS).find((p) => p.id === slug);
  if (project) {
    return <ProjectPage project={project} />;
  }

  const expert = EXPERTS_DATA[slug];
  if (expert) {
    return <ExpertPage expert={expert} />;
  }

  return notFound();
}