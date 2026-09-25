"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CircleNotchIcon, UsersIcon, UserMinusIcon, UserPlusIcon, ArrowClockwiseIcon, FolderOpenIcon, PencilSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  fetchTeamMembers,
  removeTeamMember,
  type TeamMemberAdmin,
} from "@/utils/api/team";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { TeamMemberEditorDialog } from "./_components/team-member-editor-dialog";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; members: TeamMemberAdmin[] }
  | { kind: "error"; message: string };

export default function AdminTeamPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editing, setEditing] = useState<TeamMemberAdmin | null>(null);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const members = await fetchTeamMembers(includeInactive);
      setState({ kind: "ready", members });
    } catch (err: any) {
      setState({ kind: "error", message: err?.message || "Не удалось загрузить команду" });
    }
  }, [includeInactive]);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user, load]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }

  const handleRemove = async (m: TeamMemberAdmin) => {
    const label = m.user_name || m.user_username || m.user_email || "участника";
    if (!confirm(`Убрать ${label} из команды? Публичный профиль эксперта пропадёт.`)) return;
    try {
      await removeTeamMember(m.user_id);
      toast.success("Убран из команды");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Ошибка");
    }
  };

  const members = state.kind === "ready" ? state.members : [];
  const usersHref = secret ? `/admin/${secret}/users` : "/admin";

  return (
    <CheckUser>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Команда</h1>
            <p className="text-body-3 text-(--on-bg-medium)">
              {state.kind === "ready" ? (
                <>
                  {members.length}{" "}
                  {members.length === 1 ? "участник" : "участников"}
                  {includeInactive && " (включая неактивных)"}
                </>
              ) : (
                "Сотрудники агентства"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="text"
              size="small"
              onClick={() => setIncludeInactive((v) => !v)}
            >
              {includeInactive ? "Скрыть неактивных" : "Показать неактивных"}
            </Button>
            <Button variant="outlined" size="small" onClick={load}>
              {state.kind === "loading"
                ? <CircleNotchIcon className="size-4 animate-spin" />
                : <ArrowClockwiseIcon className="size-4" />}
              Обновить
            </Button>
            <Button asChild>
              <Link href={usersHref}>
                <UserPlus className="size-4" />
                Добавить в команду
              </Link>
            </Button>
          </div>
        </div>

        {/* Loading */}
        {state.kind === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="rounded-3xl border-(--outline) h-56 animate-pulse bg-muted/30"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {state.kind === "error" && (
          <Card className="rounded-3xl border border-[color-mix(in_srgb,var(--error),transparent_70%)] bg-[color-mix(in_srgb,var(--error),transparent_96%)] p-6">
            <p className="text-body-4 text-(--error) mb-3">{state.message}</p>
            <Button variant="outlined" size="small" onClick={load}>
              Повторить
            </Button>
          </Card>
        )}

        {/* Empty */}
        {state.kind === "ready" && members.length === 0 && (
          <Card className="rounded-3xl border-(--outline) p-10 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Users className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium) mb-4">
              В команде пока никого нет.
            </p>
            <Button asChild>
              <Link href={usersHref}>
                <UserPlus className="size-4" />
                Перейти к пользователям
              </Link>
            </Button>
          </Card>
        )}

        {/* Cards grid */}
        {state.kind === "ready" && members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {members.map((m) => {
              const displayName =
                m.user_name || m.user_surname
                  ? `${m.user_name ?? ""} ${m.user_surname ?? ""}`.trim()
                  : m.user_username || m.user_email || "Участник";
              return (
                <Card
                  key={m.id}
                  className={cn(
                    "group relative rounded-3xl border-(--outline) overflow-hidden cursor-pointer transition-all",
                    "hover:border-(--primary)/40 hover:shadow-lg hover:shadow-(--primary)/5",
                    !m.is_active && "opacity-60"
                  )}
                  onClick={() => setEditing(m)}
                >
                  {/* Cover preview or gradient */}
                  <div className="relative w-full aspect-[21/8] bg-muted overflow-hidden">
                    {m.cover_url ? (
                      <Image
                        src={m.cover_url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
                    )}
                    {/* Status pill */}
                    <div className="absolute top-3 right-3 flex gap-1">
                      {!m.is_active && (
                        <Badge
                          variant="glass-static"
                          size="chip-small"
                          className="text-white border-white/20"
                        >
                          Скрыт
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Identity row overlapping the cover slightly */}
                  <div className="px-5 pb-5 -mt-8 relative">
                    <div className="relative size-16 rounded-full overflow-hidden border-4 border-(--card) bg-muted shrink-0">
                      {m.user_avatar_url ? (
                        <Image src={m.user_avatar_url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-(--on-bg-low)">
                          <Users className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      <h3 className="text-heading-4 truncate">{displayName}</h3>
                      <p className="text-body-4 text-(--primary) truncate">{m.role}</p>
                      {m.user_username && (
                        <p className="text-body-5 text-(--on-bg-low) truncate">
                          @{m.user_username}
                        </p>
                      )}
                    </div>
                    {m.bio && (
                      <p className="mt-3 text-body-4 text-(--on-bg-medium) line-clamp-2">
                        {m.bio}
                      </p>
                    )}

                    {/* Footer row: sort order + actions */}
                    <div className="mt-4 pt-3 border-t border-(--outline) flex items-center gap-2">
                      <span className="text-body-6 text-(--on-bg-low) font-mono">
                        sort {m.sort_order}
                      </span>
                      <div className="ml-auto flex gap-1">
                        <Button
                          variant="text"
                          size="icon-small"
                          onClick={(e) => { e.stopPropagation(); setEditing(m); }}
                          title="Редактировать"
                        >
                          <PencilSimple className="size-4" />
                        </Button>
                        <Button
                          variant="text"
                          size="icon-small"
                          onClick={(e) => { e.stopPropagation(); handleRemove(m); }}
                          title="Убрать из команды"
                        >
                          <UserMinus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hover hint: entire card opens the editor */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-(--primary)/20 rounded-3xl transition-colors" />
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor dialog */}
      <TeamMemberEditorDialog
        member={editing}
        open={!!editing}
        onOpenChange={(open) => { if (!open) setEditing(null); }}
        onSaved={load}
      />
    </CheckUser>
  );
}
