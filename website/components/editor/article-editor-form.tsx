"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Sparkles, Save, Rocket, Trash2, Undo2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { ArticleEditor } from "./article-editor";
import { TagsInput } from "./tags-input";
import { ImageUploadField } from "./image-upload-field";
import {
  Article,
  ArticlePayload,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
} from "@/utils/api/articles";
import { fetchArticleCategories, type ArticleCategory } from "@/utils/api/categories";

interface FormState {
  title: string;
  slug: string;
  description: string;
  image_url: string;
  date: string;
  tags: string[];
  category_id: string;
  mdx_content: string;
  seo_title: string;
  meta_description: string;
  raw_json: string;
}

function toFormState(article?: Article | null): FormState {
  if (!article) {
    return {
      title: "",
      slug: "",
      description: "",
      image_url: "",
      date: new Date().toISOString().slice(0, 10),
      tags: [],
      category_id: "",
      mdx_content: "",
      seo_title: "",
      meta_description: "",
      raw_json: "",
    };
  }
  return {
    title: article.title || "",
    slug: article.slug || "",
    description: article.description || "",
    image_url: article.image_url || "",
    date: (article.date || new Date().toISOString()).slice(0, 10),
    tags: article.tags || [],
    category_id: article.category_id || "",
    mdx_content: article.mdx_content || "",
    seo_title: article.seo_title || "",
    meta_description: article.meta_description || "",
    raw_json: article.raw_json ? JSON.stringify(article.raw_json, null, 2) : "",
  };
}

