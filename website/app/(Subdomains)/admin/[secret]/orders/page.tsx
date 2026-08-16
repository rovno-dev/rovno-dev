"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Order {
  id: string;
  contact_id: string;
  service_types_json: string[];
  about: string;
  estimate_deadline: string;
  estimate_budget: string;
  naming_help: string;
  created_at: string;
}

export default function AdminOrdersPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/v1/admin/order-requests`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(() => toast.error("Не удалось загрузить заявки"))
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
          <h1 className="text-display-2 mb-2">Заявки</h1>
          <p className="text-muted-foreground">Входящие заказы и запросы</p>
        </div>
        <AdminTable
          data={orders}
          columns={[
            { key: "id", header: "ID" },
            { key: "about", header: "Описание" },
            { key: "service_types_json", header: "Услуги", render: (o) => (o.service_types_json?.join(", ") || "—") },
            { key: "estimate_deadline", header: "Срок" },
            { key: "estimate_budget", header: "Бюджет" },
            { key: "naming_help", header: "Нейминг" },
            { key: "created_at", header: "Дата", render: (o) => new Date(o.created_at).toLocaleDateString() },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
