"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, X, Star, Scale, Github, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectTag, ProjectTagKind } from "@/utils/api/projects";

interface Props {
  value: ProjectTag[];
  onChange: (next: ProjectTag[]) => void;
}

const KIND_META: Record<ProjectTagKind, {
  label: string;
  icon: any;
  hint: string;
  accent: string;
}> = {
  from_chief: {
    label: "From Chief",
    icon: Star,
    hint: "Личный проект автора (не агентский)",
    accent: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  },
  license: {
    label: "Лицензия",
    icon: Scale,
    hint: "Условия использования проекта",
    accent: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  },
  github: {
    label: "GitHub",
    icon: Github,
    hint: "Публичный репозиторий — README подтянется автоматически",
    accent: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  },
  custom: {
    label: "Своя метка",
    icon: Tag,
    hint: "Произвольная метка",
    accent: "bg-gray-500/15 text-gray-500 border-gray-500/30",
  },
};

function TagIcon({ kind }: { kind: ProjectTagKind }) {
  const Icon = KIND_META[kind].icon;
  return <Icon className="size-3.5" />;
}

export function ProjectTagsEditor({ value, onChange }: Props) {
  const [draftKind, setDraftKind] = useState<ProjectTagKind>("custom");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftValue, setDraftValue] = useState("");

  const addTag = () => {
    const label = draftLabel.trim() || (draftKind === "from_chief" ? "From Chief" : "");
    if (!label) return;

    let valuePayload: any = undefined;
    if (draftKind === "license") {
      valuePayload = { type: draftValue.trim() || label };
    } else if (draftKind === "github") {
      const repo = draftValue.trim();
      if (!repo || !repo.includes("/")) return;
      valuePayload = { repo };
    } else if (draftKind === "from_chief") {
      valuePayload = draftValue.trim() ? { author: draftValue.trim() } : {};
    }

    onChange([
      ...value,
      { kind: draftKind, label, value: valuePayload, sort_order: value.length },
    ]);
    setDraftLabel("");
    setDraftValue("");
    setDraftKind("custom");
  };

  const removeTag = (idx: number) =>
    onChange(value.filter((_, i) => i !== idx).map((t, i) => ({ ...t, sort_order: i })));

  const updateTag = (idx: number, patch: Partial<ProjectTag>) =>
    onChange(value.map((t, i) => (i === idx ? { ...t, ...patch } : t)));

  return (
    <div className="space-y-4">
      {/* Assigned tags */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((t, idx) => {
            const meta = KIND_META[t.kind];
            return (
              <Card
                key={idx}
                className="rounded-2xl border-(--outline) bg-(--card) p-3 flex items-center gap-3"
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium shrink-0",
                    meta.accent
                  )}
                >
                  <TagIcon kind={t.kind} />
                  {meta.label}
                </span>
                <Input
                  value={t.label}
                  onChange={(e) => updateTag(idx, { label: e.target.value })}
                  className="h-8 text-sm flex-1"
                />
                {t.kind === "license" && (
                  <Input
                    value={t.value?.type || ""}
                    onChange={(e) => updateTag(idx, { value: { ...t.value, type: e.target.value } })}
                    placeholder="Тип: MIT, Apache-2.0, …"
                    className="h-8 text-xs max-w-[180px]"
                  />
                )}
                {t.kind === "github" && (
                  <Input
                    value={t.value?.repo || ""}
                    onChange={(e) => updateTag(idx, { value: { ...t.value, repo: e.target.value } })}
                    placeholder="owner/name"
                    className="h-8 text-xs max-w-[180px] font-mono"
                  />
                )}
                {t.kind === "from_chief" && (
                  <Input
                    value={t.value?.author || ""}
                    onChange={(e) => updateTag(idx, { value: { ...t.value, author: e.target.value } })}
                    placeholder="Автор (опц.)"
                    className="h-8 text-xs max-w-[160px]"
                  />
                )}
                <Button
                  type="button"
                  variant="text"
                  size="icon-small"
                  onClick={() => removeTag(idx)}
                  title="Убрать"
                >
                  <X className="size-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add form */}
      <Card className="rounded-2xl border-(--outline) bg-(--card) p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_1fr_auto] gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Тип метки</Label>
            <Select value={draftKind} onValueChange={(v) => setDraftKind(v as ProjectTagKind)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(KIND_META) as ProjectTagKind[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-2">
                      <TagIcon kind={k} />
                      {KIND_META[k].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              {draftKind === "from_chief" ? "Подпись (опц.)" : "Название"}
            </Label>
            <Input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder={draftKind === "from_chief" ? "From Chief" : "Например: MIT"}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              {draftKind === "github" ? "Репозиторий" : draftKind === "license" ? "Тип / URL" : draftKind === "from_chief" ? "Автор" : "—"}
            </Label>
            <Input
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              placeholder={draftKind === "github" ? "owner/name" : draftKind === "license" ? "MIT" : ""}
              className="h-9"
              disabled={draftKind === "custom"}
            />
          </div>
          <Button type="button" onClick={addTag} className="h-9">
            <Plus className="size-4" />
            Добавить
          </Button>
        </div>
        <p className="text-[11px] text-(--on-bg-low)">{KIND_META[draftKind].hint}</p>
      </Card>
    </div>
  );
}
