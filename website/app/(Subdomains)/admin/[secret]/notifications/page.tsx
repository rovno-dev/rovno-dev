"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  EntityMultiPicker, type MultiPickerItem,
} from "@/components/editor/entity-multi-picker";
import {
  Bell, EnvelopeSimple, TelegramLogo, ShieldCheck,
  ArrowCounterClockwiseIcon, CircleNotchIcon, Users,
} from "@phosphor-icons/react";
import {
  fetchAdminNotificationSettings, updateAdminNotificationSettings,
  type AdminNotificationSettings,
} from "@/utils/api/admin-notifications";
import { $fetch } from "@/utils/fetch";

interface UserRow {
  id: string;
  email: string;
  name?: string | null;
  surname?: string | null;
  user_role?: string;
  role?: string;
  telegram_chat_id?: string | null;
  blocked?: boolean;
}

// Variables the backend renderer understands. Kept in sync with
// notification_service.build_order_context().
const TEMPLATE_VARS: Array<[string, string]> = [
  ["order_id", "UUID заказа"],
  ["short_id", "Первые 8 символов UUID"],
  ["created_at", "Дата создания (ДД.ММ.ГГГГ ЧЧ:ММ)"],
  ["name", "Имя клиента"],
  ["phone", "Телефон"],
  ["email", "Email"],
  ["telegram", "Telegram"],
  ["services", "Услуги, через запятую"],
  ["budget", "Бюджет"],
  ["deadline", "Срок"],
  ["naming_help", "Нужен ли нейминг"],
  ["company_name", "Название компании"],
  ["about", "Описание проекта"],
  ["files_count", "Количество файлов"],
  ["status", "Статус заказа"],
];

