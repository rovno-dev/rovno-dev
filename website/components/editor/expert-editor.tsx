"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  PlusIcon, XIcon, MapPin, ChartBar, Lightning, 
  Briefcase, Tag, ShareNetwork 
} from "@phosphor-icons/react";
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

function RemoveBtn({ onClick, disabled, className }: { onClick: () => void; disabled?: boolean, className?: string }) {
  return (
    <Button type="button" variant="text" size="icon-small" onClick={onClick} disabled={disabled} className={className}>
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
  
  const tabsListRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (val: string) => {
    setTimeout(() => {
      if (!tabsListRef.current) return;
      const activeTab = tabsListRef.current.querySelector('[data-state="active"]') as HTMLElement;
      if (activeTab) {
        const container = tabsListRef.current;
        const scrollLeft = activeTab.offsetLeft - (container.clientWidth / 2) + (activeTab.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <Tabs defaultValue="location" onValueChange={handleTabChange} className="w-full flex flex-col gap-6 min-w-0 max-w-full">
      <TabsList ref={tabsListRef} className="w-full flex flex-row justify-start overflow-x-auto h-11 p-1 bg-(--bg) border border-(--outline) rounded-xl no-scrollbar min-w-0">
        <TabsTrigger value="location" className="gap-2 px-4 h-9 shrink-0 data-[state=active]:bg-(--card) data-[state=active]:text-(--on-bg-high) data-[state=active]:shadow-sm rounded-lg">
          <MapPin className="size-4" /> Локация
        </TabsTrigger>
        <TabsTrigger value="stats" className="gap-2 px-4 h-9 shrink-0 data-[state=active]:bg-(--card) data-[state=active]:text-(--on-bg-high) data-[state=active]:shadow-sm rounded-lg">
          <ChartBar className="size-4" /> Статистика
        </TabsTrigger>
        <TabsTrigger value="skills" className="gap-2 px-4 h-9 shrink-0 data-[state=active]:bg-(--card) data-[state=active]:text-(--on-bg-high) data-[state=active]:shadow-sm rounded-lg">
          <Lightning className="size-4" /> Навыки
        </TabsTrigger>
        <TabsTrigger value="milestones" className="gap-2 px-4 h-9 shrink-0 data-[state=active]:bg-(--card) data-[state=active]:text-(--on-bg-high) data-[state=active]:shadow-sm rounded-lg">
          <Briefcase className="size-4" /> Опыт
        </TabsTrigger>
        <TabsTrigger value="tags" className="gap-2 px-4 h-9 shrink-0 data-[state=active]:bg-(--card) data-[state=active]:text-(--on-bg-high) data-[state=active]:shadow-sm rounded-lg">
          <Tag className="size-4" /> Метки
        </TabsTrigger>
        <TabsTrigger value="socials" className="gap-2 px-4 h-9 shrink-0 data-[state=active]:bg-(--card) data-[state=active]:text-(--on-bg-high) data-[state=active]:shadow-sm rounded-lg">
          <ShareNetwork className="size-4" /> Соцсети
        </TabsTrigger>
      </TabsList>

      <div className="w-full min-w-0">
        <TabsContent value="location" className="m-0 border-none outline-none">
          <Field>
            <FieldLabel>Город</FieldLabel>
            <Input value={value.location} onChange={(e) => set("location", e.target.value)} placeholder="Казань" disabled={disabled} />
          </Field>
        </TabsContent>

        <TabsContent value="stats" className="m-0 border-none outline-none space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" size="small" onClick={() => set("expert_stats", [...value.expert_stats, { value: "", label: "" }])} disabled={disabled}>
              <PlusIcon className="size-4" /> Добавить
            </Button>
          </div>
          {value.expert_stats.length === 0 && <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>}
          {value.expert_stats.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-end gap-2 p-3 rounded-2xl border border-(--outline) bg-(--bg) min-w-0">
              <Field className="w-full sm:w-32 shrink-0 min-w-0"><FieldLabel>Значение</FieldLabel><Input value={s.value} onChange={(e) => { const n = [...value.expert_stats]; n[i].value = e.target.value; set("expert_stats", n); }} placeholder="8+" disabled={disabled} /></Field>
              <Field className="flex-1 w-full min-w-0"><FieldLabel>Подпись</FieldLabel><Input value={s.label} onChange={(e) => { const n = [...value.expert_stats]; n[i].label = e.target.value; set("expert_stats", n); }} placeholder="лет в разработке" disabled={disabled} /></Field>
              <RemoveBtn onClick={() => set("expert_stats", value.expert_stats.filter((_, x) => x !== i))} disabled={disabled} className="sm:mb-0.5" />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="m-0 border-none outline-none space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" size="small" onClick={() => set("expert_skills", [...value.expert_skills, { label: "", level: 75 }])} disabled={disabled}>
              <PlusIcon className="size-4" /> Добавить
            </Button>
          </div>
          {value.expert_skills.length === 0 && <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>}
          {value.expert_skills.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 rounded-2xl border border-(--outline) bg-(--bg) min-w-0">
              <Field className="flex-1 w-full min-w-0">
                <FieldLabel>Навык</FieldLabel>
                <Input value={s.label} onChange={(e) => { const n = [...value.expert_skills]; n[i].label = e.target.value; set("expert_skills", n); }} placeholder="Backend" disabled={disabled} />
              </Field>
              <div className="flex-1 w-full sm:max-w-[200px] pb-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-(--on-bg-high)">Уровень</span>
                  <span className="text-xs font-mono text-(--primary) font-bold">{s.level}%</span>
                </div>
                <Slider value={[s.level]} min={0} max={100} step={1} onValueChange={([val]) => { const n = [...value.expert_skills]; n[i].level = val; set("expert_skills", n); }} disabled={disabled} />
              </div>
              <RemoveBtn onClick={() => set("expert_skills", value.expert_skills.filter((_, x) => x !== i))} disabled={disabled} className="sm:mb-0.5" />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="milestones" className="m-0 border-none outline-none space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" size="small" onClick={() => set("expert_milestones", [...value.expert_milestones, { year: String(new Date().getFullYear()), title: "", body: "" }])} disabled={disabled}>
              <PlusIcon className="size-4" /> Добавить
            </Button>
          </div>
          {value.expert_milestones.length === 0 && <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>}
          {value.expert_milestones.map((m, i) => (
            <div key={i} className="rounded-2xl border border-(--outline) p-3 space-y-2 bg-(--bg)">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                <Field className="w-full sm:w-28 shrink-0 min-w-0"><FieldLabel>Год</FieldLabel><Input value={m.year} onChange={(e) => { const n = [...value.expert_milestones]; n[i].year = e.target.value; set("expert_milestones", n); }} placeholder="2024" disabled={disabled} /></Field>
                <Field className="flex-1 w-full min-w-0"><FieldLabel>Заголовок</FieldLabel><Input value={m.title} onChange={(e) => { const n = [...value.expert_milestones]; n[i].title = e.target.value; set("expert_milestones", n); }} placeholder="Rovno.dev / МГУ" disabled={disabled} /></Field>
                <RemoveBtn onClick={() => set("expert_milestones", value.expert_milestones.filter((_, x) => x !== i))} disabled={disabled} className="sm:mb-0.5 self-end sm:self-auto" />
              </div>
              <Field><FieldLabel>Описание</FieldLabel><Textarea value={m.body} onChange={(e) => { const n = [...value.expert_milestones]; n[i].body = e.target.value; set("expert_milestones", n); }} placeholder="Что сделано" className="min-h-[60px]" disabled={disabled} /></Field>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tags" className="m-0 border-none outline-none space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" size="small" onClick={() => set("expert_tags", [...value.expert_tags, { label: "", icon_key: null }])} disabled={disabled}>
              <PlusIcon className="size-4" /> Добавить
            </Button>
          </div>
          {value.expert_tags.length === 0 && <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>}
          {value.expert_tags.map((t, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-end gap-2 p-3 rounded-2xl border border-(--outline) bg-(--bg) min-w-0">
              <Field className="flex-1 w-full min-w-0"><FieldLabel>Подпись</FieldLabel><Input value={t.label} onChange={(e) => { const n = [...value.expert_tags]; n[i].label = e.target.value; set("expert_tags", n); }} placeholder="Создатель" disabled={disabled} /></Field>
              <Field className="w-full sm:w-44 shrink-0 min-w-0">
                <FieldLabel>Иконка</FieldLabel>
                <Select value={t.icon_key || "none"} onValueChange={(v) => { const n = [...value.expert_tags]; n[i].icon_key = v === "none" ? null : v; set("expert_tags", n); }} disabled={disabled}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPERT_ICON_OPTIONS.map((o) => (<SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>))}</SelectContent>
                </Select>
              </Field>
              <RemoveBtn onClick={() => set("expert_tags", value.expert_tags.filter((_, x) => x !== i))} disabled={disabled} className="sm:mb-0.5" />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="socials" className="m-0 border-none outline-none space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outlined" size="small" onClick={() => set("expert_socials", [...value.expert_socials, { kind: "telegram", href: "" }])} disabled={disabled}>
              <PlusIcon className="size-4" /> Добавить
            </Button>
          </div>
          {value.expert_socials.length === 0 && <p className="text-body-5 text-(--on-bg-low)">Пока нет записей.</p>}
          {value.expert_socials.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-end gap-2 p-3 rounded-2xl border border-(--outline) bg-(--bg) min-w-0">
              <Field className="w-full sm:w-44 shrink-0 min-w-0">
                <FieldLabel>Сеть</FieldLabel>
                <Select value={s.kind} onValueChange={(v) => { const n = [...value.expert_socials]; n[i].kind = v; set("expert_socials", n); }} disabled={disabled}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPERT_SOCIAL_OPTIONS.map((o) => (<SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>))}</SelectContent>
                </Select>
              </Field>
              <Field className="flex-1 w-full min-w-0"><FieldLabel>Ссылка</FieldLabel><Input value={s.href} onChange={(e) => { const n = [...value.expert_socials]; n[i].href = e.target.value; set("expert_socials", n); }} placeholder="https://..." disabled={disabled} /></Field>
              <RemoveBtn onClick={() => set("expert_socials", value.expert_socials.filter((_, x) => x !== i))} disabled={disabled} className="sm:mb-0.5" />
            </div>
          ))}
        </TabsContent>
      </div>
    </Tabs>
  );
}
