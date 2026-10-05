"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/entities/user/model/user-context";
import { CheckUser } from "@/entities/user/model/check-user";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { PhoneInputField } from "@/components/ui/phone-input";
import { toast } from "sonner";
import { updateProfile } from "@/utils/api/user";
import { cn } from "@/lib/utils";
import { UserIcon, ArrowUpRightIcon } from "@phosphor-icons/react";

const BIO_LIMIT = 64;

interface ProfileForm {
  name: string;
  surname: string;
  email: string;
  phone: string;
  username: string;
  bio: string;
  avatar_url: string;
  team_role: string;
  team_bio: string;
  team_cover_url: string;
}

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    username: "",
    bio: "",
    avatar_url: "",
    team_role: "",
    team_bio: "",
    team_cover_url: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      surname: user.surname || "",
      email: user.email || "",
      phone: user.phone || "",
      username: user.username || "",
      bio: user.bio || "",
      avatar_url: user.avatar_url || "",
      team_role: user.team_member?.role || "",
      team_bio: user.team_member?.bio || "",
      team_cover_url: user.team_member?.cover_url || "",
    });
  }, [user]);

  if (isLoading || !user) return null;

  const isTeam = !!user.is_team_member;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: form.name,
        surname: form.surname,
        email: form.email,
        phone: form.phone,
        username: form.username,
        bio: form.bio,
        avatar_url: form.avatar_url,
        ...(isTeam
          ? {
              team_role: form.team_role,
              team_bio: form.team_bio,
              team_cover_url: form.team_cover_url,
            }
          : {}),
      });
      toast.success("Профиль обновлён");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Ошибка при обновлении");
    } finally {
      setIsSaving(false);
    }
  };

  const update = <K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const publicHref = form.username ? `/${form.username}` : null;

  return (
    <CheckUser>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-display-2 tracking-tight">Профиль</h1>
            <p className="text-body-4 text-(--on-bg-medium) mt-1">
              Управление личными данными
            </p>
          </div>
          {!isEditing ? (
            <Button variant="outlined" onClick={() => setIsEditing(true)}>
              Редактировать
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="text"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Сохранение…" : "Сохранить"}
              </Button>
            </div>
          )}
        </div>

        {/* ══════════ Island 1 — identity ══════════ */}
        <Card className="rounded-3xl border-(--outline) p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="relative size-32 rounded-full overflow-hidden border border-(--outline) bg-muted">
                {form.avatar_url ? (
                  <Image
                    src={form.avatar_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-(--on-bg-low)">
                    <UserIcon className="size-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4 min-w-0">
              <Field>
                <FieldLabel>Никнейм</FieldLabel>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    update(
                      "username",
                      e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                    )
                  }
                  disabled={!isEditing}
                  placeholder="username"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Имя</FieldLabel>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Имя"
                  />
                </Field>
                <Field>
                  <FieldLabel>Фамилия</FieldLabel>
                  <Input
                    value={form.surname}
                    onChange={(e) => update("surname", e.target.value)}
                    disabled={!isEditing}
                    placeholder="Фамилия"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel className="flex items-center justify-between">
                  <span>Короткое био</span>
                  <span
                    className={cn(
                      "text-[11px] font-normal tabular-nums",
                      form.bio.length >= BIO_LIMIT
                        ? "text-destructive"
                        : "text-(--on-bg-low)",
                    )}
                  >
                    {form.bio.length}/{BIO_LIMIT}
                  </span>
                </FieldLabel>
                <Input
                  value={form.bio}
                  onChange={(e) =>
                    update("bio", e.target.value.slice(0, BIO_LIMIT))
                  }
                  disabled={!isEditing}
                  placeholder="Одна строка о себе"
                  maxLength={BIO_LIMIT}
                />
              </Field>

              {isEditing && (
                <Field>
                  <FieldLabel>Аватар (1:1)</FieldLabel>
                  <ImageUploadField
                    value={form.avatar_url}
                    onChange={(v) => update("avatar_url", v)}
                    placeholder="/uploads/images/… или https://…"
                  />
                </Field>
              )}

              {publicHref && (
                <Link
                  href={publicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors"
                >
                  Публичный профиль
                  <ArrowUpRightIcon className="size-3" />
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* ══════════ Island 2 — contacts ══════════ */}
        <Card className="rounded-3xl border-(--outline) p-6 space-y-4">
          <h2 className="text-heading-3">Контакты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={!isEditing}
                placeholder="email@example.com"
              />
            </Field>
            <Field>
              <FieldLabel>Телефон</FieldLabel>
              <PhoneInputField
                value={form.phone}
                onChange={(v) => update("phone", v ?? "")}
                disabled={!isEditing}
              />
            </Field>
          </div>
        </Card>

        {/* ══════════ Team block — for team members only ══════════ */}
        {isTeam && (
          <Card className="rounded-3xl border-(--outline) p-6 space-y-4">
            <h2 className="text-heading-3">Команда Rovno.dev</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Эти данные показываются на странице эксперта{" "}
              <code className="font-mono">/{form.username || "username"}</code>.
            </p>
            <Field>
              <FieldLabel>Роль в команде</FieldLabel>
              <Input
                value={form.team_role}
                onChange={(e) => update("team_role", e.target.value)}
                disabled={!isEditing}
                placeholder="Со-основатель и CTO"
              />
            </Field>
            <Field>
              <FieldLabel>Профессиональное био</FieldLabel>
              <Textarea
                value={form.team_bio}
                onChange={(e) => update("team_bio", e.target.value)}
                disabled={!isEditing}
                placeholder="Расскажите о специализации, опыте, подходе"
                className="min-h-[140px]"
              />
            </Field>
            <Field>
              <FieldLabel>Обложка для страницы эксперта (21:8)</FieldLabel>
              {form.team_cover_url && (
                <div className="relative w-full aspect-[21/8] overflow-hidden rounded-2xl border border-(--outline) bg-muted mb-2">
                  <Image
                    src={form.team_cover_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {isEditing && (
                <ImageUploadField
                  value={form.team_cover_url}
                  onChange={(v) => update("team_cover_url", v)}
                  placeholder="/uploads/images/… — соотношение 21:8"
                />
              )}
            </Field>
          </Card>
        )}
      </div>
    </CheckUser>
  );
}
