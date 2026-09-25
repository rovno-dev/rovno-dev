"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { CheckUser } from "@/entities/user/model/check-user";
import { ProjectEditorForm } from "@/components/editor/project-editor-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowClockwiseIcon, WarningIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { fetchAdminProject, type ProjectDetail } from "@/utils/api/projects";
import { useAdminSecret } from "@/hooks/use-admin-secret";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js hands us the already-decoded slug. Run it through
  // decodeURIComponent anyway — it's idempotent on unencoded strings and it
  // covers the case where a stale client cached a percent-encoded URL.
  const { slug: rawSlug } = use(params);
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    /* leave as-is if it wasn't valid encoding */
  }

  const { secret } = useAdminSecret();
  const listHref = secret ? `/admin/${secret}/projects` : "/admin";

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAdminProject(slug)
      .then((p) => {
        if (!p) setError("Такого проекта нет");
        else setProject(p);
      })
      .catch((err) => setError(err?.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <CheckUser>
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center gap-2 text-body-3 text-(--on-bg-low)">
          <CircleNotchIcon className="size-4 animate-spin" />
          Loading…
        </div>
      ) : project ? (
        <ProjectEditorForm initial={project} />
      ) : (
        <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-(--error-card) text-(--error)">
              <WarningIcon className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-heading-4 text-(--on-bg-high) mb-1">
                {error || "Проект не найден"}
              </h2>
              <p className="text-body-4 text-(--on-bg-medium) mb-1">
                Запрошенный slug:
              </p>
              <code className="block text-body-4 font-mono text-(--on-bg-high) bg-(--bg) rounded-lg px-3 py-1.5 mb-4 break-all">
                {slug}
              </code>
              <div className="flex flex-wrap gap-2">
                <Button variant="outlined" size="small" asChild>
                  <Link href={listHref}>
                    <ArrowLeft className="size-4" />
                    К списку проектов
                  </Link>
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => window.location.reload()}
                >
                  <ArrowClockwiseIcon className="size-4" />
                  Обновить
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </CheckUser>
  );
}
