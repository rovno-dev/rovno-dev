"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Stats {
  total_users: number;
  total_orders: number;
  total_projects: number;
  total_companies: number;
  total_articles: number;
  total_team_members: number;
  orders_this_month: number;
  projects_by_category: Record<string, number>;
}

export default function AdminDashboard() {
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/v1/admin/dashboard`)
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => toast.error("Не удалось загрузить данные"))
      .finally(() => setLoading(false));
  }, [user]);

  if (isLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    toast.error("Доступ запрещён");
    redirect('/');
    return null;
  }

  return (

    <>
      <div>
        <h2 className="text-display-2 mb-1">Панель управления</h2>
        <p className="text-(--on-bg-medium) text-sm">Обзор ключевых метрик</p>
      </div>
      {
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 shadow-sm border-(--outline) rounded-3xl">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted/30 animate-pulse rounded" />
                  <div className="h-8 w-16 bg-muted/30 animate-pulse rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Пользователи" value={stats.total_users} />
              <StatCard label="Заявки" value={stats.total_orders} sub={`в этом месяце: ${stats.orders_this_month}`} />
              <StatCard label="Проекты" value={stats.total_projects} />
              <StatCard label="Компании" value={stats.total_companies} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard label="Статьи" value={stats.total_articles} />
              <StatCard label="Команда" value={stats.total_team_members} />
            </div>
            {Object.keys(stats.projects_by_category).length > 0 && (
              <Card className="p-6 shadow-sm border-(--outline) rounded-3xl">
                <h3 className="text-heading-4 mb-4">Проекты по категориям</h3>
                <div className="space-y-2">
                  {Object.entries(stats.projects_by_category).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between">
                      <span>{cat}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : null
      }
    </>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <Card className="p-6 shadow-sm border-(--outline) rounded-3xl">
      <p className="text-xs uppercase tracking-wider text-(--on-bg-low) mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tighter">{value}</span>
        {sub && <span className="text-xs text-(--on-bg-low)">{sub}</span>}
      </div>
    </Card>
  );
}