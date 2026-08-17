"use client";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import {
  WorkIcon,
  ArticleIcon,
  DeployedCodeIcon,
  DiamondIcon,
  DesignServicesIcon,
  PersonIcon,
  SettingsIcon,
} from "@/components/icons";

const navItems: SidebarItem[] = [
  { label: "Дашборд", href: "", icon: ArticleIcon },
  { label: "Пользователи", href: "/users", icon: PersonIcon },
  { label: "Заявки", href: "/orders", icon: DesignServicesIcon },
  { label: "Компании", href: "/companies", icon: DiamondIcon },
  { label: "Клиенты", href: "/clients", icon: WorkIcon },
  { label: "Проекты", href: "/projects", icon: DeployedCodeIcon },
  { label: "Статьи", href: "/articles", icon: ArticleIcon },
  { label: "Команда", href: "/team", icon: SettingsIcon },
];

export function AdminSidebar({ secret }: { secret: string }) {
  return (
    <Sidebar
      items={navItems}
      basePath={`/admin/${secret}`}
      title="Админ-панель"
      className="mb-6"
    />
  );
}
