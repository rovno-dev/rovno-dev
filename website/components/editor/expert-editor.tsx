"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ExpertStat,
  ExpertSkill,
  ExpertMilestone,
  ExpertTag,
  ExpertSocial,
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
  location: "",
  expert_tags: [],
  expert_socials: [],
  expert_stats: [],
  expert_skills: [],
  expert_milestones: [],
};

function RemoveBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      type="button"
      variant="text"
      size="icon-small"
      onClick={onClick}
      disabled={disabled}
      aria-label="Убрать"
    >
      <XIcon className="size-4" />
    </Button>
  );
}

export function ExpertEditor({
  value,
  onChange,
  disabled = false,
}: {
  value: ExpertFieldsValue;
  onChange: (next: ExpertFieldsValue) => void;
  disabled?: boolean;
}) {
  const set = <K extends keyof ExpertFieldsValue>(k: K, v: ExpertFieldsValue[K]) =>
    onChange({ ...value, [k]: v });

  // ── Stats ──────────────────────────────────────────────────────
  const setStat = (i: number, patch: Partial<ExpertStat>) => {
    const next = [...value.expert_stats];
    next[i] = { ...next[i], ...patch };
    set("expert_stats", next);
  };
  const addStat = () =>
    set("expert_stats", [...value.expert_stats, { value: "", label: "" }]);
  const removeStat = (i: number) =>
    set("expert_stats", value.expert_stats.filter((_, x) => x !== i));

  // ── Skills ─────────────────────────────────────────────────────
  const setSkill = (i: number, patch: Partial<ExpertSkill>) => {
    const next = [...value.expert_skills];
    next[i] = { ...next[i], ...patch };
    set("expert_skills", next);
  };
  const addSkill = () =>
    set("expert_skills", [...value.expert_skills, { label: "", level: 75 }]);
  const removeSkill = (i: number) =>
    set("expert_skills", value.expert_skills.filter((_, x) => x !== i));

  // ── Milestones ─────────────────────────────────────────────────
  const setMilestone = (i: number, patch: Partial<ExpertMilestone>) => {
    const next = [...value.expert_milestones];
    next[i] = { ...next[i], ...patch };
    set("expert_milestones", next);
  };
  const addMilestone = () =>
    set("expert_milestones", [
      ...value.expert_milestones,
      { year: String(new Date().getFullYear()), title: "", body: "" },
    ]);
  const removeMilestone = (i: number) =>
    set("expert_milestones", value.expert_milestones.filter((_, x) => x !== i));

  // ── Tags ───────────────────────────────────────────────────────
  const setTag = (i: number, patch: Partial<ExpertTag>) => {
    const next = [...value.expert_tags];
    next[i] = { ...next[i], ...patch };
    set("expert_tags", next);
  };
  const addTag = () =>
    set("expert_tags", [...value.expert_tags, { label: "", icon_key: null }]);
  const removeTag = (i: number) =>
    set("expert_tags", value.expert_tags.filter((_, x) => x !== i));

  // ── Socials ────────────────────────────────────────────────────
  const setSocial = (i: number, patch: Partial<ExpertSocial>) => {
    const next = [...value.expert_socials];
    next[i] = { ...next[i], ...patch };
    set("expert_socials", next);
  };
  const addSocial = () =>
    set("expert_socials", [
      ...value.expert_socials,
      { kind: "telegram", href: "" },
    ]);
  const removeSocial = (i: number) =>
    set("expert_socials", value.expert_socials.filter((_, x) => x !== i));

  return (
    <div className="space-y-4">
      {/* Location */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div>
          <h2 className="text-heading-3 mb-1">Локация</h2>
          <p className="text-body-4 text-(--on-bg-medium)">
            Город, отображается на странице эксперта рядом с ролью.
          </p>
        </div>
        <Field>
          <FieldLabel>Город</FieldLabel>
          <Input
            value={value.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Казань"
            disabled={disabled}
          />
        </Field>
      </Card>

      {/* Stats */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading-3 mb-1">Статистика</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Крупные цифры в верхней части профиля (3 колонки).
            </p>
          </div>
          <Button type="button" variant="outlined" size="small" onClick={addStat} disabled={disabled}>
            <PlusIcon className="size-4" />
            Добавить
          </Button>
        </div>
        {value.expert_stats.length === 0 ? (
          <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>
        ) : (
          <div className="space-y-2">
            {value.expert_stats.map((s, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field className="w-32 shrink-0">
                  <FieldLabel>Значение</FieldLabel>
                  <Input
                    value={s.value}
                    onChange={(e) => setStat(i, { value: e.target.value })}
                    placeholder="8+"
                    disabled={disabled}
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel>Подпись</FieldLabel>
                  <Input
                    value={s.label}
                    onChange={(e) => setStat(i, { label: e.target.value })}
                    placeholder="лет в разработке"
                    disabled={disabled}
                  />
                </Field>
                <RemoveBtn onClick={() => removeStat(i)} disabled={disabled} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Skills */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading-3 mb-1">Навыки</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Название и уровень (0–100). Уровень рисуется как полоса.
            </p>
          </div>
          <Button type="button" variant="outlined" size="small" onClick={addSkill} disabled={disabled}>
            <PlusIcon className="size-4" />
            Добавить
          </Button>
        </div>
        {value.expert_skills.length === 0 ? (
          <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>
        ) : (
          <div className="space-y-2">
            {value.expert_skills.map((s, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel>Навык</FieldLabel>
                  <Input
                    value={s.label}
                    onChange={(e) => setSkill(i, { label: e.target.value })}
                    placeholder="Backend (Python, FastAPI)"
                    disabled={disabled}
                  />
                </Field>
                <Field className="w-28 shrink-0">
                  <FieldLabel>Уровень</FieldLabel>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={s.level}
                    onChange={(e) =>
                      setSkill(i, {
                        level: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                      })
                    }
                    disabled={disabled}
                  />
                </Field>
                <RemoveBtn onClick={() => removeSkill(i)} disabled={disabled} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Milestones */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading-3 mb-1">Карьерный путь</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Год, заголовок и описание. Показываются таймлайном.
            </p>
          </div>
          <Button type="button" variant="outlined" size="small" onClick={addMilestone} disabled={disabled}>
            <PlusIcon className="size-4" />
            Добавить
          </Button>
        </div>
        {value.expert_milestones.length === 0 ? (
          <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>
        ) : (
          <div className="space-y-3">
            {value.expert_milestones.map((m, i) => (
              <div key={i} className="rounded-2xl border border-(--outline) p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Field className="w-28 shrink-0">
                    <FieldLabel>Год</FieldLabel>
                    <Input
                      value={m.year}
                      onChange={(e) => setMilestone(i, { year: e.target.value })}
                      placeholder="2024"
                      disabled={disabled}
                    />
                  </Field>
                  <Field className="flex-1">
                    <FieldLabel>Заголовок</FieldLabel>
                    <Input
                      value={m.title}
                      onChange={(e) => setMilestone(i, { title: e.target.value })}
                      placeholder="Rovno.dev - со-основатель"
                      disabled={disabled}
                    />
                  </Field>
                  <RemoveBtn onClick={() => removeMilestone(i)} disabled={disabled} />
                </div>
                <Field>
                  <FieldLabel>Описание</FieldLabel>
                  <Textarea
                    value={m.body}
                    onChange={(e) => setMilestone(i, { body: e.target.value })}
                    placeholder="Что сделано и почему это важно"
                    className="min-h-[72px]"
                    disabled={disabled}
                  />
                </Field>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tags */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading-3 mb-1">Метки</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Бейджи рядом с био. Иконка выбирается из фиксированного набора.
            </p>
          </div>
          <Button type="button" variant="outlined" size="small" onClick={addTag} disabled={disabled}>
            <PlusIcon className="size-4" />
            Добавить
          </Button>
        </div>
        {value.expert_tags.length === 0 ? (
          <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>
        ) : (
          <div className="space-y-2">
            {value.expert_tags.map((t, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field className="flex-1">
                  <FieldLabel>Подпись</FieldLabel>
                  <Input
                    value={t.label}
                    onChange={(e) => setTag(i, { label: e.target.value })}
                    placeholder="Создатель Amorfa"
                    disabled={disabled}
                  />
                </Field>
                <Field className="w-44 shrink-0">
                  <FieldLabel>Иконка</FieldLabel>
                  <Select
                    value={t.icon_key || "none"}
                    onValueChange={(v) =>
                      setTag(i, { icon_key: v === "none" ? null : v })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERT_ICON_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <RemoveBtn onClick={() => removeTag(i)} disabled={disabled} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Socials */}
      <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 space-y-4 overflow-visible">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading-3 mb-1">Социальные сети</h2>
            <p className="text-body-4 text-(--on-bg-medium)">
              Иконки в правом верхнем углу hero. Порядок сохраняется.
            </p>
          </div>
          <Button type="button" variant="outlined" size="small" onClick={addSocial} disabled={disabled}>
            <PlusIcon className="size-4" />
            Добавить
          </Button>
        </div>
        {value.expert_socials.length === 0 ? (
          <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>
        ) : (
          <div className="space-y-2">
            {value.expert_socials.map((s, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field className="w-44 shrink-0">
                  <FieldLabel>Сеть</FieldLabel>
                  <Select
                    value={s.kind}
                    onValueChange={(v) => setSocial(i, { kind: v })}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERT_SOCIAL_OPTIONS.map((o) => (
                        <SelectItem key={o.key} value={o.key}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="flex-1">
                  <FieldLabel>Ссылка</FieldLabel>
                  <Input
                    value={s.href}
                    onChange={(e) => setSocial(i, { href: e.target.value })}
                    placeholder="https://…"
                    disabled={disabled}
                  />
                </Field>
                <RemoveBtn onClick={() => removeSocial(i)} disabled={disabled} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
