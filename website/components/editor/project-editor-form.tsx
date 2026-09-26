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
import { EntityPicker, type PickerItem } from "./entity-picker";
import { EntityMultiPicker, type MultiPickerItem } from "./entity-multi-picker";
import { ProjectTagsEditor } from "./project-tags-editor";
import { ProjectMediaUploader } from "./media-uploader";
import { GithubReadmePreview } from "./github-readme-preview";
import {
  CUSTOM_PAGES_META,
  findCustomPageMeta,
} from "@/app/projects/[slug]/_components/custom-pages-meta";
import { ArticleEditor } from "./article-editor";
import { FloppyDiskIcon, RocketIcon, TrashIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  createProject, updateProject, deleteProject,
  type ProjectDetail, type ProjectPayload,
  type ProjectTag, type ProjectMedia,
} from "@/utils/api/projects";
import {
  fetchProjectCategoriesAdmin,
  createProjectCategory,
  type ProjectCategory,
} from "@/utils/api/taxonomies";
import {
  fetchCompanies,
  createCompany,
  type ClientListItem,
} from "@/utils/api/companies";
import { fetchStack, createStackItem, type StackItem } from "@/utils/api/stack";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface FormState {
  slug: string;
  title: string;
  description: string;
  short_description: string;
  cover_image_src: string;
  cover_video_src: string;
  href: string;
  category: { id: string; label: string } | null;
  client: { id: string; label: string } | null;
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
  custom_page: string | null;
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
      category: null,
      client: null,
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
      custom_page: null,
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
    category: p.category ? { id: p.category.id, label: p.category.label } : null,
    client: (p as any).client ? { id: (p as any).client.id, label: (p as any).client.name } : null,
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
    custom_page: p.custom_page ?? null,
  };
}

