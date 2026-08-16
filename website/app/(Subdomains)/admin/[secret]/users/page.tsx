"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { Card } from "@/components/ui/card";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  verified: boolean;
  blocked: boolean;
}

export default function AdminUsersPage({ params }: { params: Promise<{ secret: string }> }) {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/v1/admin/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => toast.error("Не удалось загрузить пользователей"))
      .finally(() => setLoading(false));
  }, [user]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }

  return (
    <CheckUser>
      <div className="space-y-6">
        <div>
          <h1 className="text-display-2 mb-2">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями системы</p>
        </div>
        <AdminTable
          data={users}
          columns={[
            { key: "email", header: "Email" },
            { key: "name", header: "Имя" },
            { key: "surname", header: "Фамилия" },
            { key: "role", header: "Роль" },
            { key: "verified", header: "Подтверждён", render: (u) => (u.verified ? "✅" : "❌") },
            { key: "blocked", header: "Заблокирован", render: (u) => (u.blocked ? "🚫" : "—") },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
