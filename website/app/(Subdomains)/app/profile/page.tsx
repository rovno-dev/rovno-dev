"use client";
import { useUser } from "@/entities/user/model/user-context";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckUser } from "@/entities/user/model/check-user";
import { ProfileSidebar } from "../_components/profile-sidebar";
import { DiamondIcon } from "@/components/icons";

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading || !user) return null;

  return (
    <CheckUser>
      <div className="min-h-screen bg-(--bg) pl-64">
        <ProfileSidebar />
        <main className="p-8">
          <Container className="max-w-4xl">
            <div className="space-y-6">
              <div>
                <h2 className="text-display-3 font-serif italic mb-2">Профиль</h2>
                <p className="text-(--on-bg-medium) text-sm">Управление личными данными</p>
              </div>

              <Card className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="size-16">
                    <AvatarFallback>
                      <DiamondIcon className="size-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-display-4">{user.name} {user.surname}</h3>
                    <p className="text-body-3 text-(--on-bg-medium)">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--primary-glass) text-(--primary)">
                        {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                      {user.verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Подтверждён
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Не подтверждён
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-heading-4 mb-4">Краткая статистика</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase">Проектов</p>
                    <p className="text-display-4">0</p>
                  </div>
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase">Заказов</p>
                    <p className="text-display-4">0</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="text-heading-4 mb-4">Действия</h4>
                <div className="flex gap-4">
                  <Button variant="outlined">Редактировать профиль</Button>
                  <Button variant="glass">Изменить пароль</Button>
                </div>
              </Card>
            </div>
          </Container>
        </main>
      </div>
    </CheckUser>
  );
}
