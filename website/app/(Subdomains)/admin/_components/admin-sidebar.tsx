"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import {
  Handshake,
  Newspaper,
  Box,
  Building2,
  BanknoteArrowDown,
  Users,
  BicepsFlexed,
  ChartSpline,
} from "lucide-react";

// `href` values are suffixes; the Sidebar prepends `/admin/<secret>`.
const NAV: SidebarItem[] = [
  // The dashboard is the base route itself ("") — mark it exact so it
  // doesn't greedily match every /admin/<secret>/<child> path.
  { label: "Дашборд",       href: "",          icon: ChartSpline,        exact: true },
  { label: "Пользователи",  href: "/users",    icon: Users },
  { label: "Заявки",        href: "/orders",   icon: BanknoteArrowDown },
  { label: "Компании",      href: "/companies",icon: Building2 },
  { label: "Клиенты",       href: "/clients",  icon: Handshake },
  { label: "Проекты",       href: "/projects", icon: Box },
  { label: "Статьи",        href: "/articles", icon: Newspaper },
  { label: "Команда",       href: "/team",     icon: BicepsFlexed },
];

export function AdminSidebar() {
  const { secret } = useAdminSecret();
  // While the secret is loading, fall back to "/admin" so we don't build
  // bare hrefs like "/users" that match no route.
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
