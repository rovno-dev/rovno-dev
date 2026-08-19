"use client";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import {
  BriefcaseBusiness,
  Newspaper,
  Box,
  Gem,
  Paintbrush,
  User,
  SettingsIcon,
  ChartSpline,
} from "lucide-react";

const navItems: SidebarItem[] = [
  { label: "Дашборд", href: "", icon: ChartSpline },
  { label: "Пользователи", href: "/users", icon: User },
  { label: "Заявки", href: "/orders", icon: Paintbrush },
  { label: "Компании", href: "/companies", icon: Gem },
  { label: "Клиенты", href: "/clients", icon: BriefcaseBusiness },
  { label: "Проекты", href: "/projects", icon: Box },
  { label: "Статьи", href: "/articles", icon: Newspaper },
  { label: "Команда", href: "/team", icon: SettingsIcon },
];

export function AdminSidebar({ secret }: { secret: string }) {
  const { secret: adminSecret, loading: adminSecretLoading } = useAdminSecret();
  return (
    <Sidebar
      items={navItems}
      basePath={`/admin/${adminSecret}`}
      title="Админ-панель"
      className="mb-6"
    />
  );
}
