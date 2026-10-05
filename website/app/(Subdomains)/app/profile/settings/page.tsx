"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bell,
  EnvelopeSimple,
  TelegramLogo,
  Tag,
  CircleNotchIcon,
  CheckCircleIcon,
  ArrowSquareOutIcon,
  ArrowClockwiseIcon,
  LinkBreakIcon,
  Info,
} from "@phosphor-icons/react";
import {
  fetchNotificationPrefs,
  updateNotificationPrefs,
  createTelegramLinkCode,
  disconnectTelegram,
  type NotificationPrefs,
  type TelegramConnectCode,
} from "@/utils/api/notifications";

type SavingField = "email" | "telegram" | "marketing" | null;

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<SavingField>(null);

  const [linkCode, setLinkCode] = useState<TelegramConnectCode | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await fetchNotificationPrefs();
      setPrefs(p);
    } catch (err: any) {
      toast.error(err?.message || "Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Every toggle sends the full preference set — the backend PUT replaces
  // all fields. Optimistic locally, reverted on failure.
  const patch = async (
    field: Exclude<SavingField, null>,
    next: Partial<NotificationPrefs>,
  ) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, ...next });
    setSavingField(field);
    try {
      const updated = await updateNotificationPrefs({
        email_enabled: next.email_enabled ?? prev.email_enabled,
        telegram_enabled: next.telegram_enabled ?? prev.telegram_enabled,
        marketing_enabled: next.marketing_enabled ?? prev.marketing_enabled,
      });
      setPrefs(updated);
    } catch (err: any) {
      setPrefs(prev);
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSavingField(null);
    }
  };

  const handleConnectTelegram = async () => {
    try {
      const code = await createTelegramLinkCode();
      setLinkCode(code);
      setLinkDialogOpen(true);
      window.open(code.url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось создать код подключения");
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Отключить Telegram? Уведомления в Telegram перестанут приходить, " +
        "но вы сможете подключить его снова.",
      )
    )
      return;
    try {
      await disconnectTelegram();
      toast.success("Telegram отключён");
      await load();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка отключения");
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.info("Статус обновлён", { duration: 1500 });
  };

  const handleRegenerateCode = async () => {
    try {
      const code = await createTelegramLinkCode();
      setLinkCode(code);
    } catch (err: any) {
      toast.error(err?.message || "Не удалось создать код");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-5">
        <div>
          <h1 className="text-display-2 tracking-tight">Настройки</h1>
          <p className="text-body-4 text-(--on-bg-medium) mt-1">
            Управление аккаунтом и уведомлениями
          </p>
        </div>

        {/* ── Notifications card ──────────────────────────────────── */}
        <Card className="rounded-3xl border-(--outline) p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-(--primary)" />
            <h2 className="text-heading-3">Уведомления</h2>
          </div>
          <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
            Как с вами связываться — по email, в Telegram или в обоих
            каналах. Системные письма (подтверждение почты,
            восстановление доступа) приходят всегда, их отключить
            нельзя.
          </p>

          {loading || !prefs ? (
            <div className="flex items-center gap-2 py-4 text-body-4 text-(--on-bg-low)">
              <CircleNotchIcon className="size-4 animate-spin" />
              Загрузка…
            </div>
          ) : (
            <>
              {/* Email — master channel switch */}
              <div className="flex items-center justify-between gap-4 py-3 border-b border-(--outline)">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary) shrink-0">
                    <EnvelopeSimple className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <Label
                      htmlFor="email-notif"
                      className="text-body-3 font-medium cursor-pointer"
                    >
                      Email-уведомления
                    </Label>
                    <p className="text-body-5 text-(--on-bg-low)">
                      Уведомления на {prefs ? "вашу почту" : "email"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notif"
                  checked={prefs.email_enabled}
                  onCheckedChange={(v) =>
                    patch("email", { email_enabled: v })
                  }
                  disabled={savingField === "email"}
                />
              </div>

              {/* Telegram — master channel switch */}
              <div className="space-y-3 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary) shrink-0">
                      <TelegramLogo className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <Label
                        htmlFor="tg-notif"
                        className="text-body-3 font-medium cursor-pointer"
                      >
                        Telegram-уведомления
                      </Label>
                      <p className="text-body-5 text-(--on-bg-low)">
                        Сообщения от бота
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="tg-notif"
                    checked={prefs.telegram_enabled}
                    onCheckedChange={(v) =>
                      patch("telegram", { telegram_enabled: v })
                    }
                    disabled={savingField === "telegram"}
                  />
                </div>

                {/* Connection status */}
                {prefs.telegram_connected ? (
                  <div className="rounded-2xl border border-(--success)/30 bg-[color-mix(in_srgb,var(--success),transparent_94%)] p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircleIcon
                        className="size-4 text-(--success) shrink-0"
                        weight="fill"
                      />
                      <span className="text-body-4 truncate">
                        Подключено
                        {prefs.telegram_username && (
                          <>
                            {" "}
                            · <b>@{prefs.telegram_username}</b>
                          </>
                        )}
                      </span>
                    </div>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleDisconnect}
                      className="shrink-0"
                    >
                      <LinkBreakIcon className="size-4" />
                      Отключить
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-(--outline) bg-(--bg) p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-body-4">Telegram не подключён</p>
                      <p className="text-body-5 text-(--on-bg-low)">
                        {prefs.bot_username
                          ? "Подключите бота, чтобы получать сообщения"
                          : "Бот не настроен на сервере"}
                      </p>
                    </div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleConnectTelegram}
                      disabled={!prefs.bot_username}
                      className="shrink-0"
                    >
                      <TelegramLogo className="size-4" />
                      Подключить
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Marketing opt-in ─────────────────────────────── */}
              <div className="pt-3 border-t border-(--outline)">
                <div className="flex items-center justify-between gap-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary) shrink-0">
                      <Tag className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <Label
                        htmlFor="marketing-notif"
                        className="text-body-3 font-medium cursor-pointer"
                      >
                        Маркетинг
                      </Label>
                      <p className="text-body-5 text-(--on-bg-low)">
                        Скидки, акции, специальные предложения
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="marketing-notif"
                    checked={prefs.marketing_enabled}
                    onCheckedChange={(v) =>
                      patch("marketing", { marketing_enabled: v })
                    }
                    disabled={savingField === "marketing"}
                  />
                </div>
                <p className="text-body-5 text-(--on-bg-low) leading-relaxed">
                  Отдельная подписка — по умолчанию выключена. Включите,
                  если хотите получать новости о промо и распродажах.
                </p>
              </div>
            </>
          )}
        </Card>

        {/* ── Account card ────────────────────────────────────────── */}
        <Card className="rounded-3xl border-(--outline) p-6">
          <h2 className="text-heading-3 mb-2">Аккаунт</h2>
          <p className="text-body-4 text-(--on-bg-medium)">
            Управление профилем, паролем и безопасностью — в
            соответствующих разделах бокового меню.
          </p>
        </Card>
      </div>

      {/* ── Telegram link dialog ──────────────────────────────────── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TelegramLogo className="size-5 text-(--primary)" />
              Подключение Telegram
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ol className="text-body-3 text-(--on-bg-medium) space-y-3 list-decimal pl-5">
              <li>
                Открылся Telegram — нажмите{" "}
                <b className="text-(--on-bg-high)">Start</b> в диалоге с
                ботом.
              </li>
              <li>
                Вернитесь на эту страницу и нажмите{" "}
                <b className="text-(--on-bg-high)">
                  «Проверить подключение»
                </b>
                .
              </li>
            </ol>
            {linkCode && (
              <div className="rounded-2xl border border-(--outline) bg-(--bg) p-3 space-y-2">
                <p className="text-body-5 uppercase tracking-wider text-(--on-bg-low)">
                  Если Telegram не открылся автоматически
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-body-4 bg-(--card) border border-(--outline) rounded-lg px-2 py-1">
                    {linkCode.code}
                  </code>
                  <Button variant="outlined" size="small" asChild>
                    <a
                      href={linkCode.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowSquareOutIcon className="size-4" />
                      Открыть Telegram
                    </a>
                  </Button>
                </div>
                <p className="text-body-6 text-(--on-bg-low)">
                  Код действует {Math.round(linkCode.expires_in / 60)} мин.
                </p>
              </div>
            )}
            <Button
              variant="text"
              size="small"
              onClick={handleRegenerateCode}
              className="text-(--on-bg-low)"
            >
              <ArrowClockwiseIcon className="size-4" />
              Создать новый код
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outlined"
              onClick={() => setLinkDialogOpen(false)}
            >
              Закрыть
            </Button>
            <Button onClick={handleRefreshStatus} disabled={refreshing}>
              {refreshing ? (
                <CircleNotchIcon className="size-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="size-4" />
              )}
              Проверить подключение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}
