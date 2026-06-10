import { ReactNode } from "react";

export interface RouteLinkProps {
  id?: string,
  href: string,
  title?: string | ReactNode,
}

export const ROUTES = {
  home: {
    id: 'home',
    href: "/",
    title: 'Главная',
  },
  projects: {
    id: 'projects',
    href: "/projects",
    title: 'Проекты'
  },
  dprofileProjects: {
    id: 'dprofileProjects',
    href: "https://dprofile.ru/rovno_dev",
    title: 'Проекты на Dprofile'
  },
  about: {
    id: 'about',
    href: "/about",
    title: 'О нас',
  },
  journal: {
    id: 'journal',
    href: "https://t.me/rovno_dev",
    title: "Журнал Ровня",
  },
  blog: {
    id: 'blog',
    href: "/blog",
    title: 'Блог',
  },
  job: {
    id: 'job',
    href: "/job",
    title: "Вакансии",
  },
  "fake-api": {
    id: 'fake-api',
    href: "fake-api.localhost:3000",
    title: "Фейк АПИ",
  },
}
