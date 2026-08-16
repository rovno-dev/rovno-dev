"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { EXPERTS_DATA } from "@/app/_data/experts";

export default function AdminTeamPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setTeam(Object.values(EXPERTS_DATA));
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
          <h1 className="text-display-2 mb-2">Команда</h1>
          <p className="text-muted-foreground">Сотрудники агентства</p>
        </div>
        <AdminTable
          data={team}
          columns={[
            { key: "name", header: "Имя" },
            { key: "role", header: "Роль" },
            { key: "description", header: "Описание" },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