export function ArticleEditorForm({ initial }: { initial?: Article | null }) {
  const { t } = useLanguage();
  const router = useRouter();
  const isEdit = !!initial;
  const isPublished = initial?.publication_status === "published";

  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    fetchArticleCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const applyAiJson = () => {
    if (!form.raw_json.trim()) {
      toast.error(t("editor.ai_empty"));
      return;
    }
    let parsed: any;
    try {
      parsed = JSON.parse(form.raw_json);
    } catch {
      toast.error(t("editor.ai_invalid"));
      return;
    }
    setForm((prev) => ({
      ...prev,
      title: typeof parsed.title === "string" ? parsed.title : prev.title,
      slug: typeof parsed.slug === "string" ? parsed.slug : prev.slug,
      description: typeof parsed.description === "string" ? parsed.description : prev.description,
      image_url: typeof parsed.image_url === "string" ? parsed.image_url : prev.image_url,
      mdx_content:
        typeof parsed.mdx_content === "string"
          ? parsed.mdx_content
          : typeof parsed.content === "string"
          ? parsed.content
          : typeof parsed.body === "string"
          ? parsed.body
          : prev.mdx_content,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags
        : typeof parsed.tags === "string"
        ? parsed.tags.split(",").map((v: string) => v.trim()).filter(Boolean)
        : prev.tags,
      seo_title: typeof parsed.seo_title === "string" ? parsed.seo_title : prev.seo_title,
      meta_description:
        typeof parsed.meta_description === "string" ? parsed.meta_description : prev.meta_description,
    }));
    toast.success(t("editor.ai_applied"));
  };

  const buildPayload = (status: "draft" | "published"): ArticlePayload => {
    let rawJson: any = undefined;
    if (form.raw_json.trim()) {
      try {
        rawJson = JSON.parse(form.raw_json);
      } catch {
        throw new Error(t("editor.ai_invalid"));
      }
    }
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      date: form.date ? new Date(form.date).toISOString() : undefined,
      tags: form.tags,
      mdx_content: form.mdx_content,
      raw_json: rawJson,
      seo_title: form.seo_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      category_id: form.category_id || null,
      publication_status: status,
    };
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      toast.error(t("editor.missing_title"));
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(status);
      const saved = isEdit && initial
        ? await updateArticle(initial.slug, payload)
        : await createArticle(payload);
      toast.success(status === "published" ? t("editor.published") : t("editor.saved"));
      if (!isEdit) {
        router.replace(`/app/profile/articles/${saved.slug}/edit`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || t("editor.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  // Toggle only makes sense on an already-published article — moving it back
  // to drafts. The draft → published direction is handled by the primary
  // save button (which does save + publish in one call).
  const handleUnpublish = async () => {
    if (!initial) return;
    setSaving(true);
    try {
      await unpublishArticle(initial.slug);
      toast.success(t("editor.unpublished"));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || t("editor.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(t("editor.delete_confirm"))) return;
    setSaving(true);
    try {
      await deleteArticle(initial.slug);
      toast.success(t("editor.deleted"));
      router.replace("/app/profile/articles");
    } catch (err: any) {
      toast.error(err.message || t("editor.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-2 mb-1">
            {isEdit ? t("editor.form_title_edit") : t("editor.form_title_new")}
          </h1>
          {initial && (
            <p className="text-body-4 text-(--on-bg-low)">
              {isPublished ? t("editor.status_published") : t("editor.status_draft")}
            </p>
          )}
        </div>

        {/*
          Action rules per state — exactly one primary (blue) and one
          secondary (outlined) button at a time. No duplicate labels.

            published → [Unpublish] [Delete] [Save changes]
            draft     → [Save draft] [Delete] [Publish]
            new       → [Save draft] [Publish]
        */}
        <div className="flex flex-wrap items-center gap-2">
          {isEdit && isPublished && (
            <>
              <Button variant="outlined" onClick={handleUnpublish} disabled={saving}>
                <Undo2 className="size-4" />
                {t("editor.unpublish")}
              </Button>
              <Button
                variant="glass-red"
                size="icon-medium"
                onClick={handleDelete}
                disabled={saving}
                aria-label={t("editor.delete")}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button onClick={() => handleSave("published")} disabled={saving}>
                <Save className="size-4" />
                {t("editor.save_changes")}
              </Button>
            </>
          )}

          {isEdit && !isPublished && (
            <>
              <Button variant="outlined" onClick={() => handleSave("draft")} disabled={saving}>
                <Save className="size-4" />
                {t("editor.save_draft")}
              </Button>
              <Button
                variant="glass-red"
                size="icon-medium"
                onClick={handleDelete}
                disabled={saving}
                aria-label={t("editor.delete")}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button onClick={() => handleSave("published")} disabled={saving}>
                <Rocket className="size-4" />
                {t("editor.publish")}
              </Button>
            </>
          )}

          {!isEdit && (
            <>
              <Button variant="outlined" onClick={() => handleSave("draft")} disabled={saving}>
                <Save className="size-4" />
                {t("editor.save_draft")}
              </Button>
              <Button onClick={() => handleSave("published")} disabled={saving}>
                <Rocket className="size-4" />
                {t("editor.publish")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metadata */}
      <Card className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 space-y-4">
        <h2 className="text-heading-3">{t("editor.section_meta")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.field_title")}</FieldLabel>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder={t("editor.field_title_ph")}
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.field_slug")}</FieldLabel>
            <Input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder={t("editor.field_slug_ph")}
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.field_date")}</FieldLabel>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.field_description")}</FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder={t("editor.field_description_ph")}
              className="min-h-[72px]"
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.field_image")}</FieldLabel>
            <ImageUploadField
              value={form.image_url}
              onChange={(v) => update("image_url", v)}
              placeholder={t("editor.field_image_ph")}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel>{t("editor.field_tags")}</FieldLabel>
            <TagsInput
              value={form.tags}
              onChange={(v) => update("tags", v)}
              placeholder={t("editor.field_tags_ph")}
            />
          </Field>
          <Field>
            <FieldLabel>{t("editor.field_category")}</FieldLabel>
            <Select
              value={form.category_id || "none"}
              onValueChange={(v) => update("category_id", v === "none" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("editor.field_category_ph")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Card>

      {/* AI payload */}
      <Card className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 space-y-3">
        <button
          type="button"
          className="flex items-center justify-between w-full"
          onClick={() => setAiOpen((v) => !v)}
        >
          <span className="flex items-center gap-2 text-heading-3">
            <Sparkles className="size-4 text-(--primary)" />
            {t("editor.section_ai")}
          </span>
          {aiOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {aiOpen && (
          <>
            <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">{t("editor.ai_hint")}</p>
            <Textarea
              value={form.raw_json}
              onChange={(e) => update("raw_json", e.target.value)}
              className="min-h-[200px] font-mono text-xs"
              placeholder={`{\n  "title": "...",\n  "description": "...",\n  "tags": ["..."],\n  "mdx_content": "## Heading\\n\\nBody..."\n}`}
            />
            <div>
              <Button variant="outlined" size="small" onClick={applyAiJson}>
                <Sparkles className="size-3.5" />
                {t("editor.ai_apply")}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Content */}
      <div className="space-y-3">
        <h2 className="text-heading-3">{t("editor.section_content")}</h2>
        <ArticleEditor
          value={form.mdx_content}
          onChange={(v) => update("mdx_content", v)}
          placeholder={t("editor.placeholder")}
        />
      </div>

      {/* SEO */}
      <Card className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 space-y-3">
        <button
          type="button"
          className="flex items-center justify-between w-full"
          onClick={() => setSeoOpen((v) => !v)}
        >
          <span className="text-heading-3">{t("editor.section_seo")}</span>
          {seoOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        {seoOpen && (
          <div className="grid grid-cols-1 gap-3">
            <Field>
              <FieldLabel>{t("editor.field_seo_title")}</FieldLabel>
              <Input value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>{t("editor.field_seo_description")}</FieldLabel>
              <Textarea
                value={form.meta_description}
                onChange={(e) => update("meta_description", e.target.value)}
                className="min-h-[72px]"
              />
            </Field>
          </div>
        )}
      </Card>
    </div>
  );
}
