"use client";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import {
  WorkIcon,
  ArticleIcon,
  DeployedCodeIcon,
  DiamondIcon,
  DesignServicesIcon,
} from "@/components/icons";

const navItems: SidebarItem[] = [
  { label: "Дашборд", href: "", icon: ArticleIcon },
  { label: "Пользователи", href: "/users", icon: WorkIcon },
  { label: "Заявки", href: "/orders", icon: DesignServicesIcon },
  { label: "Клиенты", href: "/clients", icon: DiamondIcon },
  { label: "Проекты", href: "/projects", icon: DeployedCodeIcon },
  { label: "Статьи", href: "/articles", icon: ArticleIcon },
  { label: "Команда", href: "/team", icon: WorkIcon },
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
