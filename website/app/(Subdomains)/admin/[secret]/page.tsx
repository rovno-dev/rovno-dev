"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { AdminSidebar } from "../_components/admin-sidebar";

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

export default function AdminDashboard({ params }: { params: Promise<{ secret: string }> }) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<string>("");

  useEffect(() => {
    params.then((p) => setSecret(p.secret));
  }, [params]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/v0/admin/dashboard`)
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
    <CheckUser>
      <div className="min-h-screen bg-(--bg) py-12 md:py-16">
        <Container>
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            <div className="w-full md:w-64 shrink-0">
              <AdminSidebar secret={secret} />
            </div>
            <main className="flex-1 space-y-8">
              <div>
                <h2 className="text-display-2 font-serif italic mb-1">Панель управления</h2>
                <p className="text-(--on-bg-medium) text-sm">Обзор ключевых метрик</p>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="size-12 border-4 border-(--primary) border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard label="Пользователи" value={stats.total_users} />
                    <StatCard label="Заявки" value={stats.total_orders} sub={`в этом месяце: ${stats.orders_this_month}`} />
                    <StatCard label="Проекты" value={stats.total_projects} />
                    <StatCard label="Клиенты" value={stats.total_companies} />
                  </div>
                </>
              ) : null}
            </main>
          </div>
        </Container>
      </div>
    </CheckUser>
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
