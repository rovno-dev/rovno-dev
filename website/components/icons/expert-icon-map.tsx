
import { ReactNode } from "react";
import { Globe } from "@phosphor-icons/react/dist/ssr";
import RovnoLogotypeIcon from "@/components/layout/logo/logo-icon";
import { AmorfaLogo } from "@/components/icons/logotypes/amorfa-logo";
import { VershinyLogo } from "@/components/icons/logotypes/vershiny-logo";
import { UnidokaLogoMono } from "@/components/icons/logotypes/unidoka-logo-mono";
import {
  TelegramLogotypeMonoIcon,
  VKLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
  DprofileLogotypeMonoIcon,
} from "@/components/icons";

// The DB stores an `icon_key` (tags) or `kind` (socials) string, never a
// component or SVG. This file is the single mapping - extend it by adding
// a case + a dropdown entry, no migration required.

export const EXPERT_ICON_OPTIONS: { key: string; label: string }[] = [
  { key: "none", label: "Без иконки" },
  { key: "rovno", label: "Rovno.dev" },
  { key: "amorfa", label: "Amorfa" },
  { key: "vershiny", label: "Вершины" },
  { key: "unidoka", label: "Unidoka" },
];

export function resolveExpertTagIcon(key?: string | null): ReactNode {
  switch (key) {
    case "rovno":
      return <RovnoLogotypeIcon />;
    case "amorfa":
      return <AmorfaLogo />;
    case "vershiny":
      return <VershinyLogo />;
    case "unidoka":
      return <UnidokaLogoMono />;
    default:
      return null;
  }
}

export const EXPERT_SOCIAL_OPTIONS: { key: string; label: string }[] = [
  { key: "telegram", label: "Telegram" },
  { key: "vk", label: "VK" },
  { key: "github", label: "GitHub" },
  { key: "dprofile", label: "Dprofile" },
  { key: "behance", label: "Behance" },
  { key: "website", label: "Сайт" },
];

export function resolveExpertSocialIcon(kind?: string | null): ReactNode {
  switch (kind) {
    case "telegram":
      return <TelegramLogotypeMonoIcon />;
    case "vk":
      return <VKLogotypeMonoIcon />;
    case "github":
      return <GithubLogotypeMonoIcon />;
    case "dprofile":
      return <DprofileLogotypeMonoIcon />;
    default:
      return <Globe />;
  }
}
