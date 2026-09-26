"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "./image-upload-field";
import { ArticleEditor } from "./article-editor";
import {
  FloppyDisk, Rocket, Trash, Sparkle,
} from "@phosphor-icons/react";
import {
  createEvent, updateEvent, deleteEvent,
  type EventDetail, type EventPayload,
} from "@/utils/api/events";
import { EVENT_CUSTOM_PAGES_META } from "@/app/events/[slug]/_components/event-custom-pages-meta";

interface FormState {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  cover_image_src: string;
  cover_video_src: string;
  start_at: string;
  end_at: string;
  location_name: string;
  address: string;
  metro: string;
  city: string;
  price: string;
  registration_url: string;
  capacity: number | null;
  custom_page: string | null;
  is_featured: boolean;
  publication_status: "draft" | "published";
  mdx_content: string;
  seo_title: string;
  meta_description: string;
}

function isoToLocalInput(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function toFormState(e?: EventDetail | null): FormState {
  if (!e) {
    return {
      slug: "",
      title: "",
      short_description: "",
      description: "",
      cover_image_src: "",
      cover_video_src: "",
      start_at: "",
      end_at: "",
      location_name: "",
      address: "",
      metro: "",
      city: "Москва",
      price: "Бесплатно",
      registration_url: "",
      capacity: null,
      custom_page: null,
      is_featured: false,
      publication_status: "draft",
      mdx_content: "",
      seo_title: "",
      meta_description: "",
    };
  }
  return {
    slug: e.slug,
    title: e.title || "",
    short_description: e.short_description || "",
    description: e.description || "",
    cover_image_src: e.cover_image_src || "",
    cover_video_src: e.cover_video_src || "",
    start_at: isoToLocalInput(e.start_at),
    end_at: isoToLocalInput(e.end_at),
    location_name: e.location_name || "",
    address: e.address || "",
    metro: e.metro || "",
    city: e.city || "Москва",
    price: e.price || "",
    registration_url: e.registration_url || "",
    capacity: e.capacity ?? null,
    custom_page: e.custom_page ?? null,
    is_featured: e.is_featured || false,
    publication_status: (e.publication_status as any) || "draft",
    mdx_content: e.mdx_content || "",
    seo_title: e.seo_title || "",
    meta_description: e.meta_description || "",
  };
}

export function EventEditorForm({ initial }: { initial?: EventDetail | null }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [saving, setSaving] = useState(false);

  const isCustomPage = !!form.custom_page;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const buildPayload = (status: "draft" | "published"): EventPayload => ({
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    short_description: form.short_description.trim(),
    description: form.description.trim(),
    cover_image_src: form.cover_image_src.trim(),
    cover_video_src: form.cover_video_src.trim(),
    start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
    end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
    location_name: form.location_name.trim() || null,
    address: form.address.trim() || null,
    metro: form.metro.trim() || null,
    city: form.city.trim() || null,
    price: form.price.trim() || null,
    registration_url: form.registration_url.trim() || null,
    capacity: form.capacity,
    custom_page: form.custom_page,
    is_featured: form.is_featured,
    publication_status: status,
    mdx_content: form.mdx_content,
    seo_title: form.seo_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
  });

  const handleSave = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      toast.error("Название обязательно");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const saved =
        isEdit && initial
          ? await updateEvent(initial.slug, payload)
          : await createEvent(payload);
      toast.success(status === "published" ? "Событие опубликовано" : "Черновик сохранён");
      if (!isEdit) {
        router.replace(`../${saved.slug}/edit`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`Удалить событие «${initial.title}»? Заявки тоже удалятся.`)) return;
    setSaving(true);
    try {
      await deleteEvent(initial.slug);
      toast.success("Удалено");
      router.push("../");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-2 mb-1">
            {isEdit ? "Редактирование события" : "Новое событие"}
          </h1>
          {initial && (
            <p className="text-body-4 text-(--on-bg-low)">
              {initial.publication_status === "published" ? "Опубликовано" : "Черновик"} ·{" "}
              <code className="font-mono">/events/{initial.slug}</code>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEdit && (
            <Button variant="glass-red" size="icon-medium" onClick={handleDelete} disabled={saving}>
              <Trash className="size-4" />
            </Button>
          )}
          <Button variant="outlined" onClick={() => handleSave("draft")} disabled={saving}>
            <FloppyDisk className="size-4" />
            Черновик
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <Rocket className="size-4" />
            Опубликовать
          </Button>
        </div>
      </div>

      {/* Basics */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3">Основное</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="md:col-span-2">
            <FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Slug</FieldLabel>
            <Input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder="генерируется из названия"
            />
          </Field>
          <Field>
            <FieldLabel>Цена</FieldLabel>
            <Input
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="Бесплатно / 500 ₽"
            />
          </Field>
          <Field>
            <FieldLabel>Начало</FieldLabel>
            <Input
              type="datetime-local"
              value={form.start_at}
              onChange={(e) => update("start_at", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Конец (опционально)</FieldLabel>
            <Input
              type="datetime-local"
              value={form.end_at}
              onChange={(e) => update("end_at", e.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Короткое описание</FieldLabel>
            <Textarea
              value={form.short_description}
              onChange={(e) => update("short_description", e.target.value)}
              className="min-h-[60px]"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Полное описание</FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="min-h-[100px]"
            />
          </Field>
        </div>
      </Card>

      {/* Location */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3">Место и регистрация</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Название места</FieldLabel>
            <Input
              value={form.location_name}
              onChange={(e) => update("location_name", e.target.value)}
              placeholder="МЦК КИТС"
            />
          </Field>
          <Field>
            <FieldLabel>Город</FieldLabel>
            <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Адрес</FieldLabel>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Метро</FieldLabel>
            <Input value={form.metro} onChange={(e) => update("metro", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Вместимость</FieldLabel>
            <Input
              type="number"
              value={form.capacity ?? ""}
              onChange={(e) => update("capacity", e.target.value ? Number(e.target.value) : null)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Внешняя ссылка на регистрацию (опционально)</FieldLabel>
            <Input
              value={form.registration_url}
              onChange={(e) => update("registration_url", e.target.value)}
              placeholder="https://forms.yandex.com/… — если пусто, форма на сайте"
            />
          </Field>
        </div>
      </Card>

      {/* Cover */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Обложка</h2>
        <Field>
          <FieldLabel>Изображение</FieldLabel>
          <ImageUploadField
            value={form.cover_image_src}
            onChange={(v) => update("cover_image_src", v)}
          />
        </Field>
        <Field>
          <FieldLabel>Видео-обложка (embed URL)</FieldLabel>
          <Input
            value={form.cover_video_src}
            onChange={(e) => update("cover_video_src", e.target.value)}
          />
        </Field>
      </Card>

      {/* Template */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3">Кастомная страница</h2>
        <Field>
          <FieldLabel>Шаблон</FieldLabel>
          <Select
            value={form.custom_page || "__none__"}
            onValueChange={(v) => update("custom_page", v === "__none__" ? null : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Общий шаблон события</SelectItem>
              {EVENT_CUSTOM_PAGES_META.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {isCustomPage && (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 flex gap-3">
            <Sparkle className="size-5 text-violet-500 shrink-0 mt-0.5" weight="fill" />
            <p className="text-body-4 text-(--on-bg-medium)">
              {EVENT_CUSTOM_PAGES_META.find((m) => m.key === form.custom_page)?.description}
              {" "}MDX и медиа игнорируются — заполните основные поля.
            </p>
          </div>
        )}
      </Card>

      {/* MDX — hidden when a template owns the page */}
      {!isCustomPage && (
        <div className="space-y-3">
          <h2 className="text-heading-3">Содержимое (MDX)</h2>
          <ArticleEditor
            value={form.mdx_content}
            onChange={(v) => update("mdx_content", v)}
            placeholder="Описание события…"
          />
        </div>
      )}

      {/* SEO + flags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">SEO и флаги</h2>
        <Field>
          <FieldLabel>SEO заголовок</FieldLabel>
          <Input value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} />
        </Field>
        <Field>
          <FieldLabel>Meta description</FieldLabel>
          <Textarea
            value={form.meta_description}
            onChange={(e) => update("meta_description", e.target.value)}
            className="min-h-[72px]"
          />
        </Field>
        <div className="flex items-center gap-3 pt-2">
          <Switch
            id="is_featured"
            checked={form.is_featured}
            onCheckedChange={(v) => update("is_featured", v)}
          />
          <Label htmlFor="is_featured">Featured на /events</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="published"
            checked={form.publication_status === "published"}
            onCheckedChange={(v) => update("publication_status", v ? "published" : "draft")}
          />
          <Label htmlFor="published">Опубликовано</Label>
        </div>
      </Card>
    </div>
  );
}
