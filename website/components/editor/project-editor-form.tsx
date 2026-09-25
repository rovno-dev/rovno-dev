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
import { ImageUploadField } from "./image-upload-field";
import { ProjectTagsEditor } from "./project-tags-editor";
import { ProjectMediaUploader } from "./media-uploader";
import { GithubReadmePreview } from "./github-readme-preview";
import { ArticleEditor } from "./article-editor";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FloppyDisk, Rocket, Trash, Plus, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  createProject, updateProject, deleteProject,
  type ProjectDetail, type ProjectPayload,
  type ProjectTag, type ProjectMedia,
} from "@/utils/api/projects";
import { fetchProjectCategories, type ProjectCategory } from "@/utils/api/categories";

interface FormState {
  slug: string;
  title: string;
  description: string;
  short_description: string;
  cover_image_src: string;
  cover_video_src: string;
  href: string;
  category_id: string;
  platform: string;
  period: string;
  tech_stack: string[];
  mdx_content: string;
  seo_title: string;
  meta_description: string;
  is_featured: boolean;
  publication_status: "draft" | "published";
  tags: ProjectTag[];
  media: ProjectMedia[];
}

function toFormState(p?: ProjectDetail | null): FormState {
  if (!p) {
    return {
      slug: "",
      title: "",
      description: "",
      short_description: "",
      cover_image_src: "",
      cover_video_src: "",
      href: "",
      category_id: "",
      platform: "",
      period: String(new Date().getFullYear()),
      tech_stack: [],
      mdx_content: "",
      seo_title: "",
      meta_description: "",
      is_featured: false,
      publication_status: "draft",
      tags: [],
      media: [],
    };
  }
  return {
    slug: p.slug,
    title: p.title || "",
    description: p.description || "",
    short_description: p.short_description || "",
    cover_image_src: p.cover_image_src || "",
    cover_video_src: p.cover_video_src || "",
    href: p.href || "",
    category_id: p.category?.id || "",
    platform: p.platform || "",
    period: p.period || "",
    tech_stack: p.tech_stack || [],
    mdx_content: p.mdx_content || "",
    seo_title: p.seo_title || "",
    meta_description: p.meta_description || "",
    is_featured: p.is_featured || false,
    publication_status: (p.publication_status as any) || "draft",
    tags: p.tags || [],
    media: p.media || [],
  };
}

