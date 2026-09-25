"use client";

import { useEffect, useState, use } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { ProjectEditorForm } from "@/components/editor/project-editor-form";
import { fetchAdminProject, type ProjectDetail } from "@/utils/api/projects";

export default function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminProject(slug)
      .then((p) => {
        if (!p) setError("Проект не найден");
        else setProject(p);
      })
      .catch((err) => setError(err?.message || "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <CheckUser>
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-body-3 text-(--on-bg-low) animate-pulse">
          Loading…
        </div>
      ) : project ? (
        <ProjectEditorForm initial={project} />
      ) : (
        <div className="text-body-3 text-(--on-bg-medium)">{error || "Not found."}</div>
      )}
    </CheckUser>
  );
}
