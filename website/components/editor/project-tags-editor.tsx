"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon, XIcon, StarIcon, ScalesIcon, TagIcon as PhosphorTagIcon, CaretDownIcon, CaretUpIcon,
} from "@phosphor-icons/react";
import { GithubLogotypeMonoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ProjectTag, ProjectTagKind } from "@/utils/api/projects";

interface Props {
  value: ProjectTag[];
  onChange: (next: ProjectTag[]) => void;
}

const KIND_META: Record<ProjectTagKind, {
  label: string;
  hint: string;
  accent: string;
}> = {
  from_chief: { label: "From Chief", hint: "Личный проект автора", accent: "bg-violet-500/15 text-violet-500 border-violet-500/30" },
  license: { label: "Лицензия", hint: "Условия использования", accent: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  github: { label: "GitHub", hint: "README подтягивается автоматически", accent: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  custom: { label: "Своя метка", hint: "Произвольная метка", accent: "bg-gray-500/15 text-gray-500 border-gray-500/30" },
};

function TagIcon({ kind, className }: { kind: ProjectTagKind; className?: string }) {
  switch (kind) {
    case "from_chief": return <StarIcon className={className} />;
    case "license": return <ScalesIcon className={className} />;
    case "custom": return <PhosphorTagIcon className={className} />;
    case "github":
      return (
        <GithubLogotypeMonoIcon
          size={14}
          className={cn("[&_path]:fill-current", className)}
        />
      );
  }
}

/** The extra editable field a tag kind carries, if any. */
function KindExtraField({
  tag, onChange,
}: { tag: ProjectTag; onChange: (v: any) => void }) {
  if (tag.kind === "license") {
    return (
      <Input
        value={tag.value?.type || ""}
        onChange={(e) => onChange({ ...tag.value, type: e.target.value })}
        placeholder="MIT, Apache-2.0, …"
        className="h-9 text-sm"
      />
    );
  }
  if (tag.kind === "github") {
    return (
      <Input
        value={tag.value?.repo || ""}
        onChange={(e) => onChange({ ...tag.value, repo: e.target.value })}
        placeholder="owner/name"
        className="h-9 text-sm font-mono"
      />
    );
  }
  if (tag.kind === "from_chief") {
    return (
      <Input
        value={tag.value?.author || ""}
        onChange={(e) => onChange({ ...tag.value, author: e.target.value })}
        placeholder="Автор (опционально)"
        className="h-9 text-sm"
      />
    );
  }
  return null;
}

/** Human-readable summary of the tag's structured value. */
function tagSummary(tag: ProjectTag): string | null {
  if (tag.kind === "github") return tag.value?.repo || null;
  if (tag.kind === "license") return tag.value?.type || null;
  if (tag.kind === "from_chief") return tag.value?.author || null;
  return null;
}

export function ProjectTagsEditor({ value, onChange }: Props) {
  const [draftKind, setDraftKind] = useState<ProjectTagKind>("custom");
  const [draftLabel, setDraftLabel] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx).map((t, i) => ({ ...t, sort_order: i })));
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateTag = (idx: number, patch: Partial<ProjectTag>) =>
    onChange(value.map((t, i) => (i === idx ? { ...t, ...patch } : t)));

  const needsValueInput =
    draftKind === "license" || draftKind === "github" || draftKind === "from_chief";

  return (
    <div className="space-y-3">
      {/* --- Assigned list --- */}
      {value.length > 0 && (
        <div className="rounded-2xl border border-(--outline) bg-(--card) divide-y divide-(--outline) overflow-hidden">
          {value.map((t, idx) => {
            const meta = KIND_META[t.kind];
            const summary = tagSummary(t);
            const expanded = expandedIdx === idx;
            return (
              <div key={idx} className="group">
                <div className="flex items-center gap-3 px-3 py-2 hover:bg-(--state-hover) transition-colors">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium shrink-0",
                      meta.accent
                    )}
                  >
                    <TagIcon kind={t.kind} className="size-3" />
                    {meta.label}
                  </span>
                  <Input
                    value={t.label}
                    onChange={(e) => updateTag(idx, { label: e.target.value })}
                    className="h-8 text-sm border-transparent bg-transparent hover:border-(--outline) focus-visible:border-ring"
                  />
                  {summary && (
                    <span className="text-[11px] text-(--on-bg-low) font-mono truncate max-w-[200px]">
                      {summary}
                    </span>
                  )}
                  {t.kind !== "custom" && (
                    <Button
                      type="button"
                      variant="text"
                      size="icon-small"
                      onClick={() => setExpandedIdx(expanded ? null : idx)}
                      title={expanded ? "Свернуть" : "Настроить"}
                    >
                      {expanded ? <CaretUpIcon className="size-3.5" /> : <CaretDownIcon className="size-3.5" />}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="text"
                    size="icon-small"
                    onClick={() => removeTag(idx)}
                    title="Убрать"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </div>
                {expanded && (
                  <div className="px-3 pb-3 pt-1">
                    <KindExtraField
                      tag={t}
                      onChange={(v) => updateTag(idx, { value: v })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* --- Add form: single row --- */}
      <div className="rounded-2xl border border-(--outline) bg-(--card) p-3">
        <div className="grid grid-cols-[140px_1fr_1fr_auto] gap-2 items-center">
          <Select value={draftKind} onValueChange={(v) => setDraftKind(v as ProjectTagKind)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(KIND_META) as ProjectTagKind[]).map((k) => (
                <SelectItem key={k} value={k}>
                  <span className="flex items-center gap-2">
                    <TagIcon kind={k} className="size-3.5" />
                    {KIND_META[k].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            placeholder={draftKind === "from_chief" ? "Подпись (по умолч. «From Chief»)" : "Название"}
            className="h-9 text-sm"
          />

          <Input
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            placeholder={
              draftKind === "github" ? "owner/name"
                : draftKind === "license" ? "MIT"
                  : draftKind === "from_chief" ? "Автор (опц.)"
                    : "—"
            }
            className="h-9 text-sm font-mono"
            disabled={draftKind === "custom"}
          />

          <Button type="button" onClick={addTag} className="h-9 shrink-0">
            <PlusIcon className="size-4" />
            Добавить
          </Button>
        </div>
        <p className="text-[11px] text-(--on-bg-low) mt-2">{KIND_META[draftKind].hint}</p>
      </div>
    </div>
  );
}
