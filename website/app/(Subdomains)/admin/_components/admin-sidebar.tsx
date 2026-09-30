"use client";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useLanguage } from "@/providers/language-provider";
import {
  Handshake,
  Newspaper,
  Cube,
  Buildings,
  Receipt,
  Users,
  UsersThree,
  ChartLineUp,
  FolderSimple,
  CalendarBlank,
  Ticket,
} from "@phosphor-icons/react";

export function AdminSidebar() {
  const { secret } = useAdminSecret();
  const { t } = useLanguage();

  const NAV: SidebarItem[] = [
    { label: t("admin.dashboard"), href: "", icon: ChartLineUp, exact: true },
    { label: t("admin.users"), href: "/users", icon: Users },
    { label: t("admin.orders"), href: "/orders", icon: Receipt },
    { label: t("admin.companies"), href: "/companies", icon: Buildings },
    { label: t("admin.clients"), href: "/clients", icon: Handshake },
    { label: t("admin.projects"), href: "/projects", icon: Cube },
    { label: t("admin.articles"), href: "/articles", icon: Newspaper },
    { label: t("admin.team"), href: "/team", icon: UsersThree },
    { label: t("admin.events"), href: "/events", icon: CalendarBlank },
    { label: t("admin.event_requests"), href: "/event-requests", icon: Ticket },
    { label: t("admin.catalog"), href: "/catalog", icon: FolderSimple },
  ];

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
