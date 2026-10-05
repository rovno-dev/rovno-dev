"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ArrowClockwiseIcon,
  Buildings,
  CalendarBlank,
  Cube,
  Newspaper,
  Receipt,
  Users,
  UsersThree,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_projects: number;
  total_companies: number;
  total_articles: number;
  total_team_members: number;
  orders_this_month: number;
  projects_by_category: Record<string, number>;
}

interface CreatedAtRow {
  id: string;
  created_at: string;
}

type Range = 7 | 30 | 90;
type Series = "users" | "orders";
type Tone = "blue" | "green" | "orange" | "neutral";

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: 7, label: "7д" },
  { value: 30, label: "30д" },
  { value: 90, label: "90д" },
];

const chartConfig = {
  users: { label: "Пользователи", color: "var(--primary)" },
  orders: { label: "Заявки", color: "var(--warning)" },
} satisfies ChartConfig;

const TONE_CHIP: Record<Tone, string> = {
  blue: "text-(--primary) bg-[color-mix(in_srgb,var(--primary),transparent_88%)]",
  green: "text-(--success) bg-[color-mix(in_srgb,var(--success),transparent_88%)]",
  orange: "text-(--warning) bg-[color-mix(in_srgb,var(--warning),transparent_88%)]",
  neutral:
    "text-(--on-bg-medium) bg-[color-mix(in_srgb,var(--on-bg-medium),transparent_90%)]",
};

