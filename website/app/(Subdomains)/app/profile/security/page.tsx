"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { changePassword, deleteAccount } from "@/utils/api/user";
import { $fetch } from "@/utils/fetch";
import { QrCode } from "@phosphor-icons/react";
import { Field, FieldLabel } from "@/components/ui/field";

export default function SecurityPage() {
  const { user, isLoading, logout } = useUser();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totpSetup, setTotpSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);

  if (isLoading || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Новый пароль должен быть не короче 8 символов");
      return;
    }
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Пароль успешно изменён");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Ошибка при смене пароля");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success("Аккаунт удалён");
      // Clear auth state locally then leave the app area. We intentionally
      // skip the /logout call — the account no longer exists server-side.
      try {
        await logout();
      } catch {
        // logout may 401 now; ignore and continue the redirect
      }
      router.push("/");
    } catch {
      toast.error("Не удалось удалить аккаунт");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-display-2 mb-1">Безопасность</h1>
        <p className="text-body-2 text-(--on-bg-medium)">
          Управление безопасностью аккаунта
        </p>
      </div>

      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <h2 className="text-heading-3 mb-4">Смена пароля</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field>
            <FieldLabel>Текущий пароль</FieldLabel>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Новый пароль</FieldLabel>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>Подтвердите новый пароль</FieldLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Изменить пароль"}
          </Button>
        </form>
      </Card>

      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2">Активные сессии</h2>
        <p className="text-body-3 text-(--on-bg-medium)">
          Здесь будет отображаться информация о текущих сессиях (в разработке).
        </p>
      </Card>

      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2">Двухфакторная аутентификация</h2>
        <p className="text-body-3 text-(--on-bg-medium) mb-6">
          Защитите аккаунт с помощью приложения Google Authenticator или аналогичного.
        </p>
        
        {!totpSetup ? (
          <Button
            onClick={async () => {
              setTotpLoading(true);
              try {
                const res = await $fetch("/api/v1/2fa/setup", { method: "POST" });
                if (res?.response?.ok) setTotpSetup(res.json);
                else toast.error("Ошибка настройки 2FA");
              } finally {
                setTotpLoading(false);
              }
            }}
            disabled={totpLoading}
          >
            {totpLoading ? "Генерация..." : "Включить 2FA"}
          </Button>
        ) : (
          <div className="space-y-4 max-w-sm">
            <p className="text-body-4 text-(--on-bg-medium)">1. Отсканируйте QR-код или введите секрет вручную:</p>
            <div className="p-4 bg-white rounded-xl flex items-center justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(totpSetup.uri)}`} alt="QR Code" className="w-[150px] h-[150px]" />
            </div>
            <code className="block text-xs font-mono bg-(--bg) p-2 rounded break-all">{totpSetup.secret}</code>
            <p className="text-body-4 text-(--on-bg-medium)">2. Введите 6-значный код из приложения:</p>
            <div className="flex gap-2">
              <Input value={totpCode} onChange={e => setTotpCode(e.target.value)} placeholder="000000" maxLength={6} />
              <Button
                onClick={async () => {
                  setTotpLoading(true);
                  try {
                    const res = await $fetch(`/api/v1/2fa/enable?code=${totpCode}`, { method: "POST" });
                    if (res?.response?.ok) {
                      toast.success("2FA включена!");
                      setTotpSetup(null);
                      setTotpCode("");
                    } else {
                      toast.error("Неверный код");
                    }
                  } finally {
                    setTotpLoading(false);
                  }
                }}
                disabled={totpLoading || totpCode.length !== 6}
              >
                Подтвердить
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Danger zone */}
      <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6 shadow-sm">
        <h2 className="text-heading-3 mb-2 text-(--error)">Опасная зона</h2>
        <p className="text-body-3 text-(--on-bg-medium) mb-5">
          Удаление аккаунта — необратимое действие. Все ваши данные будут утеряны
          без возможности восстановления.
        </p>
        <Button variant="glass-red" size="large" onClick={() => setDeleteOpen(true)}>
          Удалить аккаунт
        </Button>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить аккаунт?</DialogTitle>
          </DialogHeader>
          <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
            Это действие нельзя отменить. Аккаунт <b>{user.email}</b> будет
            удалён навсегда.
          </p>
          <DialogFooter>
            <Button
              variant="outlined"
              onClick={() => setDeleteOpen(false)}
              disabled={isDeleting}
            >
              Отмена
            </Button>
            <Button
              variant="glass-red"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаление..." : "Удалить навсегда"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
