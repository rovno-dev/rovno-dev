"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { PROJECTS } from "@/app/_data/projects";

export default function AdminProjectsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setProjects(Object.values(PROJECTS));
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
          <h1 className="text-display-2 mb-2">Проекты</h1>
          <p className="text-muted-foreground">Портфолио проектов</p>
        </div>
        <AdminTable
          data={projects}
          columns={[
            { key: "title", header: "Название" },
            { key: "category", header: "Категория" },
            { key: "period", header: "Период" },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