function bucketByDay(items: CreatedAtRow[], days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    keys.push(d.toISOString().slice(0, 10));
  }
  const counts = new Map(keys.map((k) => [k, 0]));
  for (const item of items) {
    const k = item.created_at?.slice(0, 10);
    if (k && counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return keys.map((k) => ({ date: k, count: counts.get(k) ?? 0 }));
}

function formatTick(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminDashboard() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usersRaw, setUsersRaw] = useState<CreatedAtRow[]>([]);
  const [ordersRaw, setOrdersRaw] = useState<CreatedAtRow[]>([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>(30);
  const [visible, setVisible] = useState<Record<Series, boolean>>({
    users: true,
    orders: true,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, users, orders, events] = await Promise.all([
        $fetch("/api/v1/admin/dashboard", { isToast: false }),
        $fetch("/api/v1/admin/users?limit=500", { isToast: false }),
        $fetch("/api/v1/admin/order-requests?limit=500", { isToast: false }),
        $fetch("/api/v1/admin/events?limit=500", { isToast: false }),
      ]);
      if (!dash.response?.ok) {
        throw new Error(
          dash.json?.detail || `HTTP ${dash.response?.status}`,
        );
      }
      setStats(dash.json);
      setUsersRaw(Array.isArray(users.json) ? users.json : []);
      setOrdersRaw(Array.isArray(orders.json) ? orders.json : []);
      setEventsCount(Array.isArray(events.json) ? events.json.length : 0);
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить данные");
      toast.error(err?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "root") {
      router.push("/");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Two series bucketed independently, then zipped by index — same key
  // order, so `chartData[i].date` is the same day for both.
  const chartData = useMemo(() => {
    const u = bucketByDay(usersRaw, range);
    const o = bucketByDay(ordersRaw, range);
    return u.map((row, i) => ({
      date: row.date,
      users: row.count,
      orders: o[i]?.count ?? 0,
    }));
  }, [usersRaw, ordersRaw, range]);

  if (userLoading || !user) return null;

  const legendTotals: Record<Series, number> = {
    users: usersRaw.length,
    orders: ordersRaw.length,
  };

  return (
    <CheckUser>
      <div className="space-y-5">
        {/* ── Header: title + range toggle + refresh ─────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-display-2 tracking-tight">Обзор</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-(--outline) bg-(--card) p-0.5 h-9">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setRange(o.value)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 h-8 text-xs font-medium tabular-nums transition-colors",
                    range === o.value
                      ? "bg-(--on-bg-high) text-(--bg)"
                      : "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <Button
              variant="outlined"
              size="icon-small"
              onClick={load}
              disabled={loading}
              aria-label="Обновить"
            >
              <ArrowClockwiseIcon
                className={cn("size-4", loading && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        {error && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6">
            <p className="text-body-4 text-(--error) mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>
              Повторить
            </Button>
          </Card>
        )}

        {/* ── Activity chart + key metrics ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 rounded-3xl border-(--outline) bg-(--card) p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-body-5 uppercase tracking-[0.16em] text-(--on-bg-low)">
                  Activity
                </p>
                <h2 className="text-heading-3 mt-1">
                  Активность за период
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {(["users", "orders"] as Series[]).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setVisible((v) => ({ ...v, [s]: !v[s] }))
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 text-body-4 transition-opacity",
                      visible[s] ? "opacity-100" : "opacity-40",
                    )}
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ background: chartConfig[s].color }}
                    />
                    <span className="text-(--on-bg-medium)">
                      {chartConfig[s].label}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-(--on-bg-low)">
                      {legendTotals[s]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[260px]">
              {loading ? (
                <div className="h-full rounded-2xl bg-muted/20 animate-pulse" />
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full aspect-auto"
                >
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      {(["users", "orders"] as Series[]).map((s) => (
                        <linearGradient
                          key={s}
                          id={`grad-${s}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={`var(--color-${s})`}
                            stopOpacity={0.28}
                          />
                          <stop
                            offset="100%"
                            stopColor={`var(--color-${s})`}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="2 4"
                      vertical={false}
                      stroke="var(--outline)"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={formatTick}
                      interval="preserveStartEnd"
                      minTickGap={32}
                      className="text-[11px]"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      width={32}
                      allowDecimals={false}
                      className="text-[11px]"
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          indicator="line"
                          labelFormatter={(v) => formatTick(String(v))}
                        />
                      }
                    />
                    {visible.users && (
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="var(--color-users)"
                        strokeWidth={2}
                        fill="url(#grad-users)"
                        dot={false}
                      />
                    )}
                    {visible.orders && (
                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="var(--color-orders)"
                        strokeWidth={2}
                        fill="url(#grad-orders)"
                        dot={false}
                      />
                    )}
                  </AreaChart>
                </ChartContainer>
              )}
            </div>
          </Card>

          <Card className="rounded-3xl border-(--outline) bg-(--card) p-5 space-y-4">
            <div>
              <p className="text-body-5 uppercase tracking-[0.16em] text-(--on-bg-low)">
                Key metrics
              </p>
              <h2 className="text-heading-3 mt-1">
                Ключевые показатели
              </h2>
            </div>
            <div className="space-y-0">
              <MetricRow
                icon={<Users className="size-4" />}
                tone="blue"
                label="Пользователи"
                value={stats?.total_users ?? 0}
              />
              <MetricRow
                icon={<Receipt className="size-4" />}
                tone="orange"
                label="Заявки всего"
                value={stats?.total_orders ?? 0}
              />
              <MetricRow
                icon={<Receipt className="size-4" />}
                tone="orange"
                label="Заявок в месяц"
                value={stats?.orders_this_month ?? 0}
              />
              <MetricRow
                icon={<Buildings className="size-4" />}
                tone="green"
                label="Компании"
                value={stats?.total_companies ?? 0}
              />
            </div>
          </Card>
        </div>

        {/* ── Metric cards, row 1 (4 up) ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={<Buildings className="size-5" />}
            tone="green"
            label="Компании"
            value={stats?.total_companies ?? 0}
          />
          <MetricCard
            icon={<Cube className="size-5" />}
            tone="blue"
            label="Проекты"
            value={stats?.total_projects ?? 0}
          />
          <MetricCard
            icon={<CalendarBlank className="size-5" />}
            tone="neutral"
            label="События"
            value={eventsCount}
          />
          <MetricCard
            icon={<Newspaper className="size-5" />}
            tone="neutral"
            label="Статьи"
            value={stats?.total_articles ?? 0}
          />
        </div>

        {/* ── Metric cards, row 2 (3 up, with caption) ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MetricCard
            icon={<Receipt className="size-5" />}
            tone="orange"
            label="Заявки"
            value={stats?.orders_this_month ?? 0}
            sub="За месяц"
          />
          <MetricCard
            icon={<UsersThree className="size-5" />}
            tone="blue"
            label="Команда"
            value={stats?.total_team_members ?? 0}
            sub="Активных участников"
          />
          <MetricCard
            icon={<CalendarBlank className="size-5" />}
            tone="neutral"
            label="События"
            value={eventsCount}
            sub="В системе"
          />
        </div>
      </div>
    </CheckUser>
  );
}

/* ─────────────────────────────────────────────────────────────────── */

function MetricRow({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: Tone;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-(--outline)/60 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg shrink-0",
            TONE_CHIP[tone],
          )}
        >
          {icon}
        </span>
        <span className="text-body-4 text-(--on-bg-high) truncate">
          {label}
        </span>
      </div>
      <span className="text-heading-3 tabular-nums shrink-0">{value}</span>
    </div>
  );
}

function MetricCard({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  tone: Tone;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card className="rounded-3xl border-(--outline) bg-(--card) p-4 space-y-3">
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-xl",
          TONE_CHIP[tone],
        )}
      >
        {icon}
      </span>
      <div>
        <p className="text-body-6 uppercase tracking-[0.16em] text-(--on-bg-low) mb-1">
          {label}
        </p>
        <p className="text-display-3 tabular-nums leading-none">{value}</p>
        {sub && (
          <p className="text-body-6 uppercase tracking-[0.14em] text-(--on-bg-low) mt-2">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
