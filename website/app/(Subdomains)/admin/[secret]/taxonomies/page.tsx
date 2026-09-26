"use client";
import { useCallback, useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus, Trash, PencilSimple, X, Check, CircleNotchIcon,
  FolderSimple, UserList,
} from "@phosphor-icons/react";
import {
  fetchProjectCategoriesAdmin, createProjectCategory, updateProjectCategory, deleteProjectCategory,
  fetchProjectRolesAdmin, createProjectRole, updateProjectRole, deleteProjectRole,
  type Taxonomy,
} from "@/utils/api/taxonomies";

const LANG_HINTS: { code: string; label: string }[] = [
  { code: "en", label: "English (required)" },
  { code: "ru", label: "Русский" },
];

interface Draft {
  labels: Record<string, string>;
}

function emptyDraft(): Draft {
  return { labels: { en: "", ru: "" } };
}

export default function TaxonomiesPage() {
  const { user, isLoading: userLoading } = useUser();
  const [tab, setTab] = useState<"categories" | "roles">("categories");
  const [rows, setRows] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft());

  const isCategory = tab === "categories";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = isCategory
        ? await fetchProjectCategoriesAdmin()
        : await fetchProjectRolesAdmin();
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [isCategory]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") return null;

  const handleCreate = async () => {
    const en = draft.labels.en.trim();
    if (!en) { toast.error("English label обязателен"); return; }
    try {
      const labels: Record<string, string> = { en };
      if (draft.labels.ru?.trim()) labels.ru = draft.labels.ru.trim();
      const created = isCategory
        ? await createProjectCategory({ labels })
        : await createProjectRole({ labels });
      setRows((prev) => [...prev, created]);
      setDraft(emptyDraft());
      toast.success("Создано");
    } catch (e: any) {
      toast.error(e?.message || "Ошибка");
    }
  };

  const startEdit = (t: Taxonomy) => {
    setEditingId(t.id);
    setEditDraft({ labels: { en: t.labels.en || "", ru: t.labels.ru || "" } });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const en = editDraft.labels.en.trim();
    if (!en) { toast.error("English label обязателен"); return; }
    try {
      const labels: Record<string, string> = { en };
      if (editDraft.labels.ru?.trim()) labels.ru = editDraft.labels.ru.trim();
      const updated = isCategory
        ? await updateProjectCategory(editingId, { labels })
        : await updateProjectRole(editingId, { labels });
      setRows((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
      setEditingId(null);
      toast.success("Сохранено");
    } catch (e: any) {
      toast.error(e?.message || "Ошибка");
    }
  };

  const handleDelete = async (t: Taxonomy) => {
    if (!confirm(`Удалить «${t.labels.en || t.code}»?`)) return;
    try {
      if (isCategory) await deleteProjectCategory(t.id);
      else await deleteProjectRole(t.id);
      setRows((prev) => prev.filter((r) => r.id !== t.id));
      toast.success("Удалено");
    } catch (e: any) {
      toast.error(e?.message || "Ошибка");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Таксономии</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Категории и роли проектов. Используются для фильтрации и на страницах
            экспертов. Каждая запись имеет код (слаг) и название на одном или
            нескольких языках.
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex gap-1 rounded-full border border-(--outline) bg-(--card) p-1">
          {([
            { id: "categories", label: "Категории", icon: FolderSimple },
            { id: "roles", label: "Роли", icon: UserList },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                (tab === id
                  ? "bg-(--on-bg-high) text-(--bg)"
                  : "text-(--on-bg-medium) hover:bg-(--state-hover)")
              }
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Create form */}
        <Card className="rounded-3xl border-(--outline) bg-(--card) p-5">
          <h2 className="text-heading-4 mb-4">Создать</h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
            {LANG_HINTS.map((l) => (
              <Input
                key={l.code}
                value={draft.labels[l.code] || ""}
                onChange={(e) =>
                  setDraft((d) => ({ labels: { ...d.labels, [l.code]: e.target.value } }))
                }
                placeholder={l.label}
              />
            ))}
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              Добавить
            </Button>
          </div>
        </Card>

        {/* List */}
        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        ) : rows.length === 0 ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">
              Пока ничего нет. Добавьте первую запись выше.
            </p>
          </Card>
        ) : (
          <Card className="rounded-3xl border-(--outline) bg-(--card) divide-y divide-(--outline) overflow-hidden">
            {rows.map((t) => {
              const isEditing = editingId === t.id;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center p-4"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                      Code
                    </div>
                    <code className="text-body-4 font-mono text-(--on-bg-high) truncate">
                      {t.code}
                    </code>
                  </div>

                  {isEditing ? (
                    <>
                      {LANG_HINTS.map((l) => (
                        <Input
                          key={l.code}
                          value={editDraft.labels[l.code] || ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              labels: { ...d.labels, [l.code]: e.target.value },
                            }))
                          }
                          placeholder={l.label}
                        />
                      ))}
                      <div className="flex gap-1">
                        <Button variant="text" size="icon-small" onClick={saveEdit} title="Сохранить">
                          <Check className="size-4" />
                        </Button>
                        <Button
                          variant="text"
                          size="icon-small"
                          onClick={() => setEditingId(null)}
                          title="Отмена"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                          English
                        </div>
                        <p className="text-body-4 text-(--on-bg-high) truncate">
                          {t.labels.en || "—"}
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                          Русский
                        </div>
                        <p className="text-body-4 text-(--on-bg-high) truncate">
                          {t.labels.ru || "—"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="text"
                          size="icon-small"
                          onClick={() => startEdit(t)}
                          title="Редактировать"
                        >
                          <PencilSimple className="size-4" />
                        </Button>
                        <Button
                          variant="text"
                          size="icon-small"
                          onClick={() => handleDelete(t)}
                          title="Удалить"
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </CheckUser>
  );
}
