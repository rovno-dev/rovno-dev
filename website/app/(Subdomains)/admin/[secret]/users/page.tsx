"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ImageUploadField } from "@/components/editor/image-upload-field";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
  UsersIcon,
  UserMinusIcon,
  RowsIcon,
  GridFourIcon,
  EnvelopeSimple,
  TelegramLogo,
  PhoneIcon,
  CheckCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";
import {
  makeTeamMember,
  removeTeamMember,
  fetchTeamMembers,
} from "@/utils/api/team";

// ─────────────────────────────────────────────────────────────────────
// Types + constants
// ─────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string;
  verified: boolean;
  blocked: boolean;
  telegram_chat_id?: string | null;
}

const ROLE_OPTIONS = [
  { value: "client", label: "Клиент" },
  { value: "user", label: "Пользователь" },
  { value: "admin", label: "Администратор" },
  { value: "root", label: "Супер-администратор" },
];

// Role treatment is deliberately quiet. Only root takes the brand accent
// — everything else sits in the neutral outline so a role never competes
// with the content for attention.
const ROLE_STYLE: Record<string, { label: string; className: string }> = {
  root: {
    label: "Root",
    className: "border-(--primary)/45 text-(--primary)",
  },
  admin: {
    label: "Admin",
    className: "border-(--on-bg-low)/45 text-(--on-bg-high)",
  },
  user: {
    label: "User",
    className: "border-(--outline) text-(--on-bg-medium)",
  },
  client: {
    label: "Client",
    className: "border-(--outline) text-(--on-bg-medium)",
  },
};

