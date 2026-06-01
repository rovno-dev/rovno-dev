/* LLM context: Updating the Dispatcher to pass data from EXPERTS_DATA to the ExpertPage component. */

import ExpertPage from "./(Expert)/expert-page";
// import ProjectsPage from "./(Project)/project-page";
import { PROJECTS } from "./(Project)/data";
import { EXPERTS_DATA } from "./(Expert)/_data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DispatcherPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if it's a project
  // const isProject = projects.some((p) => p.id.toString() === slug);
  // if (isProject) {
  // return <ProjectsPage />;
  // }

  // Check if it's an expert
  const expert = EXPERTS_DATA[slug];
  if (expert) {
    return <ExpertPage expert={expert} />;
  }

  return notFound();
}