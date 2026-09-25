"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import {
  Handshake,
  Newspaper,
  Cube,
  Buildings,
  Receipt,
  Users,
  UsersThree,
  ChartLineUp,
} from "@phosphor-icons/react";

// Mapping from the previous lucide-ish names:
//   ChartSpline          → ChartLineUp
//   BanknoteArrowDown    → Receipt
//   BicepsFlexed         → UsersThree
//   Box (lucide)         → Cube (phosphor)
const NAV: SidebarItem[] = [
  { label: "Дашборд",       href: "",           icon: ChartLineUp, exact: true },
  { label: "Пользователи",  href: "/users",     icon: Users },
  { label: "Заявки",        href: "/orders",    icon: Receipt },
  { label: "Компании",      href: "/companies", icon: Buildings },
  { label: "Клиенты",       href: "/clients",   icon: Handshake },
  { label: "Проекты",       href: "/projects",  icon: Cube },
  { label: "Статьи",        href: "/articles",  icon: Newspaper },
  { label: "Команда",       href: "/team",      icon: UsersThree },
];

export function AdminSidebar() {
  const { secret } = useAdminSecret();
  const basePath = secret ? `/admin/${secret}` : "/admin";

  return (
    <Sidebar
      items={NAV}
      basePath={basePath}
      title="Админ-панель"
      storageKey="admin-sidebar-collapsed"
      className="mb-6"
    />
  );
}