export default function AdminNotificationsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [settings, setSettings] = useState<AdminNotificationSettings | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRoot = user?.role === "root";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchAdminNotificationSettings();
      setSettings(s);
      setDirty(false);
    } catch (err: any) {
      setError(err?.message || "Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await $fetch("/api/v1/admin/users", { isToast: false });
      if (res?.response?.ok && Array.isArray(res.json)) {
        setUsers(res.json as UserRow[]);
      }
    } catch { /* non-fatal — picker will just be empty */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "root") {
      router.push("/");
      return;
    }
    load();
    loadUsers();
  }, [user, load, loadUsers, router]);

  // Any unblocked user can be a recipient. Meta shows what the recipient
  // actually is (admin/root/tg-linked) so an admin can see at a glance
  // who is eligible for which channel.
  const recipientItems: MultiPickerItem[] = useMemo(() => {
    return users
      .filter((u) => !u.blocked)
      .map((u) => {
        const full = `${u.name ?? ""} ${u.surname ?? ""}`.trim();
        const bits: string[] = [];
        if (u.user_role === "root") bits.push("root");
        else if (u.user_role === "admin") bits.push("admin");
        if (u.telegram_chat_id) bits.push("TG");
        return {
          id: u.id,
          label: full || u.email,
          meta: bits.length ? bits.join(" · ") : null,
        };
      });
  }, [users]);

  const makeSelected = (ids: string[] | undefined): MultiPickerItem[] => {
    if (!settings) return [];
    const map = new Map(recipientItems.map((i) => [i.id, i]));
    return (ids ?? []).map(
      (id) => map.get(id) ?? { id, label: id, meta: "unknown" },
    );
  };

  const selectedEmailRecipients: MultiPickerItem[] = useMemo(
    () => makeSelected(settings?.order_email_recipient_ids),
    [settings, recipientItems],
  );
  const selectedTelegramRecipients: MultiPickerItem[] = useMemo(
    () => makeSelected(settings?.order_telegram_recipient_ids),
    [settings, recipientItems],
  );

  const update = <K extends keyof AdminNotificationSettings>(
    k: K,
    v: AdminNotificationSettings[K],
  ) => {
    setSettings((s) => (s ? { ...s, [k]: v } : s));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await updateAdminNotificationSettings(settings);
      setSettings(updated);
      setDirty(false);
      toast.success("Настройки уведомлений сохранены");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleResetTemplate = () => {
    if (!settings) return;
    update("order_template_subject", settings.default_subject);
    update("order_template_body", settings.default_body);
    toast.info("Шаблон сброшен на дефолтный. Не забудьте сохранить.");
  };

  if (userLoading || !user) return null;
  if (!isRoot) {
    return (
      <CheckUser>
        <Card className="rounded-3xl border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-8 max-w-xl">
          <div className="flex items-start gap-4">
            <ShieldCheck className="size-6 text-(--error) shrink-0 mt-0.5" />
            <div>
              <h2 className="text-heading-3 text-(--on-bg-high) mb-2">
                Только для root
              </h2>
              <p className="text-body-3 text-(--on-bg-medium)">
                Настройки уведомлений о заказах может изменять только пользователь с ролью <b>root</b>.
              </p>
            </div>
          </div>
        </Card>
      </CheckUser>
    );
  }

  return (
    <CheckUser>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1 flex items-center gap-3">
              <Bell className="size-7 text-(--primary)" />
              Уведомления о заказах
            </h1>
            <p className="text-body-3 text-(--on-bg-medium) flex items-center gap-2">
              <Badge variant="tonal-card-static" size="chip-small" className="gap-1">
                <ShieldCheck className="size-3" />
                Только root
              </Badge>
              Настройка получателей и текста уведомлений
            </p>
          </div>
          <Button onClick={handleSave} disabled={!dirty || saving || !settings}>
            {saving && <CircleNotchIcon className="size-4 animate-spin" />}
            Сохранить
          </Button>
        </div>

        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-12 text-center">
            <CircleNotchIcon className="size-6 animate-spin text-(--primary) mx-auto" />
          </Card>
        ) : error ? (
          <Card className="rounded-3xl border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6">
            <p className="text-body-4 text-(--error) mb-3">{error}</p>
            <Button variant="outlined" size="small" onClick={load}>Повторить</Button>
          </Card>
        ) : !settings ? null : (
          <>
            {/* Channels */}
            <Card className="rounded-3xl border-(--outline) p-6 space-y-5">
              <h2 className="text-heading-3">Каналы</h2>
              <div className="flex items-center justify-between gap-4 py-3 border-b border-(--outline)">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary) shrink-0">
                    <EnvelopeSimple className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="notify-email" className="text-body-3 font-medium cursor-pointer">
                      Email-уведомления
                    </Label>
                    <p className="text-body-5 text-(--on-bg-low)">
                      Отправлять письмо на email каждого получателя
                    </p>
                  </div>
                </div>
                <Switch
                  id="notify-email"
                  checked={settings.order_notify_email}
                  onCheckedChange={(v) => update("order_notify_email", v)}
                />
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary) shrink-0">
                    <TelegramLogo className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="notify-tg" className="text-body-3 font-medium cursor-pointer">
                      Telegram-уведомления
                    </Label>
                    <p className="text-body-5 text-(--on-bg-low)">
                      Только для получателей, подключивших бота
                    </p>
                  </div>
                </div>
                <Switch
                  id="notify-tg"
                  checked={settings.order_notify_telegram}
                  onCheckedChange={(v) => update("order_notify_telegram", v)}
                />
              </div>
            </Card>

            {/* Email recipients */}
            <Card className="rounded-3xl border-(--outline) p-6 space-y-4">
              <div className="flex items-center gap-2">
                <EnvelopeSimple className="size-5 text-(--primary)" />
                <h2 className="text-heading-3">Получатели email</h2>
              </div>
              <p className="text-body-4 text-(--on-bg-medium)">
                Кому уходит письмо о новом заказе.{" "}
                <b>Если список пуст — все администраторы и root-пользователи.</b>
              </p>
              <EntityMultiPicker
                value={selectedEmailRecipients}
                onChange={(next) =>
                  update("order_email_recipient_ids", next.map((n) => n.id))
                }
                items={recipientItems}
                placeholder="Начните вводить имя или email…"
                maxItems={50}
              />
            </Card>
            {/* Telegram recipients */}
            <Card className="rounded-3xl border-(--outline) p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TelegramLogo className="size-5 text-(--primary)" />
                <h2 className="text-heading-3">Получатели Telegram</h2>
              </div>
              <p className="text-body-4 text-(--on-bg-medium)">
                Кому уходит сообщение в Telegram. Учитываются только те, у
                кого указан chat&nbsp;id в разделе{" "}
                <a
                  href="?tab=users"
                  className="text-(--primary) underline underline-offset-2"
                >
                  Пользователи
                </a>
                .{" "}
                <b>Если список пуст — все администраторы и root-пользователи.</b>
              </p>
              <EntityMultiPicker
                value={selectedTelegramRecipients}
                onChange={(next) =>
                  update("order_telegram_recipient_ids", next.map((n) => n.id))
                }
                items={recipientItems}
                placeholder="Начните вводить имя или email…"
                maxItems={50}
              />
            </Card>

            {/* Template */}
            <Card className="rounded-3xl border-(--outline) p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-heading-3">Текст уведомления</h2>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleResetTemplate}
                >
                  <ArrowCounterClockwiseIcon className="size-4" />
                  Сбросить на дефолт
                </Button>
              </div>

              <Field>
                <FieldLabel>Тема письма</FieldLabel>
                <Input
                  value={settings.order_template_subject}
                  onChange={(e) => update("order_template_subject", e.target.value)}
                  placeholder="Новый заказ #{{short_id}}"
                />
              </Field>

              <Field>
                <FieldLabel>Текст</FieldLabel>
                <Textarea
                  value={settings.order_template_body}
                  onChange={(e) => update("order_template_body", e.target.value)}
                  className="min-h-[280px] font-mono text-xs leading-relaxed"
                  placeholder="**Новый заказ**&#10;&#10;ID: {{order_id}}&#10;..."
                />
              </Field>

              <div className="rounded-2xl border border-(--outline) bg-(--bg) p-4">
                <p className="text-body-5 uppercase tracking-wider text-(--on-bg-low) mb-3">
                  Доступные переменные
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARS.map(([key, desc]) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-(--card) border border-(--outline) px-2 py-1"
                      title={desc}
                    >
                      <code className="font-mono text-[11px] text-(--primary)">
                        {`{{${key}}}`}
                      </code>
                      <span className="text-[11px] text-(--on-bg-low)">{desc}</span>
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-body-5 text-(--on-bg-low)">
                Используйте <code className="font-mono">**жирный**</code> и{" "}
                <code className="font-mono">`code`</code>. Простого текста достаточно —
                Telegram и email отобразят переносы строк как есть.
              </p>
            </Card>
          </>
        )}
      </div>
    </CheckUser>
  );
}
