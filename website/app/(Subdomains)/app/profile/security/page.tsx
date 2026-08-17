"use client";
import { useState } from "react";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { changePassword } from "@/utils/api/user";
import { ProfileSidebar } from "@/app/(Subdomains)/app/_components/profile-sidebar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export default function SecurityPage() {
  const { user, isLoading } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <>
      <div>
        <h1 className="text-display-2 mb-1">
          Безопасность
        </h1>
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
        <p className="text-body-3 text-(--on-bg-medium)">
          Здесь можно будет включить 2FA для дополнительной защиты (в разработке).
        </p>
      </Card>
    </>
  );
}
