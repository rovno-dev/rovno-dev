"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  MagnifyingGlassIcon, ArrowClockwiseIcon, CircleNotchIcon,
  CheckCircleIcon, XCircleIcon, Phone, EnvelopeSimple, TelegramLogo,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchAllEventRequests, updateEventRequest,
  type EventRequestRow,
} from "@/utils/api/events";

const STATUS_META: Record<string, { label: string; className: string }> = {
  new: { label: "Новая", className: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  approved: { label: "Принята", className: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  declined: { label: "Отклонена", className: "bg-rose-500/15 text-rose-500 border-rose-500/30" },
  canceled: { label: "Отменена", className: "bg-gray-500/15 text-gray-500 border-gray-500/30" },
};

const STATUS_FILTERS = ["all", "new", "approved", "declined", "canceled"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AdminEventRequestsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [rows, setRows] = useState<EventRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [declineFor, setDeclineFor] = useState<EventRequestRow | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllEventRequests({
        q: debounced || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [debounced, statusFilter]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }

  const setStatus = async (row: EventRequestRow, status: string, reason?: string) => {
    setSavingId(row.id);
    try {
      const updated = await updateEventRequest(row.id, {
        status,
        decline_reason: reason || null,
      });
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      toast.success("Обновлено");
    } catch (e: any) {
      toast.error(e?.message || "Ошибка");
    } finally {
      setSavingId(null);
    }
  };

  const handleDecline = async () => {
    if (!declineFor) return;
    await setStatus(declineFor, "declined", declineReason.trim() || undefined);
    setDeclineFor(null);
    setDeclineReason("");
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Заявки на события</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {loading ? "Загрузка…" : `${rows.length} заявок`}
            </p>
          </div>
          <Button variant="outlined" size="small" onClick={load}>
            {loading ? <CircleNotchIcon className="size-4 animate-spin" /> : <ArrowClockwiseIcon className="size-4" />}
            Обновить
          </Button>
        </div>

        <Card className="rounded-3xl border-(--outline) p-4 space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low)" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя, email, телефон…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s}
                size="chip-small"
                shape="round"
                variant={statusFilter === s ? "filled" : "tonal-card"}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "Все" : STATUS_META[s].label}
              </Button>
            ))}
          </div>
        </Card>

        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        ) : rows.length === 0 ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">
              {query || statusFilter !== "all" ? "Ничего не найдено." : "Пока нет заявок."}
            </p>
          </Card>
        ) : (
          <Card className="rounded-3xl border-(--outline) bg-(--card) divide-y divide-(--outline) overflow-hidden">
            {rows.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.new;
              const fullName = [r.surname, r.name, r.patronymic].filter(Boolean).join(" ") || "—";
              const saving = savingId === r.id;
              return (
                <div key={r.id} className="p-5 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-heading-4 truncate">{fullName}</h3>
                        <Badge variant="tonal-card-static" size="chip-small" className={cn(meta.className)}>
                          {meta.label}
                        </Badge>
                        {r.event_title && (
                          <Badge variant="tonal-card-static" size="chip-small">
                            {r.event_title}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-body-4 text-(--on-bg-medium)">
                        {r.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3.5" /> {r.phone}
                          </span>
                        )}
                        {r.email && (
                          <span className="inline-flex items-center gap-1.5">
                            <EnvelopeSimple className="size-3.5" /> {r.email}
                          </span>
                        )}
                        {r.telegram_username && (
                          <span className="inline-flex items-center gap-1.5">
                            <TelegramLogo className="size-3.5" /> @{r.telegram_username}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-body-5 text-(--on-bg-low) shrink-0">
                      {new Date(r.created_at).toLocaleString("ru-RU")}
                    </div>
                  </div>

                  {r.meta && Object.keys(r.meta).length > 0 && (
                    <details className="text-body-5">
                      <summary className="cursor-pointer text-(--on-bg-low) hover:text-(--on-bg-medium)">
                        Доп. поля ({Object.keys(r.meta).length})
                      </summary>
                      <pre className="mt-2 p-3 rounded-lg bg-(--bg) border border-(--outline) text-body-6 font-mono overflow-x-auto">
                        {JSON.stringify(r.meta, null, 2)}
                      </pre>
                    </details>
                  )}

                  {r.status === "declined" && r.decline_reason && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wider text-rose-500/80 mb-0.5">
                        Причина отклонения
                      </p>
                      <p className="text-body-4">{r.decline_reason}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-(--outline)">
                    {r.status !== "approved" && (
                      <Button
                        size="small"
                        onClick={() => setStatus(r, "approved")}
                        disabled={saving}
                      >
                        {saving ? <CircleNotchIcon className="size-4 animate-spin" /> : <CheckCircleIcon className="size-4" />}
                        Принять
                      </Button>
                    )}
                    {r.status !== "declined" && (
                      <Button
                        size="small"
                        variant="glass-red"
                        onClick={() => { setDeclineFor(r); setDeclineReason(""); }}
                        disabled={saving}
                      >
                        <XCircleIcon className="size-4" />
                        Отклонить
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      <Dialog open={!!declineFor} onOpenChange={(o) => { if (!o) setDeclineFor(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Отклонить заявку</DialogTitle>
          </DialogHeader>
          <Field>
            <FieldLabel>Причина (опционально)</FieldLabel>
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Мест не осталось…"
              className="min-h-[100px]"
            />
          </Field>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setDeclineFor(null)}>Отмена</Button>
            <Button variant="glass-red" onClick={handleDecline} disabled={savingId === declineFor?.id}>
              Отклонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}
