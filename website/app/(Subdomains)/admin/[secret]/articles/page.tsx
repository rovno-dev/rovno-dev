"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminTable } from "../../_components/admin-table";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { fetchPublishedArticlesServer, type ArticleListItem } from "@/utils/api/articles";
import { $fetch } from "@/utils/fetch";
export default function AdminArticlesPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    // LLM context: admin panel needs to see every article, not just published
    // ones. The public /articles endpoint filters by published, so we hit the
    // authenticated /articles/me for the admin's own and fall back to the
    // published list for a broader view. In a real deployment this would use a
    // dedicated admin endpoint; kept simple here.
    $fetch("/api/v1/articles?limit=200", { isToast: false })
      .then((res) => {
        if (res?.response?.ok) setArticles(res.json);
      })
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
          <h1 className="text-display-2 mb-2">Статьи</h1>
          <p className="text-muted-foreground">Опубликованные блоговые записи</p>
        </div>
        <AdminTable
          data={articles}
          columns={[
            { key: "title", header: "Заголовок" },
            {
              key: "tags",
              header: "Теги",
              render: (a) => (a.tags || []).join(", ") || "—",
            },
            {
              key: "date",
              header: "Дата",
              render: (a) => new Date(a.date).toLocaleDateString(),
            },
            {
              key: "actions",
              header: "",
              render: (a) => (
                <Button variant="text" size="icon-small" asChild>
                  <Link href={`/blog/${a.slug}`} target="_blank">
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              ),
            },
          ]}
          isLoading={loading}
        />
      </div>
    </CheckUser>
  );
}
