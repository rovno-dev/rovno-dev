"use client";
import { useEffect, useState } from "react";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { ARTICLES } from "@/app/blog/data";

export default function AdminArticlesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setArticles(ARTICLES);
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
          <h1 className="text-display-2 mb-2">Статьи</h1>
          <p className="text-muted-foreground">Блоговые записи</p>
        </div>
        <AdminTable
          data={articles}
          columns={[
            { key: "title", header: "Заголовок" },
            { key: "tags", header: "Теги", render: (a) => a.tags?.join(", ") || "—" },
            { key: "date", header: "Дата", render: (a) => new Date(a.date).toLocaleDateString() },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
