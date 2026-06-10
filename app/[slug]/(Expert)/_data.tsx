/* LLM context: Creating a centralized data structure for experts and updating the dispatcher/expert page to be fully dynamic based on the slug. */

import React, { ReactNode } from "react";
import {
  VKLogotypeMonoIcon,
  TelegramLogotypeMonoIcon,
  DiamondIcon
} from "@/components/icons";
import RovnoLogotypeIcon from "@/components/layout/rovno-dev-logotype/rovno-dev-logotype-icon";
import { Project, PROJECTS } from "@/app/[slug]/(Project)/data"
import { GithubLogotypeMonoIcon } from "@/components/icons/logotypes/github-logotype-mono-icon";
// Note: PROJECTS is now defined in the same directory's data.tsx

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
  telegramChannel?: string;
  tags: ExpertTag[];
  socials: ExpertSocial[];
  projects: Project[];
}

export const EXPERTS_DATA: Record<string, ExpertData> = {
  niyazgim: {
    id: "niyazgim",
    name: "Нияз Гимадиев",
    avatar: "/images/experts/niyazgim.png",
    telegramChannel: "niyazgim",
    tags: [
      { label: "Со-основатель и Техдир", icon: <RovnoLogotypeIcon /> },
      { label: "Автор тех самых стихов", icon: null },
      { label: "Создатель Unideka UI", icon: null },
      { label: "Основатель Вершин", icon: null },
    ],
    socials: [
      {
        icon: <VKLogotypeMonoIcon />, href: "https://vk.com/niyazgim"
      },
      { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/niyazgim" },
      { icon: <GithubLogotypeMonoIcon />, href: "https://github.com/niyazgim" },
    ],
    projects: [PROJECTS.alx, PROJECTS.sadovod, PROJECTS.vanguard, PROJECTS.courtElegance]
  },
  RovnoMikhail: {
    id: "RovnoMikhail",
    name: "Михаил Лапаев",
    avatar: "/images/experts/RovnoMikhail.jpg", // Replace with actual
    telegramChannel: "rovno_dev",
    tags: [
      { label: "Со-основатель и Директор по работе с клиентами и продукту", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [
      { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/RovnoMikhail" },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
    ]
  },
  RovnoDanil: {
    id: "RovnoDanil",
    name: "Данил Киткин",
    avatar: "/images/experts/RovnoDanil.jpg",
    telegramChannel: "rovno_dev",
    tags: [
      { label: "Со-основатель и Арт-директор", icon: <RovnoLogotypeIcon /> },
    ],
    socials: [
      { icon: <TelegramLogotypeMonoIcon />, href: "https://t.me/RovnoDanil" },
    ],
    projects: [
      PROJECTS.alx,
      PROJECTS.sadovod,
      PROJECTS.vanguard,
      PROJECTS.courtElegance,
    ]
  }
};
