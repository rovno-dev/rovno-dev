"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  lifecycle_stage: string;
}

export default function AdminCompaniesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/v1/admin/companies`)
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch(() => toast.error("Не удалось загрузить компании"))
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
          <h1 className="text-display-2 mb-2">Компании</h1>
          <p className="text-muted-foreground">Управление компаниями-клиентами</p>
        </div>
        <AdminTable
          data={companies}
          columns={[
            { key: "name", header: "Название" },
            { key: "website", header: "Сайт" },
            { key: "industry", header: "Отрасль" },
            { key: "lifecycle_stage", header: "Стадия" },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
