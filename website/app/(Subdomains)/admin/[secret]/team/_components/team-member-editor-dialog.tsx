"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { toast } from "sonner";
import {
  CircleNotchIcon, XIcon, PlusIcon, MagnifyingGlassIcon, UserIcon as UserIcon, FolderOpenIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
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

export function TeamMemberEditorDialog({
  member,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  // -- Form state --
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // -- Project pinning state --
  const [projects, setProjects] = useState<TeamMemberProject[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectPickerItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  // Reset form whenever a different member is opened.
  useEffect(() => {
    if (!member) return;
    setRole(member.role || "");
    setBio(member.bio || "");
    setCoverUrl(member.cover_url || "");
    setSortOrder(member.sort_order ?? 0);
    setIsActive(member.is_active);
    setPickerOpen(false);
    setProjectSearch("");
  }, [member]);

  // Load projects lazily when the dialog opens.
  useEffect(() => {
    if (!open || !member) return;
    let cancelled = false;
    setProjectsLoading(true);
    Promise.all([
      fetchTeamMemberProjects(member.user_id),
      fetchProjectsForPicker(),
    ])
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
    return () => {
      cancelled = true;
    };
  }, [open, member]);

  // Available-to-add: everything that isn't already pinned, matching search.
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
    setProjects((prev) => [
      ...prev,
      {
        project_id: p.id,
        title: p.title,
        slug: p.slug,
        period: p.period,
        role_on_project: null,
      },
    ]);
    setPickerOpen(false);
    setProjectSearch("");
  };

  const removeProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.project_id !== projectId));
  };

  const setProjectRole = (projectId: string, role: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.project_id === projectId ? { ...p, role_on_project: role } : p
      )
    );
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
      });
      await setTeamMemberProjects(
        member.user_id,
        projects.map((p) => ({
          project_id: p.project_id,
          role_on_project: p.role_on_project?.trim() || null,
        }))
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden border border-(--outline) bg-muted shrink-0">
              {member.user_avatar_url ? (
                <Image src={member.user_avatar_url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-(--on-bg-low)">
                  <UserIcon className="size-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate">{displayName}</p>
              <p className="text-body-5 font-normal text-(--on-bg-low) truncate">
                {member.user_email}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ---- Identity block (read-only) ---- */}
          <Card className="rounded-2xl border-(--outline) bg-(--card) p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {member.is_active ? (
                <Badge
                  variant="tonal-card-static"
                  size="chip-small"
                  className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                >
                  Активен
                </Badge>
              ) : (
                <Badge
                  variant="tonal-card-static"
                  size="chip-small"
                  className="bg-rose-500/15 text-rose-500 border-rose-500/30"
                >
                  Неактивен
                </Badge>
              )}
              {member.user_username && (
                <span className="text-body-5 text-(--on-bg-low)">
                  @{member.user_username}
                </span>
              )}
              {member.user_bio && (
                <span className="text-body-5 text-(--on-bg-medium) truncate">
                  · {member.user_bio}
                </span>
              )}
            </div>
            <p className="text-body-6 text-(--on-bg-low)">
              Публичная страница: <code className="font-mono">/{member.user_username || "—"}</code>
            </p>
          </Card>

          {/* ---- Core fields ---- */}
          <Field>
            <FieldLabel>Роль в команде <span className="text-destructive">*</span></FieldLabel>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Со-основатель и CTO"
            />
          </Field>

          <Field>
            <FieldLabel>Профессиональное био</FieldLabel>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Опишите опыт, специализацию, подход…"
              className="min-h-[120px]"
            />
          </Field>

          <Field>
            <FieldLabel>Обложка страницы эксперта (21:8)</FieldLabel>
            <ImageUploadField
              value={coverUrl}
              onChange={setCoverUrl}
              placeholder="/uploads/images/… или https://…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Порядок сортировки</FieldLabel>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
              <p className="text-body-6 text-(--on-bg-low) mt-1">
                Меньше — выше в списке
              </p>
            </Field>
            <Field>
              <FieldLabel>Активен</FieldLabel>
              <div className="flex items-center gap-3 h-10">
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is-active" className="text-body-4">
                  {isActive ? "Показывается публично" : "Скрыт из команды"}
                </Label>
              </div>
            </Field>
          </div>

          {/* ---- Projects pinning ---- */}
          <div className="space-y-3 pt-4 border-t border-(--outline)">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="size-5 text-(--primary)" />
                <h3 className="text-heading-4">Проекты</h3>
                <span className="text-body-5 text-(--on-bg-low)">
                  {projects.length}
                </span>
              </div>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => setPickerOpen((v) => !v)}
              >
                <Plus className="size-4" />
                Добавить проект
              </Button>
            </div>

            {/* Picker */}
            {pickerOpen && (
              <Card className="rounded-2xl border-(--outline) p-3 space-y-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
                  <Input
                    autoFocus
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Найти проект…"
                    className="pl-9"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {filteredPickerProjects.length === 0 ? (
                    <p className="text-body-5 text-(--on-bg-low) py-2 text-center">
                      Ничего не найдено
                    </p>
                  ) : (
                    filteredPickerProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addProject(p)}
                        className="w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-(--state-hover) transition-colors"
                      >
                        <span className="truncate">{p.title}</span>
                        {p.period && (
                          <span className="text-body-6 text-(--on-bg-low) shrink-0">
                            {p.period}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </Card>
            )}

            {/* Assigned list */}
            {projectsLoading ? (
              <div className="flex items-center justify-center py-6 text-(--on-bg-low)">
                <CircleNotchIcon className="size-4 animate-spin mr-2" />
                Загрузка…
              </div>
            ) : projects.length === 0 ? (
              <p className="text-body-5 text-(--on-bg-low) text-center py-4">
                Проекты не привязаны
              </p>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <div
                    key={p.project_id}
                    className="flex items-center gap-2 rounded-xl border border-(--outline) bg-(--card) p-2 pl-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-body-4 truncate">{p.title || p.project_id}</p>
                      {p.period && (
                        <p className="text-body-6 text-(--on-bg-low)">{p.period}</p>
                      )}
                    </div>
                    <Input
                      value={p.role_on_project || ""}
                      onChange={(e) => setProjectRole(p.project_id, e.target.value)}
                      placeholder="Роль на проекте"
                      className="h-8 max-w-[160px] text-xs"
                    />
                    <Button
                      type="button"
                      variant="text"
                      size="icon-small"
                      onClick={() => removeProject(p.project_id)}
                      aria-label="Убрать"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outlined" onClick={() => onOpenChange(false)} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <CircleNotchIcon className="size-4 animate-spin" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
