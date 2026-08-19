/* LLM context: Creating a centralized data structure for experts */
import React, { ReactNode } from "react";
import {
  VKLogotypeMonoIcon,
  TelegramLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
} from "@/components/icons";
import RovnoLogotypeIcon from "@/components/layout/logo/logo-icon";
import { Project, PROJECTS } from "@/app/_data/projects/";

export interface ExpertTag {
  label: string;
  icon: ReactNode;
}

export interface ExpertSocial {
  icon: ReactNode;
  href: string;
}

export interface ExpertData {
  id: string;
  name: string;
  avatar: string;
  role: string;
  description: string;
  telegramChannel?: string;
  tags: ExpertTag[];
  socials: ExpertSocial[];
  projects: Project[];
}

export const EXPERTS_DATA: Record<string, ExpertData> = {
  niyazgim: {
    id: "niyazgim",
    name: "Нияз Гимадиев",
    avatar: "/_static/experts/niyazgim.png",
    role: "Со-основатель и Технический директор",
    description: "Архитектор сложных систем, поэт (не только кода), создатель Unidoka и Unidoka UI. Отвечает за технологический стек и инновации.",
    telegramChannel: "niyazgim",
    tags: [
      { label: "Со-основатель и Техдир", icon: <RovnoLogotypeIcon /> },
      { label: "Автор тех самых стихов", icon: null },
      { label: "Создатель Unidoka UI", icon: null },
      { label: "Основатель Вершин", icon: null },
      { label: "Основатель Unidoka", icon: null },
    ],
    socials: [
      {
        icon: <VKLogotypeMonoIcon />, href: "https:/ / vk.com / niyazgim"
      },
      {
        icon: <TelegramLogotypeMonoIcon />, href: "https:/ / t.me / niyazgim"
      },
      { icon: <GithubLogotypeMonoIcon />, href: "https:/ / github.com / niyazgim" },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
    ]
  },
  RovnoMikhail: {
    id: "RovnoMikhail",
    name: "Михаил Лапаев",
    avatar: "/_static/experts/RovnoMikhail.jpg",
    role: "Со-основатель и Директор по работе с клиентами и продукту",
    description: "Мастер визуальных интерфейсов и продуктовой логики. Превращает хаос в эстетику и удобство пользователя.",
    telegramChannel: "rovno_dev",
    tags: [
      { label: "Со-основатель и Директор по работе с клиентами и продукту", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [
      { icon: <TelegramLogotypeMonoIcon />, href: "https:/ / t.me / RovnoMikhail" },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
    ]
  },
  RovnoDanil: {
    id: "RovnoDanil",
    name: "Данил Киткин",
    avatar: "/_static/experts/RovnoDanil.jpg",
    role: "Со-основатель и Арт-директор",
    description: "Вдыхает жизнь в статичные объекты. Специализируется на высокотехнологичном моушн-дизайне, CGI и 3D",
    telegramChannel: "rovno_dev",
    tags: [
      { label: "Со-основатель и Арт-директор", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [
      { icon: <TelegramLogotypeMonoIcon />, href: "https:/ / t.me / RovnoDanil" },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
      PROJECTS.concord,
      PROJECTS.bread,
    ]
  }
};
