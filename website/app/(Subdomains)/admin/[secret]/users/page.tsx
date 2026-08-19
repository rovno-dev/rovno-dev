"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Pencil, Trash2, Plus } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  phone: string;
  role: string;
  verified: boolean;
  blocked: boolean;
}

const ROLE_OPTIONS = [
  { value: "client", label: "Клиент" },
  { value: "user", label: "Пользователь" },
  { value: "admin", label: "Администратор" },
  { value: "root", label: "Супер-администратор" },
];

export default function AdminUsersPage() {
  const { user: currentUser, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    surname: "",
    phone: "",
    role: "user",
    verified: false,
    blocked: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await $fetch("/api/v1/admin/users", { isToast: false });
      if (res.response?.ok) {
        setUsers(res.json);
      } else {
        toast.error("Не удалось загрузить пользователей");
      }
    } catch {
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchUsers();
  }, [currentUser]);

  if (userLoading || !currentUser) return null;
  if (currentUser.role !== "admin" && currentUser.role !== "root") {
    router.push("/");
    return null;
  }

  const isRoot = currentUser.role === "root";

  const openCreateDialog = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      surname: "",
      phone: "",
      role: "user",
      verified: false,
      blocked: false,
    });
    setFormErrors({});
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "",
      name: user.name || "",
      surname: user.surname || "",
      phone: user.phone || "",
      role: user.role,
      verified: user.verified,
      blocked: user.blocked,
    });
    setFormErrors({});
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Basic validation
    const errors: Record<string, string> = {};
    if (!formData.email) errors.email = "Email обязателен";
    if (isCreateMode && !formData.password) errors.password = "Пароль обязателен";
    if (isCreateMode && formData.password && formData.password.length < 8) errors.password = "Пароль должен быть не короче 8 символов";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    try {
      let res;
      if (isCreateMode) {
        res = await $fetch("/api/v1/admin/users", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // PATCH: only send changed fields (excluding password if empty)
        const patchData: any = {
          email: formData.email,
          name: formData.name,
          surname: formData.surname,
          phone: formData.phone,
          role: formData.role,
          verified: formData.verified,
          blocked: formData.blocked,
        };
        if (formData.password) patchData.password = formData.password;
        res = await $fetch(`/api/v1/admin/users/${editingUser!.id}`, {
          method: "PATCH",
          body: JSON.stringify(patchData),
          headers: { "Content-Type": "application/json" },
        });
      }
      if (res.response?.ok) {
        toast.success(isCreateMode ? "Пользователь создан" : "Пользователь обновлён");
        setIsDialogOpen(false);
        fetchUsers();
      } else {
        const detail = res.json?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors: Record<string, string> = {};
          detail.forEach((err: any) => {
            const loc = err.loc;
            if (loc && loc.length > 1) {
              const field = loc[1];
              fieldErrors[field] = err.msg;
            }
          });
          setFormErrors(fieldErrors);
        } else {
          toast.error(detail || "Ошибка");
        }
      }
    } catch {
      toast.error("Ошибка соединения");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;
    try {
      const res = await $fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.response?.ok) {
        toast.success("Пользователь удалён");
        fetchUsers();
      } else {
        toast.error(res.json?.detail || "Ошибка удаления");
      }
    } catch {
      toast.error("Ошибка соединения");
    }
  };

  const canEditUser = (user: User) => {
    if (isRoot) return true;
    // admin cannot edit other admins
    return user.role !== "admin";
  };

  const columns = [
    { key: "email", header: "Email" },
    { key: "name", header: "Имя" },
    { key: "surname", header: "Фамилия" },
    { key: "role", header: "Роль" },
    { key: "verified", header: "Подтверждён", render: (u: User) => (u.verified ? "✅" : "❌") },
    { key: "blocked", header: "Заблокирован", render: (u: User) => (u.blocked ? "🚫" : "—") },
    {
      key: "actions",
      header: "Действия",
      render: (u: User) => {
        const canEdit = canEditUser(u);
        return (
          <div className="flex gap-2">
            <Button
              size="icon-small"
              variant="text"
              onClick={() => openEditDialog(u)}
              disabled={!canEdit}
              title={!canEdit ? "Нельзя редактировать администратора" : "Редактировать"}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              size="icon-small"
              variant="text"
              onClick={() => handleDelete(u.id)}
              disabled={!canEdit || u.id === currentUser.id}
              title={u.id === currentUser.id ? "Нельзя удалить себя" : !canEdit ? "Нельзя удалить администратора" : "Удалить"}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display-2 mb-2">Пользователи</h1>
            <p className="text-muted-foreground">Управление пользователями системы</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="size-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>

        <div className="overflow-x-auto">
          <AdminTable
            data={users}
            columns={columns}
            isLoading={loading}
            emptyMessage="Пользователи не найдены"
          />
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreateMode ? "Создать пользователя" : "Редактировать пользователя"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isCreateMode} // email cannot be changed for existing user
              />
              <FieldError errors={formErrors.email ? [{ message: formErrors.email }] : []} />
            </Field>
            {isCreateMode && (
              <Field>
                <FieldLabel>Пароль *</FieldLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <FieldError errors={formErrors.password ? [{ message: formErrors.password }] : []} />
              </Field>
            )}
            {!isCreateMode && (
              <Field>
                <FieldLabel>Новый пароль (оставьте пустым, если не менять)</FieldLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </Field>
            )}
            <Field>
              <FieldLabel>Имя</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Фамилия</FieldLabel>
              <Input
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Телефон</FieldLabel>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Роль</FieldLabel>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                  id="verified"
                />
                <Label htmlFor="verified">Подтверждён</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.blocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, blocked: checked })}
                  id="blocked"
                />
                <Label htmlFor="blocked">Заблокирован</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </CheckUser>
  );
}
