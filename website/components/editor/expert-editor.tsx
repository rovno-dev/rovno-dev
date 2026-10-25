"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import {
  EXPERT_ICON_OPTIONS,
  EXPERT_SOCIAL_OPTIONS,
} from "@/components/icons/expert-icon-map";
import type {
  ExpertStat, ExpertSkill, ExpertMilestone, ExpertTag, ExpertSocial
} from "@/utils/api/team";

export interface ExpertFieldsValue {
  location: string;
  expert_tags: ExpertTag[];
  expert_socials: ExpertSocial[];
  expert_stats: ExpertStat[];
  expert_skills: ExpertSkill[];
  expert_milestones: ExpertMilestone[];
}

export const EMPTY_EXPERT_FIELDS: ExpertFieldsValue = {
  location: "", expert_tags: [], expert_socials: [], expert_stats: [], expert_skills: [], expert_milestones: [],
};

function RemoveBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button type="button" variant="text" size="icon-small" onClick={onClick} disabled={disabled}>
      <XIcon className="size-4" />
    </Button>
  );
}

export function ExpertEditor({ value, onChange, disabled = false }: {
  value: ExpertFieldsValue;
  onChange: (next: ExpertFieldsValue) => void;
  disabled?: boolean;
}) {
  const set = <K extends keyof ExpertFieldsValue>(k: K, v: ExpertFieldsValue[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <h2 className="text-heading-3 mb-1">Локация</h2>
        <Field>
          <Input value={value.location} onChange={(e) => set("location", e.target.value)} placeholder="Казань" disabled={disabled} />
        </Field>
      </Card>

      {/* Stats */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-heading-3 mb-1">Статистика</h2>
          <Button type="button" variant="outlined" size="small" onClick={() => set("expert_stats", [...value.expert_stats, { value: "", label: "" }])} disabled={disabled}>
            <PlusIcon className="size-4" /> Добавить
          </Button>
        </div>
        {value.expert_stats.map((s, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field className="w-32 shrink-0"><FieldLabel>Значение</FieldLabel><Input value={s.value} onChange={(e) => { const n = [...value.expert_stats]; n[i].value = e.target.value; set("expert_stats", n); }} placeholder="8+" disabled={disabled} /></Field>
            <Field className="flex-1"><FieldLabel>Подпись</FieldLabel><Input value={s.label} onChange={(e) => { const n = [...value.expert_stats]; n[i].label = e.target.value; set("expert_stats", n); }} placeholder="лет в разработке" disabled={disabled} /></Field>
            <RemoveBtn onClick={() => set("expert_stats", value.expert_stats.filter((_, x) => x !== i))} disabled={disabled} />
          </div>
        ))}
      </Card>

      {/* Skills */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-heading-3 mb-1">Навыки</h2>
          <Button type="button" variant="outlined" size="small" onClick={() => set("expert_skills", [...value.expert_skills, { label: "", level: 75 }])} disabled={disabled}>
            <PlusIcon className="size-4" /> Добавить
          </Button>
        </div>
        {value.expert_skills.map((s, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field className="flex-1"><FieldLabel>Навык</FieldLabel><Input value={s.label} onChange={(e) => { const n = [...value.expert_skills]; n[i].label = e.target.value; set("expert_skills", n); }} placeholder="Backend" disabled={disabled} /></Field>
            <Field className="w-28 shrink-0"><FieldLabel>Уровень</FieldLabel><Input type="number" min={0} max={100} value={s.level} onChange={(e) => { const n = [...value.expert_skills]; n[i].level = Math.max(0, Math.min(100, Number(e.target.value) || 0)); set("expert_skills", n); }} disabled={disabled} /></Field>
            <RemoveBtn onClick={() => set("expert_skills", value.expert_skills.filter((_, x) => x !== i))} disabled={disabled} />
          </div>
        ))}
      </Card>

      {/* Milestones */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="text-heading-3 mb-1">Опыт и образование</h2><p className="text-body-4 text-(--on-bg-medium)">Этапы карьеры или учебы.</p></div>
          <Button type="button" variant="outlined" size="small" onClick={() => set("expert_milestones", [...value.expert_milestones, { year: String(new Date().getFullYear()), title: "", body: "" }])} disabled={disabled}>
            <PlusIcon className="size-4" /> Добавить
          </Button>
        </div>
        {value.expert_milestones.map((m, i) => (
          <div key={i} className="rounded-2xl border border-(--outline) p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Field className="w-28 shrink-0"><FieldLabel>Год</FieldLabel><Input value={m.year} onChange={(e) => { const n = [...value.expert_milestones]; n[i].year = e.target.value; set("expert_milestones", n); }} placeholder="2024" disabled={disabled} /></Field>
              <Field className="flex-1"><FieldLabel>Заголовок</FieldLabel><Input value={m.title} onChange={(e) => { const n = [...value.expert_milestones]; n[i].title = e.target.value; set("expert_milestones", n); }} placeholder="Rovno.dev / МГУ" disabled={disabled} /></Field>
              <RemoveBtn onClick={() => set("expert_milestones", value.expert_milestones.filter((_, x) => x !== i))} disabled={disabled} />
            </div>
            <Field><FieldLabel>Описание</FieldLabel><Textarea value={m.body} onChange={(e) => { const n = [...value.expert_milestones]; n[i].body = e.target.value; set("expert_milestones", n); }} placeholder="Что сделано" className="min-h-[60px]" disabled={disabled} /></Field>
          </div>
        ))}
      </Card>

      {/* Tags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-heading-3 mb-1">Метки</h2>
          <Button type="button" variant="outlined" size="small" onClick={() => set("expert_tags", [...value.expert_tags, { label: "", icon_key: null }])} disabled={disabled}>
            <PlusIcon className="size-4" /> Добавить
          </Button>
        </div>
        {value.expert_tags.map((t, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field className="flex-1"><FieldLabel>Подпись</FieldLabel><Input value={t.label} onChange={(e) => { const n = [...value.expert_tags]; n[i].label = e.target.value; set("expert_tags", n); }} placeholder="Создатель" disabled={disabled} /></Field>
            <Field className="w-44 shrink-0">
              <FieldLabel>Иконка</FieldLabel>
              <Select value={t.icon_key || "none"} onValueChange={(v) => { const n = [...value.expert_tags]; n[i].icon_key = v === "none" ? null : v; set("expert_tags", n); }} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPERT_ICON_OPTIONS.map((o) => (<SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>))}</SelectContent>
              </Select>
            </Field>
            <RemoveBtn onClick={() => set("expert_tags", value.expert_tags.filter((_, x) => x !== i))} disabled={disabled} />
          </div>
        ))}
      </Card>

      {/* Socials */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-heading-3 mb-1">Социальные сети</h2>
          <Button type="button" variant="outlined" size="small" onClick={() => set("expert_socials", [...value.expert_socials, { kind: "telegram", href: "" }])} disabled={disabled}>
            <PlusIcon className="size-4" /> Добавить
          </Button>
        </div>
        {value.expert_socials.map((s, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field className="w-44 shrink-0">
              <FieldLabel>Сеть</FieldLabel>
              <Select value={s.kind} onValueChange={(v) => { const n = [...value.expert_socials]; n[i].kind = v; set("expert_socials", n); }} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPERT_SOCIAL_OPTIONS.map((o) => (<SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>))}</SelectContent>
              </Select>
            </Field>
            <Field className="flex-1"><FieldLabel>Ссылка</FieldLabel><Input value={s.href} onChange={(e) => { const n = [...value.expert_socials]; n[i].href = e.target.value; set("expert_socials", n); }} placeholder="https://..." disabled={disabled} /></Field>
            <RemoveBtn onClick={() => set("expert_socials", value.expert_socials.filter((_, x) => x !== i))} disabled={disabled} />
          </div>
        ))}
      </Card>
    </div>
  );
}
