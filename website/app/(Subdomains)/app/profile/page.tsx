"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateProfile } from "@/utils/api/user";
import { ProfileSidebar } from "@/app/(Subdomains)/app/_components/profile-sidebar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        description: user.description || "",
      });
    }
  }, [user]);

  if (isLoading || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(form);
      toast.success("Профиль обновлён");
      setIsEditing(false);
    } catch {
      toast.error("Ошибка при обновлении");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-2 mb-1">
            Профиль
          </h1>
          <p className="text-body-2 text-(--on-bg-medium)">
            Управление личными данными
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outlined" onClick={() => setIsEditing(true)}>
            Редактировать
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="text" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        )}
      </div>
      <Card className="rounded-3xl border-(--outline) p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Имя</FieldLabel>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!isEditing}
            />
          </Field>
          <Field>
            <FieldLabel>Фамилия</FieldLabel>
            <Input
              value={form.surname}
              onChange={(e) => setForm({ ...form, surname: e.target.value })}
              disabled={!isEditing}
            />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!isEditing}
            />
          </Field>
          <Field>
            <FieldLabel>Телефон</FieldLabel>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!isEditing}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>О себе</FieldLabel>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={!isEditing}
            />
          </Field>
        </div>
      </Card>
    </>
  );
}
