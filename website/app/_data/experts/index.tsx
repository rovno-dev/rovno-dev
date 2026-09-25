import React, { ReactNode } from "react";
import {
  VKLogotypeMonoIcon,
  TelegramLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
} from "@/components/icons";
import RovnoLogotypeIcon from "@/components/layout/logo/logo-icon";
import { Project, PROJECTS } from "@/app/_data/projects/";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";
import { UnidokaLogoMono } from "@/components/icons/logotypes/unidoka-logo-mono";

export interface ExpertTag {
  label: string;
  icon: ReactNode;
}

export interface ExpertSocial {
  icon: ReactNode;
  href: string;
}

/** A short line in the career/timeline block on the expert page. */
export interface ExpertMilestone {
  year: string;
  title: string;
  body: string;
}

/** A single skill chip with a proficiency read. `level` is 0-100. */
export interface ExpertSkill {
  label: string;
  level: number;
}

export interface ExpertStat {
  value: string;
  label: string;
}

export interface ExpertData {
  id: string;
  name: string;
  avatar: string;
  /** Optional wide cover for the hero background. Falls back to avatar. */
  cover?: string;
  role: string;
  description: string;
  /** Long-form bio shown below the hero. 2-4 short paragraphs. */
  longBio?: string[];
  telegramChannel?: string;
  location?: string;
  tags: ExpertTag[];
  socials: ExpertSocial[];
  /** Aggregate numbers, shown as a strip under the hero. */
  stats?: ExpertStat[];
  /** What this person actually does, weighted for the bar chart. */
  skills?: ExpertSkill[];
  /** Career timeline, newest first. */
  milestones?: ExpertMilestone[];
  /** Hardcoded fallback projects. Merged with the DB list at render time. */
  projects: Project[];
}

