"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CreateCompanyDialog } from "@/app/(Subdomains)/admin/_components/create-company-dialog";
import { $fetch } from "@/utils/fetch";

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
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await $fetch("/api/v1/admin/dashboard", { isToast: false });
      if (!res.response?.ok) {
        throw new Error(res.json?.detail || `HTTP ${res.response?.status}`);
      }
      setStats(res.json);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  if (isLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    toast.error("Доступ запрещён");
    redirect('/');
    return null;
  }

  const refreshStats = fetchStats;

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-2 mb-2">Панель управления</h2>
          <p className="text-(--on-bg-medium) text-body-3">Обзор ключевых метрик</p>
        </div>
      </div>
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 shadow-sm border-(--outline) rounded-3xl">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted/30 animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted/30 animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      )}
      {error && (
        <Card className="p-6 mt-6 border-destructive/30 bg-destructive/5">
          <p className="text-destructive">Ошибка загрузки: {error}</p>
          <Button variant="outlined" size="small" onClick={refreshStats} className="mt-2">
            Повторить
          </Button>
        </Card>
      )}
      {!loading && !error && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <StatCard label="Пользователи" value={stats.total_users} />
            <StatCard label="Заявки" value={stats.total_orders} sub={`в этом месяце: ${stats.orders_this_month}`} />
            <StatCard label="Проекты" value={stats.total_projects} />
            <StatCard label="Компании" value={stats.total_companies} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <StatCard label="Статьи" value={stats.total_articles} />
            <StatCard label="Команда" value={stats.total_team_members} />
          </div>
        </div>
      )}
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
