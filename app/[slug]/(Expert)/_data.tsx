import { ReactNode } from "react";
import { Project, PROJECTS } from "../(Project)/data";
import { EVENTS, Event } from "./_data";
import { THOUGHTS, Thought } from "./thoughts-data";
import { DAILY_POSTS, DailyPost } from "./daily-data";
import { AWARDS, Award } from "./awards-data";
import {
  DprofileLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
  TelegramLogotypeMonoIcon,
} from "@/components/icons";

export interface ExpertData {
  name: string;
  avatar: string;
  tags: { label: string; icon?: ReactNode }[];
  socials: { href: string; icon: ReactNode }[];
  projects: Project[];
  events: Event[];
  thoughts: Thought[];
  dailyPosts: DailyPost[];
  awards: Award[];
}

export const EXPERTS_DATA: Record<string, ExpertData> = {
  niyazgim: {
    name: "Нияз Гимадиев",
    avatar: "/images/experts/niyazgim.png",
    tags: [
      { label: "Fullstack" },
      { label: "UI/UX" },
      { label: "Open Source" },
    ],
    socials: [
      {
        href: "https://t.me/niyazgim",
        icon: <TelegramLogotypeMonoIcon />,
      },
      {
        href: "https://github.com/niyazgim",
        icon: <GithubLogotypeMonoIcon />,
      },
      {
        href: "https://dprofile.ru/niyazgim",
        icon: <DprofileLogotypeMonoIcon />,
      },
    ],
    projects: [PROJECTS.vanguard, PROJECTS.alx],
    events: EVENTS.niyazgim,
    thoughts: THOUGHTS.niyazgim,
    dailyPosts: DAILY_POSTS.niyazgim,
    awards: AWARDS.niyazgim,
  },
  RovnoMikhail: {
    name: "Михаил Лапаев",
    avatar: "/images/experts/RovnoMikhail.jpg",
    tags: [
      { label: "Product" },
      { label: "Design" },
      { label: "Strategy" },
    ],
    socials: [
      {
        href: "https://t.me/rovno_mikhail",
        icon: <TelegramLogotypeMonoIcon />,
      },
      {
        href: "https://dprofile.ru/rovno_mikhail",
        icon: <DprofileLogotypeMonoIcon />,
      },
    ],
    projects: [PROJECTS.sadovod, PROJECTS.courtElegance],
    events: EVENTS.RovnoMikhail,
    thoughts: THOUGHTS.RovnoMikhail,
    dailyPosts: DAILY_POSTS.RovnoMikhail,
    awards: AWARDS.RovnoMikhail,
  },
  RovnoDanil: {
    name: "Данил Киткин",
    avatar: "/images/experts/RovnoDanil.jpg",
    tags: [
      { label: "Motion" },
      { label: "3D" },
      { label: "CGI" },
    ],
    socials: [
      {
        href: "https://t.me/rovno_danil",
        icon: <TelegramLogotypeMonoIcon />,
      },
      {
        href: "https://dprofile.ru/rovno_danil",
        icon: <DprofileLogotypeMonoIcon />,
      },
    ],
    projects: [PROJECTS.vanguard, PROJECTS.courtElegance],
    events: EVENTS.RovnoDanil,
    thoughts: THOUGHTS.RovnoDanil,
    dailyPosts: DAILY_POSTS.RovnoDanil,
    awards: AWARDS.RovnoDanil,
  },
};
