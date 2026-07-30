import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyboardArrowRightIcon } from "@/components/icons";
import ProjectCard from "@/components/layout/project-card/project-card";
import { CLIENTS, Client } from "@/app/clients/_data";

/* ---------- Project type ---------- */
export type ProjectTagType = {
  title: string,
  href?: string,
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  tags?: ProjectTagType[];
  image: string;
  href?: string;
  category?: string;
  clientId: string;          // replaced client string with clientId
  platform?: string;
  period?: string;
  techStack?: string[];
  metrics?: { label: string; value: string; description: string }[];
}

/* ---------- Project data ---------- */
export const PROJECTS: Record<string, Project> = {
  alx: {
    id: "1",
    title: "ALX",
    description:
      "Разработка фирменного стиля и веб-сайта для технологической компании ALX.",
    image: "/_static/projects/alx.png",
    href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
    category: "Айдентика",
    clientId: "alx",
    platform: "Веб-сайт",
    period: "2024",
    techStack: ["Figma", "After Effects"],
    metrics: [
      {
        label: "Узнаваемость",
        value: "+60%",
        description: "Рост узнаваемости бренда после ребрендинга",
      },
    ],
  },
  sadovod: {
    id: "2",
    title: "Садовод",
    description:
      "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом и корзиной.",
    image: "/_static/projects/sadovod.png",
    href: "https://dprofile.ru/case/162985/sadovod-internet-magazin",
    category: "E-commerce",
    clientId: "sadovod",
    platform: "Веб-сайт",
    period: "2024",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    metrics: [
      {
        label: "Конверсия",
        value: "+35%",
        description: "Увеличение конверсии после редизайна",
      },
    ],
  },
  vanguard: {
    id: '3',
    title: "Vanguard",
    description:
      "Полное переосмысление цифровой экосистемы для ведущего инвестиционного фонда.",
    image: "/_static/projects/vanguard.png",
    href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki",
    category: "Fintech",
    clientId: "vanguard",
    platform: "iOS & Android App",
    period: "2023 - 2024",
    techStack: ["React Native", "TypeScript", "GraphQL", "Node.js", "WebGL"],
    metrics: [
      {
        label: "Конверсия",
        value: "+45%",
        description: "Рост регистраций",
      },
      {
        label: "Отток",
        value: "-20%",
        description: "Снижение отказов",
      },
      {
        label: "Оценка в App Store",
        value: "4.9",
        description: "Средняя оценка пользователей",
      },
    ],
  },
  courtElegance: {
    id: "4",
    title: "Court Elegance",
    description:
      "Разработка сайта премиального теннисного клуба, расположенного в городе Остин, США, штат Техас",
    image: "/_static/projects/court.png",
    href: "https://dprofile.ru/case/160100/the-court-elegance-tennisnyi-klub",
    category: "E-commerce",
    clientId: "courtElegance",
    platform: "Веб-сайт",
    period: "2024",
    techStack: ["Next.js", "TypeScript", "Framer Motion"],
    metrics: [],
  },
};

/* ---------- Page component ---------- */
const projectsList = Object.values(PROJECTS);

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero */}
      <section className="py-16 md:py-24 border-b border-(--outline)">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-4">
              Проекты
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
              Высокопроизводительные цифровые решения. Фокус на архитектуре и метриках.
            </p>
          </div>
        </Container>
      </section>

      {/* Projects Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectsList.map((project, idx) => (
              <ProjectCard key={project.id} project={project} index={idx} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
