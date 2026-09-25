"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus, MagnifyingGlass, ArrowClockwise, CircleNotch,
  PencilSimple, ArrowSquareOut, Cube,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fetchAdminProjects, type ProjectListAdmin } from "@/utils/api/projects";
import { useAdminSecret } from "@/hooks/use-admin-secret";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; projects: ProjectListAdmin[] }
  | { kind: "error"; message: string };

export default function AdminProjectsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const projects = await fetchAdminProjects({ q: debouncedQuery || undefined });
      setState({ kind: "ready", projects });
    } catch (err: any) {
      setState({ kind: "error", message: err?.message || "Ошибка загрузки" });
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }

  const base = `/admin/${secret}/projects`;
  const projects = state.kind === "ready" ? state.projects : [];

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Проекты</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {state.kind === "ready" ? `${projects.length} проектов` : "Загрузка…"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outlined" size="small" onClick={load}>
              {state.kind === "loading"
                ? <CircleNotch className="size-4 animate-spin" />
                : <ArrowClockwise className="size-4" />}
              Обновить
            </Button>
            <Button asChild>
              <Link href={`${base}/new`}>
                <Plus className="size-4" />
                Новый проект
              </Link>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="rounded-3xl border-(--outline) p-4">
          <div className="relative">
            <MagnifyingGlass className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию…"
              className="pl-9"
            />
          </div>
        </Card>

        {/* Loading */}
        {state.kind === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-(--outline) aspect-[16/10] animate-pulse bg-muted/30" />
            ))}
          </div>
        )}

        {/* Error */}
        {state.kind === "error" && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6">
            <p className="text-body-4 text-(--error) mb-3">{state.message}</p>
            <Button variant="outlined" size="small" onClick={load}>Повторить</Button>
          </Card>
        )}

        {/* Empty */}
        {state.kind === "ready" && projects.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Cube className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">Пока нет проектов.</p>
            <Button asChild>
              <Link href={`${base}/new`}>
                <Plus className="size-4" />
                Создать первый проект
              </Link>
            </Button>
          </Card>
        )}

        {/* Grid */}
        {state.kind === "ready" && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="group relative rounded-3xl border-(--outline) bg-(--card) overflow-hidden transition-all hover:border-(--primary)/40"
              >
                <Link href={`${base}/${p.slug}/edit`} className="block">
                  <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                    {p.cover_image_src ? (
                      <Image
                        src={p.cover_image_src}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                      <Badge
                        variant="glass-static"
                        size="chip-small"
                        className={cn(
                          "text-white border-white/20",
                          p.publication_status === "published"
                            ? "bg-emerald-500/40"
                            : "bg-amber-500/40"
                        )}
                      >
                        {p.publication_status === "published" ? "Опубликован" : "Черновик"}
                      </Badge>
                      {p.is_featured && (
                        <Badge variant="glass-static" size="chip-small" className="text-white border-white/20">
                          ★
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-heading-4 truncate">{p.title}</h3>
                      {p.category?.label && (
                        <p className="text-body-5 text-white/70">{p.category.label}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="text-body-5 text-(--on-bg-low) flex items-center gap-3">
                      {p.period && <span>{p.period}</span>}
                      {p.media_count > 0 && <span>{p.media_count} медиа</span>}
                    </div>
                    <div className="flex gap-1">
                      {p.publication_status === "published" && (
                        <Button variant="text" size="icon-small" asChild title="Открыть на сайте">
                          <Link href={`/projects/${p.slug}`} target="_blank">
                            <ArrowSquareOut className="size-4" />
                          </Link>
                        </Button>
                      )}
                      <PencilSimple className="size-4 text-(--on-bg-low)" />
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CheckUser>
  );
}