export function ProjectEditorForm({ initial }: { initial?: ProjectDetail | null }) {
  const router = useRouter();
  const isEdit = !!initial;
  const isPublished = initial?.publication_status === "published";

  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [techDraft, setTechDraft] = useState("");

  useEffect(() => {
    fetchProjectCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const addTech = () => {
    const t = techDraft.trim();
    if (!t) return;
    if (form.tech_stack.includes(t)) { setTechDraft(""); return; }
    update("tech_stack", [...form.tech_stack, t]);
    setTechDraft("");
  };

  const removeTech = (t: string) =>
    update("tech_stack", form.tech_stack.filter((x) => x !== t));

  const buildPayload = (status: "draft" | "published"): ProjectPayload => ({
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    short_description: form.short_description.trim(),
    cover_image_src: form.cover_image_src.trim(),
    cover_video_src: form.cover_video_src.trim(),
    href: form.href.trim() || null,
    category_id: form.category_id || null,
    platform: form.platform.trim() || null,
    period: form.period.trim() || null,
    tech_stack: form.tech_stack,
    mdx_content: form.mdx_content,
    seo_title: form.seo_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
    is_featured: form.is_featured,
    publication_status: status,
    tags: form.tags,
    media: form.media,
  });

  const handleSave = async (status: "draft" | "published") => {
    if (!form.title.trim()) { toast.error("Заголовок обязателен"); return; }
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const saved = isEdit && initial
        ? await updateProject(initial.slug, payload)
        : await createProject(payload);
      toast.success(status === "published" ? "Проект опубликован" : "Проект сохранён");
      if (!isEdit) router.replace(`/admin/secret-placeholder/projects/${saved.slug}/edit`);
      else router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`Удалить проект «${initial.title}»? Действие нельзя отменить.`)) return;
    setSaving(true);
    try {
      await deleteProject(initial.slug);
      toast.success("Проект удалён");
      router.push("../");
    } catch (err: any) {
      toast.error(err?.message || "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  const githubTags = form.tags.filter((t) => t.kind === "github");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-2 mb-1">
            {isEdit ? "Редактирование проекта" : "Новый проект"}
          </h1>
          {initial && (
            <p className="text-body-4 text-(--on-bg-low)">
              {isPublished ? "Опубликован" : "Черновик"} ·{" "}
              <code className="font-mono">/{initial.slug}</code>
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
            Сохранить черновик
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <Rocket className="size-4" />
            {isPublished ? "Сохранить и опубликовать" : "Опубликовать"}
          </Button>
        </div>
      </div>

      {/* Basics */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Основное</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="md:col-span-2">
            <FieldLabel>Название <span className="text-destructive">*</span></FieldLabel>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Например: ALX — Чужой"
            />
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
            <FieldLabel>Клиент / бренд</FieldLabel>
            <Input
              value={form.platform}
              onChange={(e) => update("platform", e.target.value)}
              placeholder="Веб-сайт / мобильное приложение"
            />
          </Field>
          <Field>
            <FieldLabel>Категория</FieldLabel>
            <Select
              value={form.category_id || "none"}
              onValueChange={(v) => update("category_id", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Период</FieldLabel>
            <Input
              value={form.period}
              onChange={(e) => update("period", e.target.value)}
              placeholder="2024 или 2023 — Present"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Короткое описание</FieldLabel>
            <Textarea
              value={form.short_description}
              onChange={(e) => update("short_description", e.target.value)}
              placeholder="Одно предложение для карточки проекта в списке"
              className="min-h-[60px]"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Полное описание</FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Развёрнутое описание для страницы проекта"
              className="min-h-[100px]"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>Ссылка на оригинал (href)</FieldLabel>
            <Input
              value={form.href}
              onChange={(e) => update("href", e.target.value)}
              placeholder="https://dprofile.ru/case/…"
            />
          </Field>
        </div>
      </Card>

      {/* Cover */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Обложка</h2>
        <Field>
          <FieldLabel>Изображение обложки</FieldLabel>
          <ImageUploadField
            value={form.cover_image_src}
            onChange={(v) => update("cover_image_src", v)}
            placeholder="/uploads/media/… или https://…"
          />
        </Field>
        <Field>
          <FieldLabel>Видео-обложка (embed URL, опционально)</FieldLabel>
          <Input
            value={form.cover_video_src}
            onChange={(e) => update("cover_video_src", e.target.value)}
            placeholder="https://kinescope.io/… или https://youtube.com/embed/…"
          />
        </Field>
      </Card>

      {/* Tech stack */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-3">
        <h2 className="text-heading-3">Стек</h2>
        <div className="flex flex-wrap gap-2">
          {form.tech_stack.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-(--primary-card) px-2.5 py-1 text-xs font-medium text-(--primary)"
            >
              {t}
              <button type="button" onClick={() => removeTech(t)} className="hover:opacity-70">
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={techDraft}
            onChange={(e) => setTechDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTech(); }
            }}
            placeholder="Figma, Blender, Next.js…"
            className="flex-1"
          />
          <Button type="button" variant="outlined" onClick={addTech}>
            <Plus className="size-4" />
          </Button>
        </div>
      </Card>

      {/* Project tags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3 mb-1">Метки проекта</h2>
          <p className="text-body-4 text-(--on-bg-medium)">
            «From Chief», лицензия, GitHub-репозиторий, произвольные метки.
          </p>
        </div>
        <ProjectTagsEditor value={form.tags} onChange={(v) => update("tags", v)} />
        {githubTags.map((t, i) =>
          t.value?.repo ? (
            <GithubReadmePreview key={i} repo={t.value.repo} branch={t.value.branch} />
          ) : null
        )}
      </Card>

      {/* Media gallery */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <div>
          <h2 className="text-heading-3 mb-1">Медиа</h2>
          <p className="text-body-4 text-(--on-bg-medium)">
            Изображения и короткие видео до 10 МБ. Автоматически рендерятся в галерее на странице проекта.
          </p>
        </div>
        <ProjectMediaUploader value={form.media} onChange={(v) => update("media", v)} />
      </Card>

      {/* Content */}
      <div className="space-y-3">
        <h2 className="text-heading-3">Содержимое (MDX)</h2>
        <ArticleEditor
          value={form.mdx_content}
          onChange={(v) => update("mdx_content", v)}
          placeholder="Опишите процесс, результаты, добавьте галереи и метрики…"
        />
      </div>

      {/* SEO */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">SEO</h2>
        <div className="grid grid-cols-1 gap-3">
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
        </div>
      </Card>

      {/* Flags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
        <h2 className="text-heading-3">Флаги</h2>
        <div className="flex items-center gap-3">
          <Switch
            id="is_featured"
            checked={form.is_featured}
            onCheckedChange={(v) => update("is_featured", v)}
          />
          <Label htmlFor="is_featured">Показывать в избранных на главной</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="published"
            checked={form.publication_status === "published"}
            onCheckedChange={(v) => update("publication_status", v ? "published" : "draft")}
          />
          <Label htmlFor="published">Опубликован</Label>
        </div>
      </Card>
    </div>
  );
}
