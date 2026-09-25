"use client";

import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import {
  HandshakeIcon,
  NewspaperIcon,
  CubeIcon,
  BuildingsIcon,
  ReceiptIcon,
  UsersIcon,
  UsersThreeIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";

// Mapping from the previous lucide-ish names:
//   ChartSpline          → ChartLineUpIcon
//   BanknoteArrowDown    → ReceiptIcon
//   BicepsFlexed         → UsersThreeIcon
//   Box (lucide)         → CubeIcon (phosphor)
const NAV: SidebarItem[] = [
  { label: "Дашборд",       href: "",           icon: ChartLineUpIcon, exact: true },
  { label: "Пользователи",  href: "/users",     icon: UsersIcon },
  { label: "Заявки",        href: "/orders",    icon: ReceiptIcon },
  { label: "Компании",      href: "/companies", icon: BuildingsIcon },
  { label: "Клиенты",       href: "/clients",   icon: HandshakeIcon },
  { label: "Проекты",       href: "/projects",  icon: CubeIcon },
  { label: "Статьи",        href: "/articles",  icon: NewspaperIcon },
  { label: "Команда",       href: "/team",      icon: UsersThreeIcon },
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
