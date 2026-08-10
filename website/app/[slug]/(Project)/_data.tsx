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
  shortDescription?: string;
  tags?: ProjectTagType[];
  cover: string;
  href?: string;
  category?: string;
  clientId: string;
  platform?: string;
  period?: string;
  techStack?: string[];
  metrics?: { label: string; value: string; description: string }[];
  media?: { type: 'image' | 'video'; src: string }[];
}

/* ---------- Project data ---------- */
export const PROJECTS: Record<string, Project> = {
  vanguard: {
    id: "1",
    title: "Vanguard: интернет-магазин электроники",
    description: "Полное переосмысление всего дизайна для интернет-магазина электроники и посты к 8 марта",
    shortDescription: "Редизайн интернет-магазина электроники с ростом конверсии +45%.",
    cover: "/_static/projects/vanguard/vanguard-cover.jpg",
    href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki",
    category: "E-commerce",
    clientId: "1",
    period: "2024",
    techStack: ["Figma", "Adobe Illustrator"],
    metrics: [
      {
        label: "Конверсия",
        value: "+45%",
        description: "рост регистраций",
      },
      {
        label: "Отток",
        value: "-20%",
        description: "снижение отказов",
      },
    ],
    media: [
      {
        type: 'image',
        src: '/_static/projects/vanguard/vanguard-1.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/vanguard/vanguard-2.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/vanguard/vanguard-3.jpg'
      },
    ],
  },
  alx: {
    id: "2",
    title: "Чужой | ALX-9 - ИИ выставка",
    description: "Разработка фирменного стиля и веб-сайта для технологической компании ALX.",
    shortDescription: "Разработка айдентики и веб-сайта для технологической компании ALX.",
    cover: "/_static/projects/alx/alx-cover.png",
    href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
    category: "Айдентика",
    clientId: "2",
    platform: "Веб-сайт",
    period: "2024",
    techStack: ["Figma", "After Effects"],
    metrics: [
      {
        label: "Узнаваемость",
        value: "+60%",
        description: "Ребрендинг помог бренду сильно продвинуться в медиа благодаря качественной анимации от наших 3D-художников",
      },
    ],
    media: [
      {
        type: 'video',
        src: 'https://kinescope.io/wJ6WmWZCkVYZr6yEDvYmLo'
      },
      {
        type: 'image',
        src: '/_static/projects/alx/alx-1.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/alx/alx-2.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/alx/alx-3.jpg'
      }
    ],
  },
  sadovod: {
    id: "3",
    title: "Sadovod - Интернет магазин",
    description: "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом и корзиной.",
    shortDescription: "Интернет-магазин для крупнейшего рынка садовых товаров с удобным каталогом.",
    cover: "/_static/projects/sadovod/sadovod-cover.jpg",
    href: "https://dprofile.ru/case/162985/sadovod-internet-magazin",
    category: "E-commerce",
    clientId: "3",
    period: "2024",
    techStack: ["Figma", "Adobe Illustrator"],
    metrics: [
      {
        label: "Конверсия",
        value: "+35%",
        description: "Увеличение конверсии после редизайна",
      },
    ],
    media: [
      {
        type: 'image',
        src: '/_static/projects/sadovod/sadovod-1.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/sadovod/sadovod-2.jpg'
      },
    ],
  },
  courtElegance: {
    id: "4",
    title: "The Court Elegance - Теннисный клуб",
    description: "Разработка сайта премиального теннисного клуба, расположенного в городе Остин, США, штат Техас.",
    shortDescription: "Сайт премиального теннисного клуба в Техасе, США.",
    cover: "/_static/projects/tennis-cover.jpg",
    href: "https://dprofile.ru/case/160100/the-court-elegance-tennisnyi-klub",
    category: "E-commerce",
    clientId: "4",
    period: "2025",
    techStack: ["Figma", "Wix"],
  },
  bread: {
    id: "5",
    title: "Хлебная Страна - Промо-ролик",
    description: "Разработка айдентики для продуктов серии Хлебная Страна от БКК",
    shortDescription: "Айдентика и промо-ролик для продуктовой серии «Хлебная Страна».",
    cover: "/_static/projects/bread/bread-cover.jpg",
    href: "https://dprofile.ru/case/168046/xlebnaia-strana-promo-rolik",
    category: "Айдентика",
    clientId: "5",
    period: "2026",
    techStack: ["Figma", "Blender", "Adobe After Effects", "Adobe Premier Pro", "Crita"],
    media: [
      {
        type: 'video',
        src: 'https://kinescope.io/aeKrj7KerGCQnPo7rPo22t'
      },
      {
        type: 'image',
        src: '/_static/projects/bread/bread-1.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/bread/bread-2.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/bread/bread-3.jpg'
      },
    ],
  },
  concord: {
    id: "6",
    title: "Concord Construction - Строительная компания",
    description: "Разработка дизайна сайта и айдентики для строительной компании",
    shortDescription: "Дизайн сайта и айдентика для строительной компании Concord Construction.",
    cover: "/_static/projects/concord/concord-cover.jpg",
    href: "https://dprofile.ru/case/185165/concord-construction-stroitelnaia-kompaniia",
    category: "Корпоративные сайты",
    clientId: "6",
    period: "2025",
    techStack: ["Figma", "Adobe Illustrator", "Blender"],
    metrics: [
      {
        label: "Расходы на СММ",
        value: "-35%",
        description: "Благодаря простому дизайну удалось повысить узнаваемость среди конкурентов и сократить создание постов до 5 часов в неделю",
      },
      {
        label: "Конверсия",
        value: "+15%",
        description: "Повышенная узнаваемость позволила увеличить количество заявок на работы",
      },
      {
        label: "Экономия на мерче",
        value: "75%",
        description: "Простой дизайн позволяет выпускать простые и очень яркие элементы фирменной экипировки что критично в больших масштабах строительной области",
      },
    ],
    media: [
      {
        type: 'video',
        src: 'https://kinescope.io/jpn627TNuBgbK3gJ7dsMqP'
      },
      {
        type: 'image',
        src: '/_static/projects/concord/concord-1.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/concord/concord-2.jpg'
      },
      {
        type: 'image',
        src: '/_static/projects/concord/concord-3.jpg'
      },
    ],
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
