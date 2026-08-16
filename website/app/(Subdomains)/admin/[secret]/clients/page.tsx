"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { CLIENTS } from "@/app/_data/clients";

export default function AdminClientsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setClients(Object.values(CLIENTS));
    setLoading(false);
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
          <h1 className="text-display-2 mb-2">Клиенты</h1>
          <p className="text-muted-foreground">Список клиентов агентства</p>
        </div>
        <AdminTable
          data={clients}
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Название" },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
