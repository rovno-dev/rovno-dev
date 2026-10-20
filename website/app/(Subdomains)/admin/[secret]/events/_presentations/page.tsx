"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Presentation as PresentationIcon, Trash, PencilSimple, ArrowSquareOut } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAdminSecret } from "@/hooks/use-admin-secret";
import { adminUrl } from "@/utils/admin-url";
import { fetchAdminPresentations, deletePresentation, type Presentation } from "@/utils/api/presentations";

export default function AdminPresentationsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const { secret } = useAdminSecret();
  const [data, setData] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await fetchAdminPresentations());
    } catch (e) { toast.error("Ошибка загрузки"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) load(); }, [user]);

  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") { router.push("/"); return null; }

  const base = adminUrl(secret, "events/presentations");

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить презентацию «${title}»?`)) return;
    try {
      await deletePresentation(id);
      load();
      toast.success("Удалено");
    } catch { toast.error("Ошибка удаления"); }
  };

  return (
    <CheckUser>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-display-2 mb-1">Презентации</h1>
            <p className="text-body-3 text-(--on-bg-medium)">Управление слайдами и событиями</p>
          </div>
          <Button asChild>
            <Link href={`${base}/new`}>
              <Plus className="size-4" /> Создать
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Card key={i} className="h-40 animate-pulse bg-muted/30" />)}
          </div>
        ) : data.length === 0 ? (
          <Card className="p-10 text-center text-(--on-bg-medium)">Нет презентаций</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(p => (
              <Card key={p.id} className="p-5 flex flex-col gap-3 rounded-3xl border-(--outline)">
                <div className="flex items-start justify-between">
                  <PresentationIcon className="size-6 text-(--primary)" />
                  <Badge variant={p.is_published ? "tonal-primary-static" : "outlined-static"}>
                    {p.is_published ? "Опубликована" : "Черновик"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-heading-4">{p.title}</h3>
                  <p className="text-body-5 text-(--on-bg-low) font-mono mt-1">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-(--outline)">
                  <Button variant="outlined" size="small" asChild>
                    <Link href={`${base}/${p.id}`}><PencilSimple className="size-4" /> Ред.</Link>
                  </Button>
                  <Button variant="text" size="icon-small" asChild>
                    <Link href={`/presentations/${p.slug}`} target="_blank"><ArrowSquareOut className="size-4" /></Link>
                  </Button>
                  <Button variant="text" size="icon-small" onClick={() => handleDelete(p.id, p.title)} className="ml-auto">
                    <Trash className="size-4 text-(--error)" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CheckUser>
  );
}