type ViewMode = "cards" | "table";

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function fullName(u: User): string {
  return [u.name, u.surname].filter(Boolean).join(" ").trim();
}
function displayName(u: User): string {
  return fullName(u) || u.username || u.email.split("@")[0] || "Без имени";
}
function initials(u: User): string {
  const full = fullName(u);
  if (full) {
    return full
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return (u.email[0] ?? "?").toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { user: currentUser, isLoading: userLoading } = useUser();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("cards");

  // Text search
  const [query, setQuery] = useState("");

  // Filters — every dimension is independent; "all" is a no-op pass-through.
  const [roleFilter, setRoleFilter] =
    useState<"all" | "client" | "user" | "admin" | "root">("all");
  const [verifiedFilter, setVerifiedFilter] =
    useState<"all" | "verified" | "unverified">("all");
  const [blockedFilter, setBlockedFilter] =
    useState<"all" | "active" | "blocked">("all");
  const [teamFilter, setTeamFilter] =
    useState<"all" | "team" | "external">("all");

  // teamUserId → role. Loaded once alongside the user list.
  const [teamRoles, setTeamRoles] = useState<Record<string, string>>({});

  // Dialog state.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  // "Make team member" dialog state.
  const [teamDialogUser, setTeamDialogUser] = useState<User | null>(null);
  const [teamRole, setTeamRole] = useState("");
  const [teamBio, setTeamBio] = useState("");
  const [teamSaving, setTeamSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, team] = await Promise.all([
        $fetch("/api/v1/admin/users", { isToast: false }),
        fetchTeamMembers().catch(() => []),
      ]);
      if (usersRes.response?.ok) {
        setUsers(usersRes.json as User[]);
      } else {
        toast.error("Не удалось загрузить пользователей");
      }
      const lookup: Record<string, string> = {};
      for (const m of team) lookup[m.user_id] = m.role;
      setTeamRoles(lookup);
    } catch {
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    load();
  }, [currentUser, load]);

  if (userLoading || !currentUser) return null;
  if (currentUser.role !== "admin" && currentUser.role !== "root") {
    router.push("/");
    return null;
  }

  const isRoot = currentUser.role === "root";
  const canEdit = (u: User) => {
    if (isRoot) return true;
    return u.role !== "admin";
  };

  // ── Filtering ─────────────────────────────────────────────────────
  // Every dimension ANDs together. Team membership is derived from the
  // teamRoles map loaded alongside the user list.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (q) {
        const hit = [u.email, u.name, u.surname, u.phone, u.username]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (verifiedFilter === "verified" && !u.verified) return false;
      if (verifiedFilter === "unverified" && u.verified) return false;
      if (blockedFilter === "blocked" && !u.blocked) return false;
      if (blockedFilter === "active" && u.blocked) return false;
      const isTeam = !!teamRoles[u.id];
      if (teamFilter === "team" && !isTeam) return false;
      if (teamFilter === "external" && isTeam) return false;
      return true;
    });
  }, [
    users,
    query,
    roleFilter,
    verifiedFilter,
    blockedFilter,
    teamFilter,
    teamRoles,
  ]);

  const hasActiveFilters =
    !!query.trim() ||
    roleFilter !== "all" ||
    verifiedFilter !== "all" ||
    blockedFilter !== "all" ||
    teamFilter !== "all";

  const resetFilters = () => {
    setQuery("");
    setRoleFilter("all");
    setVerifiedFilter("all");
    setBlockedFilter("all");
    setTeamFilter("all");
  };

  // ── Actions ───────────────────────────────────────────────────────
  const handleDelete = async (u: User) => {
    if (
      !confirm(`Удалить пользователя ${u.email}? Действие нельзя отменить.`)
    )
      return;
    try {
      const res = await $fetch(`/api/v1/admin/users/${u.id}`, {
        method: "DELETE",
      });
      if (res.response?.ok) {
        toast.success("Пользователь удалён");
        load();
      } else {
        toast.error(res.json?.detail || "Ошибка удаления");
      }
    } catch {
      toast.error("Ошибка соединения");
    }
  };

  const handleMakeTeamMember = async () => {
    if (!teamDialogUser || !teamRole.trim()) return;
    setTeamSaving(true);
    try {
      await makeTeamMember(teamDialogUser.id, {
        role: teamRole.trim(),
        bio: teamBio.trim() || undefined,
      });
      toast.success("Пользователь добавлен в команду");
      setTeamDialogUser(null);
      setTeamRole("");
      setTeamBio("");
      load();
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    } finally {
      setTeamSaving(false);
    }
  };

  const handleRemoveTeamMember = async (u: User) => {
    if (!confirm("Убрать пользователя из команды?")) return;
    try {
      await removeTeamMember(u.id);
      toast.success("Пользователь убран из команды");
      load();
    } catch (err: any) {
      toast.error(err.message || "Ошибка");
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <CheckUser>
      <div className="space-y-6">
        {/* Header — title left, controls right on one baseline. */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-display-2 tracking-tight">Пользователи</h1>
            <p className="text-body-4 text-(--on-bg-low) mt-1 tabular-nums">
              {loading
                ? "Загрузка…"
                : hasActiveFilters
                  ? `${filtered.length} из ${users.length}`
                  : `${users.length} пользователей`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewSwitcher value={view} onChange={setView} />
            <Button
              variant="outlined"
              size="icon-small"
              onClick={load}
              disabled={loading}
              aria-label="Обновить"
            >
              <ArrowClockwiseIcon
                className={cn("size-4", loading && "animate-spin")}
              />
            </Button>
            <Button
              size="small"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <PlusIcon className="size-3.5" />
              Добавить
            </Button>
          </div>
        </div>

        {/* Search + filters. Flat input, then a compact strip of
            segmented controls. No outer card — the strip reads as an
            instrument rail rather than another container. */}
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-(--on-bg-low) pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени, email, телефону, username…"
              className="pl-9 h-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <FilterGroup
              label="Роль"
              value={roleFilter}
              options={[
                { value: "all", label: "Все" },
                { value: "client", label: "Клиент" },
                { value: "user", label: "Пользователь" },
                { value: "admin", label: "Админ" },
                { value: "root", label: "Root" },
              ]}
              onChange={(v) => setRoleFilter(v as typeof roleFilter)}
            />
            <FilterGroup
              label="Статус"
              value={verifiedFilter}
              options={[
                { value: "all", label: "Все" },
                { value: "verified", label: "Подтв." },
                { value: "unverified", label: "Не подтв." },
              ]}
              onChange={(v) => setVerifiedFilter(v as typeof verifiedFilter)}
            />
            <FilterGroup
              label="Доступ"
              value={blockedFilter}
              options={[
                { value: "all", label: "Все" },
                { value: "active", label: "Активные" },
                { value: "blocked", label: "Заблок." },
              ]}
              onChange={(v) => setBlockedFilter(v as typeof blockedFilter)}
            />
            <FilterGroup
              label="Команда"
              value={teamFilter}
              options={[
                { value: "all", label: "Все" },
                { value: "team", label: "В команде" },
                { value: "external", label: "Вне" },
              ]}
              onChange={(v) => setTeamFilter(v as typeof teamFilter)}
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-body-5 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors"
              >
                <XIcon className="size-3" />
                Сбросить
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className={cn(
              view === "cards"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
                : "space-y-2",
            )}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border border-(--outline) bg-(--card) animate-pulse",
                  view === "cards" ? "h-40" : "h-14",
                )}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-(--outline) p-12 text-center">
            <p className="text-body-3 text-(--on-bg-medium)">
              {hasActiveFilters
                ? "Ничего не найдено"
                : "Пользователей пока нет"}
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && view === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((u) => (
              <UserCard
                key={u.id}
                user={u}
                teamRole={teamRoles[u.id]}
                canEdit={canEdit(u)}
                isSelf={u.id === currentUser.id}
                onEdit={() => {
                  setEditing(u);
                  setDialogOpen(true);
                }}
                onDelete={() => handleDelete(u)}
                onAddToTeam={() => {
                  setTeamDialogUser(u);
                  setTeamRole("");
                  setTeamBio("");
                }}
                onRemoveFromTeam={() => handleRemoveTeamMember(u)}
              />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && view === "table" && (
          <UserTable
            users={filtered}
            teamRoles={teamRoles}
            currentUserId={currentUser.id}
            canEdit={canEdit}
            onEdit={(u) => {
              setEditing(u);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            onAddToTeam={(u) => {
              setTeamDialogUser(u);
              setTeamRole("");
              setTeamBio("");
            }}
            onRemoveFromTeam={handleRemoveTeamMember}
          />
        )}
      </div>

      {/* Editor */}
      <UserEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        isRoot={isRoot}
        onSaved={load}
      />

      {/* Add to team */}
      <Dialog
        open={!!teamDialogUser}
        onOpenChange={(open) => {
          if (!open) setTeamDialogUser(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить в команду</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {teamDialogUser && (
              <p className="text-body-4 text-(--on-bg-medium)">
                {displayName(teamDialogUser)}
              </p>
            )}
            <Field>
              <FieldLabel>
                Роль <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                value={teamRole}
                onChange={(e) => setTeamRole(e.target.value)}
                placeholder="Со-основатель и CTO"
              />
            </Field>
            <Field>
              <FieldLabel>Био (опционально)</FieldLabel>
              <Textarea
                value={teamBio}
                onChange={(e) => setTeamBio(e.target.value)}
                placeholder="Опишите опыт и специализацию"
                className="min-h-[100px]"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              variant="outlined"
              onClick={() => setTeamDialogUser(null)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleMakeTeamMember}
              disabled={!teamRole.trim() || teamSaving}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ViewSwitcher — segmented control, single group
// ─────────────────────────────────────────────────────────────────────
function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-(--outline) bg-(--card) p-0.5 h-9">
      {(
        [
          { id: "cards" as const, icon: GridFourIcon, label: "Карточки" },
          { id: "table" as const, icon: RowsIcon, label: "Таблица" },
        ]
      ).map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            title={opt.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 h-8 text-xs font-medium transition-colors",
              isActive
                ? "bg-(--on-bg-high) text-(--bg)"
                : "text-(--on-bg-medium) hover:text-(--on-bg-high)",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// FilterGroup — small-caps label + a single segmented chip row
// ─────────────────────────────────────────────────────────────────────
function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] uppercase tracking-[0.16em] text-(--on-bg-low) shrink-0">
        {label}
      </span>
      <div className="inline-flex items-center rounded-md border border-(--outline) bg-(--card) p-0.5 h-8">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center rounded px-2 h-7 text-xs font-medium transition-colors whitespace-nowrap",
              value === o.value
                ? "bg-(--on-bg-high) text-(--bg)"
                : "text-(--on-bg-medium) hover:text-(--on-bg-high)",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// RoleTag — thin outline, monochrome except root
// ─────────────────────────────────────────────────────────────────────
function RoleTag({ role }: { role: string }) {
  const s = ROLE_STYLE[role] ?? ROLE_STYLE.user;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 h-5 text-[10px] uppercase tracking-[0.12em] font-medium",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────
// UserCard — cards view entry
// ─────────────────────────────────────────────────────────────────────
function UserCard({
  user,
  teamRole,
  canEdit,
  isSelf,
  onEdit,
  onDelete,
  onAddToTeam,
  onRemoveFromTeam,
}: {
  user: User;
  teamRole?: string;
  canEdit: boolean;
  isSelf: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToTeam: () => void;
  onRemoveFromTeam: () => void;
}) {
  // Order notifications are admin/root-only — plain users never receive
  // them. The linked chat id is only meaningful for a user who could ever
  // receive a notification, so we surface it only on admin-like rows.
  const isAdminLike = user.role === "admin" || user.role === "root";

  return (
    <div
      className={cn(
        "group rounded-2xl border border-(--outline) bg-(--card) flex flex-col",
        "transition-colors hover:border-(--on-bg-low)/40",
      )}
    >
      {/* Identity */}
      <div className="p-4 flex items-start gap-3">
        <Avatar className="size-10 shrink-0 ring-1 ring-(--outline)">
          {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
          <AvatarFallback className="text-body-3 font-medium">
            {initials(user)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-body-2 font-medium truncate">
              {displayName(user)}
            </h3>
            {user.verified && (
              <CheckCircleIcon
                className="size-3.5 text-(--on-bg-low) shrink-0"
                weight="fill"
              />
            )}
            {user.blocked && (
              <span className="text-[10px] uppercase tracking-wider text-(--on-bg-low)">
                заблокирован
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <RoleTag role={user.role} />
            {teamRole && (
              <span className="text-[10px] uppercase tracking-[0.12em] text-(--on-bg-low) truncate">
                · {teamRole}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contacts — plain text rows. No chips. */}
      <div className="px-4 pb-3 space-y-1 text-body-4 text-(--on-bg-medium)">
        <a
          href={`mailto:${user.email}`}
          className="flex items-center gap-2 hover:text-(--primary) transition-colors truncate"
        >
          <EnvelopeSimple className="size-3.5 shrink-0 text-(--on-bg-low)" />
          <span className="truncate">{user.email}</span>
        </a>
        {user.phone && (
          <a
            href={`tel:${user.phone}`}
            className="flex items-center gap-2 hover:text-(--primary) transition-colors"
          >
            <PhoneIcon className="size-3.5 shrink-0 text-(--on-bg-low)" />
            <span>{user.phone}</span>
          </a>
        )}
        {isAdminLike && user.telegram_chat_id && (
          <div className="flex items-center gap-2 text-(--on-bg-low)">
            <TelegramLogo className="size-3.5 shrink-0" />
            <span className="font-mono text-[11px] truncate">
              {user.telegram_chat_id}
            </span>
          </div>
        )}
      </div>

      {/* Actions — always visible, quiet. */}
      <div className="mt-auto px-2 py-2 border-t border-(--outline) flex items-center gap-0.5">
        <button
          type="button"
          onClick={onEdit}
          disabled={!canEdit}
          title={canEdit ? "Редактировать" : "Нет доступа"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-2 h-8 text-body-4 transition-colors",
            canEdit
              ? "text-(--on-bg-medium) hover:text-(--on-bg-high) hover:bg-(--state-hover)"
              : "text-(--on-bg-low) opacity-50 cursor-not-allowed",
          )}
        >
          <PencilSimpleIcon className="size-3.5" />
          Изменить
        </button>
        {teamRole ? (
          <button
            type="button"
            onClick={onRemoveFromTeam}
            title="Убрать из команды"
            className="inline-flex items-center justify-center size-8 rounded text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
          >
            <UserMinusIcon className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddToTeam}
            title="Сделать участником команды"
            className="inline-flex items-center justify-center size-8 rounded text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
          >
            <UsersIcon className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={!canEdit || isSelf}
          title={
            isSelf
              ? "Нельзя удалить себя"
              : canEdit
                ? "Удалить"
                : "Нет доступа"
          }
          className={cn(
            "ml-auto inline-flex items-center justify-center size-8 rounded transition-colors",
            !canEdit || isSelf
              ? "text-(--on-bg-low) opacity-50 cursor-not-allowed"
              : "text-(--on-bg-low) hover:text-(--error) hover:bg-[color-mix(in_srgb,var(--error),transparent_92%)]",
          )}
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// UserTable — table view
// ─────────────────────────────────────────────────────────────────────
function UserTable({
  users,
  teamRoles,
  currentUserId,
  canEdit,
  onEdit,
  onDelete,
  onAddToTeam,
  onRemoveFromTeam,
}: {
  users: User[];
  teamRoles: Record<string, string>;
  currentUserId: string;
  canEdit: (u: User) => boolean;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  onAddToTeam: (u: User) => void;
  onRemoveFromTeam: (u: User) => void;
}) {
  return (
    <div className="rounded-2xl border border-(--outline) bg-(--card) overflow-hidden">
      <div className="overflow-x-auto scrollbar-admin">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-(--outline)">
              <Th>Пользователь</Th>
              <Th>Контакты</Th>
              <Th>Роль</Th>
              <Th>Статус</Th>
              <Th align="right">Действия</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const editable = canEdit(u);
              const isSelf = u.id === currentUserId;
              const teamRole = teamRoles[u.id];
              return (
                <tr
                  key={u.id}
                  className="border-b border-(--outline) last:border-b-0 hover:bg-(--state-hover) transition-colors"
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8 shrink-0 ring-1 ring-(--outline)">
                        {u.avatar_url && (
                          <AvatarImage src={u.avatar_url} alt="" />
                        )}
                        <AvatarFallback className="text-[11px] font-medium">
                          {initials(u)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-body-3 font-medium truncate">
                            {displayName(u)}
                          </span>
                          {u.verified && (
                            <CheckCircleIcon
                              className="size-3 text-(--on-bg-low) shrink-0"
                              weight="fill"
                            />
                          )}
                        </div>
                        {u.username && (
                          <p className="text-body-5 text-(--on-bg-low) truncate">
                            @{u.username}
                          </p>
                        )}
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="space-y-0.5">
                      <p className="text-body-4 text-(--on-bg-medium) truncate max-w-[220px]">
                        {u.email}
                      </p>
                      {u.phone && (
                        <p className="text-body-5 text-(--on-bg-low)">
                          {u.phone}
                        </p>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2 flex-wrap">
                      <RoleTag role={u.role} />
                      {teamRole && (
                        <span className="text-body-5 text-(--on-bg-low) truncate">
                          {teamRole}
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2 text-body-5">
                      {u.verified ? (
                        <span className="text-(--on-bg-medium)">Подтв.</span>
                      ) : (
                        <span className="text-(--on-bg-low)">Не подтв.</span>
                      )}
                      {u.blocked && (
                        <span className="text-(--error)">блок</span>
                      )}
                    </div>
                  </Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => onEdit(u)}
                        disabled={!editable}
                        title={editable ? "Редактировать" : "Нет доступа"}
                        className={cn(
                          "inline-flex items-center justify-center size-8 rounded transition-colors",
                          editable
                            ? "text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover)"
                            : "opacity-40 cursor-not-allowed",
                        )}
                      >
                        <PencilSimpleIcon className="size-4" />
                      </button>
                      {teamRole ? (
                        <button
                          type="button"
                          onClick={() => onRemoveFromTeam(u)}
                          title="Убрать из команды"
                          className="inline-flex items-center justify-center size-8 rounded text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                        >
                          <UserMinusIcon className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddToTeam(u)}
                          title="Сделать участником команды"
                          className="inline-flex items-center justify-center size-8 rounded text-(--on-bg-low) hover:text-(--on-bg-high) hover:bg-(--state-hover) transition-colors"
                        >
                          <UsersIcon className="size-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(u)}
                        disabled={!editable || isSelf}
                        title={
                          isSelf
                            ? "Нельзя удалить себя"
                            : editable
                              ? "Удалить"
                              : "Нет доступа"
                        }
                        className={cn(
                          "inline-flex items-center justify-center size-8 rounded transition-colors",
                          !editable || isSelf
                            ? "text-(--on-bg-low) opacity-40 cursor-not-allowed"
                            : "text-(--on-bg-low) hover:text-(--error) hover:bg-[color-mix(in_srgb,var(--error),transparent_92%)]",
                        )}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-medium text-(--on-bg-low) whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </td>
  );
}

// ─────────────────────────────────────────────────────────────────────
// UserEditorDialog
// ─────────────────────────────────────────────────────────────────────
interface FormState {
  email: string;
  password: string;
  name: string;
  surname: string;
  phone: string;
  username: string;
  avatar_url: string;
  role: string;
  verified: boolean;
  blocked: boolean;
}

function emptyForm(): FormState {
  return {
    email: "",
    password: "",
    name: "",
    surname: "",
    phone: "",
    username: "",
    avatar_url: "",
    role: "user",
    verified: false,
    blocked: false,
  };
}

function UserEditorDialog({
  open,
  onOpenChange,
  user,
  isRoot,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isRoot: boolean;
  onSaved: () => void;
}) {
  const isCreate = !user;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (user) {
      setForm({
        email: user.email,
        password: "",
        name: user.name ?? "",
        surname: user.surname ?? "",
        phone: user.phone ?? "",
        username: user.username ?? "",
        avatar_url: user.avatar_url ?? "",
        role: user.role,
        verified: user.verified,
        blocked: user.blocked,
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [open, user]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Email обязателен";
    if (isCreate && !form.password) next.password = "Пароль обязателен";
    if (isCreate && form.password && form.password.length < 8)
      next.password = "Минимум 8 символов";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      let res;
      if (isCreate) {
        res = await $fetch("/api/v1/admin/users", {
          method: "POST",
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            name: form.name.trim() || null,
            surname: form.surname.trim() || null,
            phone: form.phone.trim() || null,
            role: form.role,
            verified: form.verified,
            blocked: form.blocked,
          }),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        const payload: Record<string, unknown> = {
          email: form.email.trim(),
          name: form.name.trim() || null,
          surname: form.surname.trim() || null,
          phone: form.phone.trim() || null,
          username: form.username.trim() || null,
          avatar_url: form.avatar_url.trim() || null,
          role: form.role,
          verified: form.verified,
          blocked: form.blocked,
        };
        if (form.password) payload.password = form.password;
        res = await $fetch(`/api/v1/admin/users/${user!.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        });
      }
      if (res.response?.ok) {
        toast.success(
          isCreate ? "Пользователь создан" : "Пользователь обновлён",
        );
        onOpenChange(false);
        onSaved();
      } else {
        const detail = res.json?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors: Record<string, string> = {};
          detail.forEach((err: any) => {
            const loc = err.loc;
            if (loc && loc.length > 1) fieldErrors[loc[1]] = err.msg;
          });
          setErrors(fieldErrors);
        } else {
          toast.error(detail || "Ошибка сохранения");
        }
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = isRoot
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((o) => o.value !== "root");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-admin p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-(--outline)">
          <DialogTitle className="text-heading-3">
            {isCreate ? "Новый пользователь" : "Редактирование"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Avatar (edit only) */}
          {!isCreate && (
            <div className="flex items-start gap-4">
              <Avatar className="size-16 shrink-0 ring-1 ring-(--outline)">
                {form.avatar_url && (
                  <AvatarImage src={form.avatar_url} alt="" />
                )}
                <AvatarFallback className="text-heading-2 font-medium">
                  {initials({
                    ...emptyForm(),
                    email: form.email,
                    name: form.name,
                    surname: form.surname,
                  } as unknown as User)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <FieldLabel className="mb-2">Аватар</FieldLabel>
                <ImageUploadField
                  value={form.avatar_url}
                  onChange={(v) => update("avatar_url", v)}
                  placeholder="/uploads/images/… или https://…"
                />
              </div>
            </div>
          )}

          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field className="md:col-span-2" data-invalid={!!errors.email}>
              <FieldLabel>
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
              {errors.email && (
                <FieldError errors={[{ message: errors.email }]} />
              )}
            </Field>
            <Field>
              <FieldLabel>Имя</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Фамилия</FieldLabel>
              <Input
                value={form.surname}
                onChange={(e) => update("surname", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Телефон</FieldLabel>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Username</FieldLabel>
              <Input
                value={form.username}
                onChange={(e) =>
                  update(
                    "username",
                    e.target.value.replace(/[^A-Za-z0-9_]/g, ""),
                  )
                }
                placeholder="для публичной страницы"
              />
            </Field>
          </div>

          {/* Role + flags */}
          <div className="pt-3 border-t border-(--outline) grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Роль</FieldLabel>
              <Select
                value={form.role}
                onValueChange={(v) => update("role", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex flex-col gap-3 justify-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch
                  checked={form.verified}
                  onCheckedChange={(v) => update("verified", v)}
                />
                <span className="text-body-4">Подтверждён</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Switch
                  checked={form.blocked}
                  onCheckedChange={(v) => update("blocked", v)}
                />
                <span className="text-body-4">Заблокирован</span>
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="pt-3 border-t border-(--outline)">
            <Field data-invalid={!!errors.password}>
              <FieldLabel>
                {isCreate ? "Пароль" : "Смена пароля"}
                {isCreate && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FieldLabel>
              <PasswordInput
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder={
                  isCreate
                    ? "Минимум 8 символов, цифра и заглавная буква"
                    : "Оставьте пустым, чтобы не менять"
                }
              />
              {errors.password && (
                <FieldError errors={[{ message: errors.password }]} />
              )}
            </Field>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-(--outline)">
          <Button
            variant="outlined"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
