"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import {
  UserIcon,
  SettingsIcon,
  WorkIcon
} from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems: SidebarItem[] = [
  { label: "Профиль", href: "", icon: UserIcon },
  { label: "Настройки", href: "/settings", icon: SettingsIcon },
  { label: "Безопасность", href: "/security", icon: WorkIcon }, // Using WorkIcon as shield placeholder
  { label: "Выйти", href: "/logout", icon: WorkIcon },
];

export default function ProfilePage() {
  const { user, isLoading, logout } = useUser();
  const router = useRouter();

  if (isLoading || !user) return null;

  return (
    <CheckUser>
      <div className="min-h-screen bg-(--bg) py-12 md:py-16">
        <Container>
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar - Floating Island */}
            <div className="w-full md:w-64 shrink-0">
              <Sidebar
                items={navItems}
                basePath="/profile"
                title="Личный кабинет"
                footer={
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="size-10 border border-(--outline)">
                      <AvatarFallback className="bg-(--primary-card) text-(--primary) font-bold">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {user.name || user.email}
                      </span>
                      <span className="text-xs text-(--on-bg-low)">Аккаунт</span>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Right Main Content */}
            <main className="flex-1 space-y-6">
              <div className="mb-6">
                <h1 className="text-display-2 font-serif italic tracking-tight mb-2">
                  Профиль
                </h1>
                <p className="text-body-2 text-(--on-bg-medium)">
                  Управление личными данными
                </p>
              </div>

              {/* User Info Card */}
              <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                  <Avatar className="size-16 border border-(--outline)">
                    <AvatarFallback className="bg-(--primary-glass) text-(--primary) text-2xl font-medium">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-[150px]">
                    <p className="text-body-1 font-medium text-(--on-bg-high) break-all">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="tonal-primary-static" size="chip-small">
                      Пользователь
                    </Badge>
                    {user.verified ? (
                      <Badge variant="tonal-static" size="chip-small" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Подтверждён
                      </Badge>
                    ) : (
                      <Badge variant={'outline'} size="chip-small" className="border-yellow-500 text-yellow-700">
                        Не подтверждён
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>

              {/* Statistics Card */}
              <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-heading-4">Краткая статистика</CardTitle>
                </CardHeader>
                <CardContent className="p-0 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm uppercase tracking-wider text-(--on-bg-low) font-semibold">
                      Проектов
                    </p>
                    <p className="text-display-1 font-bold text-(--on-bg-high) mt-1">0</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wider text-(--on-bg-low) font-semibold">
                      Заказов
                    </p>
                    <p className="text-display-1 font-bold text-(--on-bg-high) mt-1">0</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              {/* <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-heading-4">Действия</CardTitle>
                </CardHeader>
              </Card> */}
            </main>
          </div>
        </Container>
      </div>
    </CheckUser>
  );
}
