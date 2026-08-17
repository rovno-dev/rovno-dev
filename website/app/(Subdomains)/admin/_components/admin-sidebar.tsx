"use client";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import {
  BriefcaseBusiness,
  Newspaper,
  Box,
  Gem,
  Paintbrush,
  User,
  SettingsIcon,
} from "lucide-react";

const navItems: SidebarItem[] = [
  { label: "Дашборд", href: "", icon: Newspaper },
  { label: "Пользователи", href: "/users", icon: User },
  { label: "Заявки", href: "/orders", icon: Paintbrush },
  { label: "Компании", href: "/companies", icon: Gem },
  { label: "Клиенты", href: "/clients", icon: BriefcaseBusiness },
  { label: "Проекты", href: "/projects", icon: Box },
  { label: "Статьи", href: "/articles", icon: Newspaper },
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
