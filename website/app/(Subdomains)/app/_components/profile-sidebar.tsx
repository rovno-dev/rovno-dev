"use client";

import { useRouter } from "next/navigation";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useUser } from "@/entities/user/model/user-context";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  Settings,
  BriefcaseBusiness,
  Newspaper,
} from "lucide-react";

// Profile routes resolve to /app/* (the (Subdomains) folder is a route
// group and contributes nothing to the URL), so basePath is "/app" and
// each item.href is a suffix.
const NAV_ITEMS: SidebarItem[] = [
  { label: "Профиль",      href: "/profile",            icon: User,              exact: true },
  { label: "Статьи",       href: "/profile/articles",   icon: Newspaper },
  { label: "Настройки",    href: "/profile/settings",   icon: Settings,          exact: true },
  { label: "Безопасность", href: "/profile/security",   icon: BriefcaseBusiness, exact: true },
];

export function ProfileSidebar() {
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <Sidebar
      items={NAV_ITEMS}
      basePath="/app"
      title="Личный кабинет"
      storageKey="profile-sidebar-collapsed"
      className="mb-6"
      footer={
        <Button
          variant="text"
          onClick={handleLogout}
          className="w-full justify-start gap-3 p-3"
        >
          <LogOut className="size-5 shrink-0" />
          <span className="text-sm">Выйти</span>
        </Button>
      }
    />
  );
}
