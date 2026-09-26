"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus, MagnifyingGlassIcon, PencilSimple, Trash,
  CircleNotchIcon, FolderSimple, Tag as TagIcon, Stack as StackIcon,
  Users as UsersIcon, Newspaper,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  fetchCatalog, deleteCatalogItem,
  type CatalogItem, type CatalogName,
} from "@/utils/api/catalog";
import { useDialogParam } from "@/hooks/use-dialog-param";
import { CatalogItemDialog } from "./_components/catalog-item-dialog";

interface CatalogDef {
  id: CatalogName;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  supportsKind?: boolean;
}

const CATALOGS: CatalogDef[] = [
  {
    id: "project-categories",
    label: "Категории проектов",
    description: "Используются для фильтрации /projects и в карточках проектов.",
    icon: FolderSimple,
  },
  {
    id: "project-roles",
    label: "Роли на проектах",
    description: "Что человек делал на проекте (Backend, Art Direction, …).",
    icon: UsersIcon,
  },
  {
    id: "stack",
    label: "Стек",
    description: "Технологии и инструменты, выбираемые в редакторе проектов.",
    icon: StackIcon,
  },
  {
    id: "article-categories",
    label: "Категории статей",
    description: "Рубрики для журнала.",
    icon: Newspaper,
  },
  {
    id: "tags",
    label: "Теги",
    description: "Свободные метки для статей. Различаются по типу.",
    icon: TagIcon,
    supportsKind: true,
  },
];

function CatalogPageInner() {
  const { user, isLoading: userLoading } = useUser();
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get("tab") as CatalogName | null) ?? "project-categories";
  const active = useMemo(
    () => CATALOGS.find((c) => c.id === tabParam) ?? CATALOGS[0],
    [tabParam],
  );

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const editDialog = useDialogParam("edit");
  const newDialog = useDialogParam("new");
  const itemById = useMemo(() => {
    const m = new Map<string, CatalogItem>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);
  const editing = editDialog.value ? itemById.get(editDialog.value) ?? null : null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCatalog(active.id);
      setItems(data);
    } catch (e: any) {
      toast.error(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [active.id]);

  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => { setQuery(""); }, [active.id]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") return null;

  const filtered = query.trim()
    ? items.filter((i) => {
        const q = query.toLowerCase();
        return (
          i.labels.en?.toLowerCase().includes(q) ||
          i.labels.ru?.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q)
        );
      })
    : items;

  const handleDelete = async (item: CatalogItem) => {
    if (!confirm(`Удалить «${item.labels.en || item.code}»?`)) return;
    try {
      await deleteCatalogItem(active.id, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Удалено");
    } catch (e: any) {
      toast.error(e?.message || "Ошибка");
    }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-1">Каталоги</h1>
          <p className="text-body-3 text-(--on-bg-medium)">
            Управление всеми справочниками приложения. Каждая запись имеет код
            (слаг) и название на одном или нескольких языках.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATALOGS.map((c) => {
            const Icon = c.icon;
            const isActive = c.id === active.id;
            return (
              <Button
                key={c.id}
                variant={isActive ? "filled" : "tonal-card"}
                size="medium"
                shape="round"
                asChild
              >
                <a href={`?tab=${c.id}`}>
                  <Icon className="size-4" />
                  {c.label}
                </a>
              </Button>
            );
          })}
        </div>

        {/* Header row for the active catalog */}
        <Card className="rounded-3xl border-(--outline) bg-(--card) p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-heading-3 mb-1">{active.label}</h2>
              <p className="text-body-4 text-(--on-bg-medium)">{active.description}</p>
            </div>
            <Button onClick={() => newDialog.open("new")} className="shrink-0">
              <Plus className="size-4" />
              Добавить
            </Button>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию или коду…"
              className="pl-9"
            />
          </div>
        </Card>

        {/* List */}
        {loading ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <CircleNotchIcon className="size-5 animate-spin mx-auto text-(--on-bg-low)" />
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">
              {query ? "Ничего не найдено." : "Пока ничего нет. Добавьте первую запись."}
            </p>
          </Card>
        ) : (
          <Card className="rounded-3xl border-(--outline) bg-(--card) divide-y divide-(--outline) overflow-hidden">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center p-4"
              >
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                    Code
                  </div>
                  <code className="text-body-4 font-mono text-(--on-bg-high) truncate">
                    {item.code}
                  </code>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                    English
                  </div>
                  <p className="text-body-4 text-(--on-bg-high) truncate">
                    {item.labels.en || "—"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                      Русский
                    </div>
                    <p className="text-body-4 text-(--on-bg-high) truncate">
                      {item.labels.ru || "—"}
                    </p>
                  </div>
                  {active.supportsKind && item.kind && (
                    <Badge variant="tonal-card-static" size="chip-small">
                      {item.kind}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-1 justify-end">
                  <Button
                    variant="text"
                    size="icon-small"
                    onClick={() => editDialog.open(item.id)}
                    title="Редактировать"
                  >
                    <PencilSimple className="size-4" />
                  </Button>
                  <Button
                    variant="text"
                    size="icon-small"
                    onClick={() => handleDelete(item)}
                    title="Удалить"
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Edit dialog — driven by ?edit=<id> */}
      <CatalogItemDialog
        catalog={active.id}
        item={editing}
        open={editDialog.isOpen && !!editing}
        onOpenChange={(o) => (o ? undefined : editDialog.close())}
        onSaved={load}
        supportsKind={active.supportsKind}
      />

      {/* Create dialog — driven by ?new=new */}
      <CatalogItemDialog
        catalog={active.id}
        item={null}
        open={newDialog.isOpen}
        onOpenChange={(o) => (o ? undefined : newDialog.close())}
        onSaved={load}
        supportsKind={active.supportsKind}
      />
    </CheckUser>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={null}>
      <CatalogPageInner />
    </Suspense>
  );
}