export const EXPERTS_DATA: Record<string, ExpertData> = {
  niyazgim: {
    id: "niyazgim",
    name: "Нияз Гимадиев",
    avatar: "/static-images/experts/niyazgim.png",
    cover: "/static-images/experts/niyazgim.png",
    role: "Со-основатель и Технический директор",
    description:
      "Архитектор сложных систем, поэт (не только кода), создатель Unidoka и Unidoka UI. Отвечает за технологический стек и инновации.",
    longBio: [
      "Проектирую системы, в которых сложность спрятана за простым фасадом — от моделей данных в FastAPI до дизайн-систем, которые выдерживают три года продуктовой итерации.",
      "Верю, что хороший интерфейс — это не украшение, а способ уменьшить количество ошибок пользователя. Всё, что делаю, измеряю: скорость ответа, конверсию, стоимость поддержки.",
    ],
    telegramChannel: "niyazgim",
    location: "Казань",
    tags: [
      { label: "Со-основатель и Техдир", icon: <RovnoLogotypeIcon /> },
      { label: "Автор тех самых стихов", icon: null },
      { label: "Создатель Amorfa", icon: <AmorfaLogo /> },
      { label: "Основатель Вершин", icon: <VershinyLogo /> },
      { label: "Основатель Unidoka", icon: <UnidokaLogoMono /> },
    ],
    socials: [
      { icon: <VKLogotypeMonoIcon />, href: "https://vk.com/niyazgim" },
      { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/niyazgim" },
      { icon: <GithubLogotypeMonoIcon />, href: "https://github.com/niyazgim" },
    ],
    stats: [
      { value: "8+", label: "лет в разработке" },
      { value: "40+", label: "проектов" },
      { value: "3", label: "продукта с нуля" },
    ],
    skills: [
      { label: "Backend (Python, FastAPI)", level: 95 },
      { label: "Frontend (React, Next.js)", level: 85 },
      { label: "Infrastructure / DevOps", level: 80 },
      { label: "Архитектура данных", level: 90 },
      { label: "Design Systems", level: 75 },
    ],
    milestones: [
      {
        year: "2024",
        title: "Rovno.dev — со-основатель",
        body: "Запуск агентства полного цикла. Ответственность за технологический стек, инфраструктуру и продуктовую стратегию.",
      },
      {
        year: "2023",
        title: "Amorfa — автор фреймворка",
        body: "Полностековый шаблон для быстрого запуска продуктовых команд. Открытый исходный код.",
      },
      {
        year: "2021",
        title: "Unidoka — основатель",
        body: "Продуктовая студия с фокусом на внутренние инструменты и дизайн-системы.",
      },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
    ],
  },

  RovnoMikhail: {
    id: "RovnoMikhail",
    name: "Михаил Лапаев",
    avatar: "/static-images/experts/RovnoMikhail.png",
    cover: "/static-images/experts/RovnoMikhail.png",
    role: "Со-основатель и Директор по работе с клиентами и продукту",
    description:
      "Мастер визуальных интерфейсов и продуктовой логики. Превращает хаос в эстетику и удобство пользователя.",
    longBio: [
      "Веду клиентские проекты от брифа до защиты. Помогаю бизнесу сформулировать, что именно болит, прежде чем мы начинаем рисовать.",
      "Внутри команды отвечаю за то, чтобы продуктовые решения были экономически обоснованы — не просто «красиво», а измеримо полезно для клиента.",
    ],
    telegramChannel: "rovno_dev",
    location: "Москва",
    tags: [
      { label: "Со-основатель и Директор по работе с клиентами и продукту", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [
      { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/RovnoMikhail" },
    ],
    stats: [
      { value: "6+", label: "лет в продукте" },
      { value: "30+", label: "клиентов" },
      { value: "12", label: "отраслей" },
    ],
    skills: [
      { label: "Product Management", level: 90 },
      { label: "UX Research", level: 85 },
      { label: "Client Relationships", level: 95 },
      { label: "Analytics", level: 70 },
    ],
    milestones: [
      {
        year: "2024",
        title: "Rovno.dev — со-основатель",
        body: "Отвечает за работу с клиентами и продуктовую стратегию агентства.",
      },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
    ],
  },

  RovnoDanil: {
    id: "RovnoDanil",
    name: "Данил Киткин",
    avatar: "/static-images/experts/RovnoDanil.png",
    cover: "/static-images/experts/RovnoDanil.png",
    role: "Со-основатель и Арт-директор",
    description:
      "Вдыхает жизнь в статичные объекты. Специализируется на высокотехнологичном моушн-дизайне, CGI и 3D",
    longBio: [
      "Собираю 3D-сцены и ролики от раскадровки до финального грейда. Основная работа — превращать продукт в объект, который хочется рассматривать.",
      "Работаю в связке Blender + After Effects + Premiere, но инструменты — вторичны. Главное — найти кадр, который до нас никто не снимал.",
    ],
    telegramChannel: "rovno_dev",
    location: "Казань",
    tags: [
      { label: "Со-основатель и Арт-директор", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [
      { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/RovnoDanil" },
    ],
    stats: [
      { value: "5+", label: "лет в 3D" },
      { value: "20+", label: "роликов" },
      { value: "50+", label: "3D-сцен" },
    ],
    skills: [
      { label: "3D Modeling (Blender)", level: 95 },
      { label: "Motion Design", level: 90 },
      { label: "Art Direction", level: 85 },
      { label: "Color & Grading", level: 80 },
    ],
    milestones: [
      {
        year: "2026",
        title: "Хлебная Страна — промо-ролик",
        body: "Полный цикл: концепт, 3D-сцены, съёмка, монтаж. Победитель отраслевого конкурса.",
      },
      {
        year: "2024",
        title: "ALX-9 — 3D-модель Чужого",
        body: "Разработка концепт-арта и финальной 3D-модели для крупнейшей выставки роботостроения.",
      },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
      PROJECTS.bread,
    ],
  },

  web_senior: {
    id: "web_senior",
    name: "Бессоновский Николай",
    avatar: "/static-images/experts/web_senior.png",
    cover: "/static-images/experts/web_senior.png",
    role: "Senior FullStack/DevSecOps",
    description:
      "Его решения вдохновлены лучшими практиками индустрии. Благодаря нему скорость разработки увеличилась на 40%.",
    longBio: [
      "Строю инфраструктуру, в которой разработка не буксует на рутине. Автоматизация, CI/CD, безопасность — три вещи, которые я закрываю на всех наших проектах.",
    ],
    telegramChannel: "rovno_dev",
    location: "Москва",
    tags: [
      { label: "Senior FullStack/DevSecOps", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [],
    stats: [
      { value: "10+", label: "лет в индустрии" },
      { value: "+40%", label: "скорость разработки" },
      { value: "0", label: "инцидентов за год" },
    ],
    skills: [
      { label: "Backend (Python, Go)", level: 90 },
      { label: "DevOps / Kubernetes", level: 95 },
      { label: "Security", level: 85 },
      { label: "Performance Tuning", level: 90 },
    ],
    milestones: [
      {
        year: "2024",
        title: "Rovno.dev — технологический партнёр",
        body: "Отвечает за инфраструктуру, CI/CD и безопасность всех проектов агентства.",
      },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
      PROJECTS.bread,
    ],
  },
};
