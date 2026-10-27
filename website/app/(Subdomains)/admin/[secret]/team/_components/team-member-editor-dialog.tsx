"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import { ExpertEditor, EMPTY_EXPERT_FIELDS, type ExpertFieldsValue } from "@/components/editor/expert-editor";
import { toast } from "sonner";
import {
  CircleNotchIcon, XIcon, PlusIcon, MagnifyingGlassIcon, UserIcon as UserIcon, FolderOpenIcon,
} from "@phosphor-icons/react";
import type { TeamMemberAdmin, TeamMemberProject, ProjectPickerItem } from "@/utils/api/team";
import {
  updateTeamMember,
  fetchTeamMemberProjects,
  setTeamMemberProjects,
  fetchProjectsForPicker,
} from "@/utils/api/team";

interface Props {
  member: TeamMemberAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function TeamMemberEditorDialog({ member, open, onOpenChange, onSaved }: Props) {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expert, setExpert] = useState<ExpertFieldsValue>(EMPTY_EXPERT_FIELDS);
  
  const [projects, setProjects] = useState<TeamMemberProject[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectPickerItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  useEffect(() => {
    if (!member) return;
    setRole(member.role || "");
    setUsername(member.user_username || "");
    setBio(member.bio || "");
    setCoverUrl(member.cover_url || "");
    setSortOrder(member.sort_order ?? 0);
    setIsActive(member.is_active);
    setExpert({
      location: member.location || "",
      expert_tags: member.expert_tags || [],
      expert_socials: member.expert_socials || [],
      expert_stats: member.expert_stats || [],
      expert_skills: member.expert_skills || [],
      expert_milestones: member.expert_milestones || [],
    });
    setPickerOpen(false);
    setProjectSearch("");
  }, [member]);

  useEffect(() => {
    if (!open || !member) return;
    let cancelled = false;
    setProjectsLoading(true);
    Promise.all([fetchTeamMemberProjects(member.user_id), fetchProjectsForPicker()])
      .then(([assigned, all]) => {
        if (cancelled) return;
        setProjects(assigned);
        setAllProjects(all);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err?.message || "Не удалось загрузить проекты");
      })
      .finally(() => {
        if (cancelled) return;
        setProjectsLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, member]);

  const filteredPickerProjects = useMemo(() => {
    const pinned = new Set(projects.map((p) => p.project_id));
    const q = projectSearch.trim().toLowerCase();
    return allProjects
      .filter((p) => !pinned.has(p.id))
      .filter((p) => (q ? p.title.toLowerCase().includes(q) : true))
      .slice(0, 50);
  }, [allProjects, projects, projectSearch]);

  if (!member) return null;

  const displayName =
    member.user_name || member.user_surname
      ? `${member.user_name ?? ""} ${member.user_surname ?? ""}`.trim()
      : member.user_username || member.user_email || "Участник";

  const addProject = (p: ProjectPickerItem) => {
    if (projects.some((x) => x.project_id === p.id)) return;
    setProjects((prev) => [...prev, { project_id: p.id, title: p.title, slug: p.slug, period: p.period, role_on_project: null }]);
    setPickerOpen(false);
    setProjectSearch("");
  };

  const handleSave = async () => {
    if (!role.trim()) {
      toast.error("Роль обязательна");
      return;
    }
    setSaving(true);
    try {
      await updateTeamMember(member.user_id, {
        role: role.trim(),
        bio: bio.trim() || null,
        cover_url: coverUrl.trim() || null,
        sort_order: sortOrder,
        is_active: isActive,
        username: username.trim() || null,
        location: expert.location.trim() || null,
        expert_tags: expert.expert_tags,
        expert_socials: expert.expert_socials,
        expert_stats: expert.expert_stats,
        expert_skills: expert.expert_skills,
        expert_milestones: expert.expert_milestones,
      });
      await setTeamMemberProjects(
        member.user_id,
        projects.map((p) => ({ project_id: p.project_id, role_on_project: p.role_on_project?.trim() || null }))
      );
      toast.success("Сохранено");
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-(--outline) shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden border border-(--outline) bg-muted shrink-0">
              {member.user_avatar_url ? (
                <Image src={member.user_avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-(--on-bg-low)"><UserIcon className="size-5" /></div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate">{displayName}</p>
              <p className="text-body-5 font-normal text-(--on-bg-low) truncate">{member.user_email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 scrollbar-admin min-w-0">
          {/* Identity */}
          <Card className="rounded-2xl border-(--outline) bg-(--card) p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="tonal-card-static" size="chip-small" className={member.is_active ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-rose-500/15 text-rose-500 border-rose-500/30"}>
                {member.is_active ? "Активен" : "Неактивен"}
              </Badge>
              {member.user_username && <span className="text-body-5 text-(--on-bg-low)">@{member.user_username}</span>}
            </div>
            <p className="text-body-6 text-(--on-bg-low)">Публичная страница: <code className="font-mono">/{member.user_username || "-"}</code></p>
          </Card>

          {/* Core Fields */}
          <Field>
            <FieldLabel>Роль в команде <span className="text-destructive">*</span></FieldLabel>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Со-основатель и CTO" />
          </Field>
          <Field>
            <FieldLabel>Username (URL)</FieldLabel>
            <Input value={username} onChange={(e) => setUsername(e.target.value.replace(/[^A-Za-z0-9_]/g, ""))} placeholder="niyazgim" />
          </Field>
          <Field>
            <FieldLabel>Био</FieldLabel>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Опишите опыт" className="min-h-[100px]" />
          </Field>
          <Field>
            <FieldLabel>Обложка (21:8)</FieldLabel>
            <ImageUploadField value={coverUrl} onChange={setCoverUrl} defaultAspect="21:8" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Сортировка</FieldLabel>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value) || 0)} />
            </Field>
            <Field>
              <FieldLabel>Активен</FieldLabel>
              <div className="flex items-center gap-3 h-10">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="is-active">Показывать</Label>
              </div>
            </Field>
          </div>

          {/* Expert Enrichment */}
          <div className="pt-6 border-t border-(--outline)">
            <h3 className="text-heading-3 mb-4">Профиль эксперта</h3>
            <ExpertEditor value={expert} onChange={setExpert} />
          </div>

          {/* Projects */}
          <div className="pt-6 border-t border-(--outline) space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpenIcon className="size-5 text-(--primary)" />
                <h3 className="text-heading-4">Проекты</h3>
                <span className="text-body-5 text-(--on-bg-low)">{projects.length}</span>
              </div>
              <Button type="button" variant="outlined" size="small" onClick={() => setPickerOpen((v) => !v)}>
                <PlusIcon className="size-4" /> Добавить
              </Button>
            </div>

            {pickerOpen && (
              <Card className="rounded-2xl border-(--outline) p-3 space-y-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low)" />
                  <Input autoFocus value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} placeholder="Найти проект..." className="pl-9" />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredPickerProjects.map((p) => (
                    <button key={p.id} type="button" onClick={() => addProject(p)} className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-(--state-hover)">
                      <span className="truncate">{p.title}</span>
                      {p.period && <span className="text-body-6 text-(--on-bg-low)">{p.period}</span>}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {projectsLoading ? (
              <div className="flex justify-center py-4 text-(--on-bg-low)"><CircleNotchIcon className="size-5 animate-spin" /></div>
            ) : projects.length === 0 ? (
              <p className="text-body-5 text-(--on-bg-low) text-center py-2">Нет проектов</p>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.project_id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-(--outline) bg-(--card) p-2 pl-3 min-w-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-body-4 truncate">{p.title}</p>
                    </div>
                    <Input value={p.role_on_project || ""} onChange={(e) => setProjects(prev => prev.map(x => x.project_id === p.project_id ? { ...x, role_on_project: e.target.value } : x))} placeholder="Роль на проекте" className="h-8 w-full sm:max-w-[180px] text-xs shrink-0" />
                    <Button type="button" variant="text" size="icon-small" onClick={() => setProjects(prev => prev.filter(x => x.project_id !== p.project_id))}><XIcon className="size-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="m-0 px-6 py-4 border-t border-(--outline) bg-(--card) shrink-0 sm:justify-end">
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>Отмена</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <CircleNotchIcon className="size-4 animate-spin" />} Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