export function ProjectEditorForm({ initial }: { initial?: ProjectDetail | null }) {
  const router = useRouter();
  const isEdit = !!initial;
  const isPublished = initial?.publication_status === "published";

  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [companies, setCompanies] = useState<ClientListItem[]>([]);
  const [stackPool, setStackPool] = useState<StackItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [stackLoading, setStackLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Use the admin endpoints (they return everything). The public
    // categories endpoint would filter nothing, but admin gives us a
    // consistent shape and a write-capable pairing.
    Promise.all([
      fetchProjectCategoriesAdmin().catch(() => [] as ProjectCategory[]),
      fetchCompanies().catch(() => [] as ClientListItem[]),
      fetchStack().catch(() => [] as StackItem[]),
    ])
      .then(([cats, comps, stk]) => {
        setCategories(cats);
        setCompanies(comps);
        setStackPool(stk);
      })
      .finally(() => {
        setCategoriesLoading(false);
        setCompaniesLoading(false);
        setStackLoading(false);
      });
  }, []);

  // Picker-shaped projections of the fetched lists. Memoised shape, so
  // EntityPicker sees a stable array across renders.
  const categoryItems: PickerItem[] = categories.map((c) => ({
    id: c.id,
    label: c.label,
  }));
  const companyItems: PickerItem[] = companies.map((c) => ({
    id: c.id,
    label: c.name,
    meta: c.industry || null,
  }));
  const stackItems: MultiPickerItem[] = stackPool.map((s) => ({
    id: s.id,
    label: s.name,
    meta: s.usage_count > 0 ? String(s.usage_count) : null,
  }));
  // The form stores stack as names (backend resolves names -> rows). The
  // picker needs id-based items; we bridge by looking up the row for each
  // name in the current pool. A name not in the pool renders as a synthetic
  // id "name:<name>" — the picker still shows it, and creating it on save
  // resolves the collision on the server side.
  const selectedStack: MultiPickerItem[] = form.tech_stack.map((name) => {
    const found = stackPool.find((s) => s.name.toLowerCase() === name.toLowerCase());
    return found
      ? { id: found.id, label: found.name }
      : { id: `name:${name}`, label: name };
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const buildPayload = (status: "draft" | "published"): ProjectPayload => ({
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim(),
    short_description: form.short_description.trim(),
    cover_image_src: form.cover_image_src.trim(),
    cover_video_src: form.cover_video_src.trim(),
    href: form.href.trim() || null,
    category_id: form.category?.id || null,
    client_id: form.client?.id || null,
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
    custom_page: form.custom_page,
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

  // A project with a bespoke template ignores MDX content and media —
  // the template renders its own hard-coded sections. Only the
  // identity fields need to be filled in.
  const isCustomPage = !!form.custom_page;

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
              <TrashIcon className="size-4" />
            </Button>
          )}
          <Button variant="outlined" onClick={() => handleSave("draft")} disabled={saving}>
            <FloppyDiskIcon className="size-4" />
            Сохранить черновик
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving}>
            <RocketIcon className="size-4" />
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
            <FieldLabel>Период</FieldLabel>
            <Input
              value={form.period}
              onChange={(e) => update("period", e.target.value)}
              placeholder="2024 или 2023 — Present"
            />
          </Field>

          {/* Client — chip picker sourced from the companies table. Creating
              a new one persists a Company row immediately, so subsequent
              projects can pick it too. */}
          <Field>
            <FieldLabel>Клиент</FieldLabel>
            <EntityPicker
              value={form.client}
              onChange={(v) => update("client", v as any)}
              items={companyItems}
              loading={companiesLoading}
              placeholder="Найти или создать…"
              emptyText="Нет компаний"
              createNoun="Создать клиента"
              onCreate={async (name) => {
                const c = await createCompany({ name });
                setCompanies((prev) => [...prev, c]);
                return { id: c.id, label: c.name };
              }}
            />
          </Field>

          {/* Category — chip picker sourced from project_categories. Same
              create-on-the-fly behaviour. */}
          <Field>
            <FieldLabel>Категория</FieldLabel>
            <EntityPicker
              value={form.category}
              onChange={(v) => update("category", v as any)}
              items={categoryItems}
              loading={categoriesLoading}
              placeholder="Найти или создать…"
              emptyText="Нет категорий"
              createNoun="Создать категорию"
              onCreate={async (label) => {
                const c = await createProjectCategory(label);
                setCategories((prev) => [...prev, c]);
                return { id: c.id, label: c.label };
              }}
            />
          </Field>

          {/* Bespoke template selector. The list is code-defined on the
              frontend — no backend call required. */}
          <Field className="md:col-span-2">
            <FieldLabel>Кастомная страница</FieldLabel>
            <Select
              value={form.custom_page || "__none__"}
              onValueChange={(v) =>
                update("custom_page", v === "__none__" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  Общий шаблон (по умолчанию)
                </SelectItem>
                {CUSTOM_PAGES_META.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-body-6 text-(--on-bg-low) mt-1">
              {findCustomPageMeta(form.custom_page)?.description ||
                "Общий премиальный шаблон кейса. Выбирайте один из готовых, если проект должен выглядеть иначе."}
            </p>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Платформа</FieldLabel>
            <Input
              value={form.platform}
              onChange={(e) => update("platform", e.target.value)}
              placeholder="Web · iOS · Android · Brand system · …"
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

      {/* Stack */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-3">
        <h2 className="text-heading-3">Стек</h2>
        <p className="text-body-4 text-(--on-bg-medium)">
          Технологии и инструменты проекта. Выбирайте из списка или создавайте новые.
        </p>
        <EntityMultiPicker
          value={selectedStack}
          onChange={(next) => {
            // Persist names, not ids — the backend resolves names to rows
            // and creates any that don't exist yet.
            update("tech_stack", next.map((n) => n.label));
          }}
          items={stackItems}
          loading={stackLoading}
          placeholder="Figma, Blender, Next.js…"
          createNoun="Добавить в стек"
          onCreate={async (name) => {
            const created = await createStackItem(name);
            setStackPool((prev) => [...prev, created]);
            return { id: created.id, label: created.name };
          }}
        />
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

      {/* Media gallery — hidden when a premade template owns the visuals. */}
      {!isCustomPage && (
        <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4">
          <div>
            <h2 className="text-heading-3 mb-1">Медиа</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Изображения и короткие видео до 10 МБ. Автоматически рендерятся в галерее на странице проекта.
            </p>
          </div>
          <ProjectMediaUploader value={form.media} onChange={(v) => update("media", v)} />
        </Card>
      )}

      {/* Content — hidden when a premade template is selected. */}
      {!isCustomPage && (
        <div className="space-y-3">
          <h2 className="text-heading-3">Содержимое (MDX)</h2>
          <ArticleEditor
            value={form.mdx_content}
            onChange={(v) => update("mdx_content", v)}
            placeholder="Опишите процесс, результаты, добавьте галереи и метрики…"
          />
        </div>
      )}

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
