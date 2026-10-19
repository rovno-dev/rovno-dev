"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CheckUser } from "@/entities/user/model/check-user";
import { PresentationBuilder } from "@/components/editor/presentation-builder";
import { fetchAdminPresentation, createPresentation, updatePresentation, type Presentation } from "@/utils/api/presentations";
import { toast } from "sonner";
import { CircleNotchIcon } from "@phosphor-icons/react";

export default function EditPresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const [initial, setInitial] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    fetchAdminPresentation(id).then(p => {
      if (!p) router.push("../presentations");
      else setInitial(p);
    }).finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSave = async (data: any) => {
    try {
      if (isNew) {
        await createPresentation(data);
        toast.success("Создано");
        router.push("../presentations");
      } else {
        await updatePresentation(id, data);
        toast.success("Сохранено");
      }
    } catch (e: any) { toast.error(e.message); }
  };

  if (loading) return <div className="p-10 text-center"><CircleNotchIcon className="animate-spin inline" /> Загрузка...</div>;

  return (
    <CheckUser>
      <PresentationBuilder initial={initial} onSave={handleSave} />
    </CheckUser>
  );
}
