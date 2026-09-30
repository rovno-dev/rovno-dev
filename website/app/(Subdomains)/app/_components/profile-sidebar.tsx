"use client";
import { useRouter } from "next/navigation";
import { Sidebar, type SidebarItem } from "@/components/layout/nav/sidebar";
import { useUser } from "@/entities/user/model/user-context";
import { useLanguage } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import {
  SignOutIcon,
  UserIcon,
  GearIcon,
  BriefcaseIcon,
  NewspaperIcon,
} from "@phosphor-icons/react";

export function ProfileSidebar() {
  const router = useRouter();
  const { logout } = useUser();
  const { t } = useLanguage();

  const NAV_ITEMS: SidebarItem[] = [
    {
      label: t("profile.profile"),
      href: "/profile",
      icon: UserIcon,
      exact: true,
    },
    {
      label: t("profile.articles"),
      href: "/profile/articles",
      icon: NewspaperIcon,
    },
    {
      label: t("profile.settings"),
      href: "/profile/settings",
      icon: GearIcon,
      exact: true,
    },
    {
      label: t("profile.security"),
      href: "/profile/security",
      icon: BriefcaseIcon,
      exact: true,
    },
  ];

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
          <SignOutIcon className="size-5 shrink-0" />
          <span className="text-sm">Выйти</span>
        </Button>
      }
    />
  );
}
