"use client";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { useLanguage } from "@/providers/language-provider";
import { crossSubdomainUrl } from "@/utils/root-domain";
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
  const { secret, loading } = useAdminSecret();
  const { t } = useLanguage();

  // While the secret is loading, render nothing to avoid flashing
  // path-based links that would 404 on admin.rovno.dev.
  if (loading) return null;

  // Without a secret there is no valid admin route.
  if (!secret) return null;

  const items: SidebarItem[] = [
    { label: t("admin.dashboard"), href: "/", icon: ChartLineUp, exact: true },
    {
      label: t("admin.users"),
      href: "/users",
      icon: Users,
      children: [
        { label: t("admin.team"), href: "/team", icon: UsersThree },
      ],
    },
    {
      label: t("admin.orders"),
      href: "/orders",
      icon: Receipt,
      children: [
        { label: t("admin.companies"), href: "/companies", icon: Buildings },
        { label: t("admin.clients"), href: "/clients", icon: Handshake },
      ],
    },
    {
      label: t("admin.events"),
      href: "/events",
      icon: CalendarBlank,
      children: [
        {
          label: t("admin.event_requests"),
          href: "/event-requests",
          icon: Ticket,
        },
      ],
    },
    { label: t("admin.projects"), href: "/projects", icon: Cube },
    { label: t("admin.catalog"), href: "/catalog", icon: FolderSimple },
    { label: t("admin.articles"), href: "/articles", icon: Newspaper },
  ];

  // crossSubdomainUrl returns:
  //   Prod: https://admin.rovno.dev/<secret>/<href>
  //   Dev:  /admin/<secret>/<href>
  //
  // The <Sidebar> component normally treats `basePath` as a path prefix,
  // but in production the basePath is a full URL. We therefore pass an
  // empty basePath and bake the full URL into each item's href.
  const enrich = (href: string) =>
    crossSubdomainUrl("admin", `/${secret}${href === "/" ? "" : href}`);
  const enriched: SidebarItem[] = items.map((item) => ({
    ...item,
    href: enrich(item.href),
    children: item.children?.map((c) => ({ ...c, href: enrich(c.href) })),
  }));

  return (
    <Sidebar
      items={enriched}
      basePath=""
      title={t("admin.sidebar_title")}
      storageKey="admin-sidebar-collapsed"
      className="mb-6"
    />
  );
}
