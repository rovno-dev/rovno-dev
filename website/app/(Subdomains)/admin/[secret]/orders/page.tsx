"use client";
import { useEffect, useState } from "react";
import { CheckUser } from "@/entities/user/model/check-user";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FileIcon, ImageIcon, FileText, Download, Phone, Mail } from "lucide-react";
import { $fetch } from "@/utils/fetch";
import Link from "next/link";
import { TelegramLogotypeMonoIcon } from "@/components/icons";
interface OrderFile {
  id: string;
  filename: string;
  file_path: string;
}
interface Order {
  id: string;
  contact_id: string;
  service_types_json: string[];
  about: string;
  estimate_deadline: string;
  estimate_budget: string;
  naming_help: string;
  created_at: string;
  files: OrderFile[];
  contact?: {
    id: string;
    name?: string;
    phone?: string;
    email?: string;
    telegram_username?: string;
  };
}
export default function AdminOrdersPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    fetchOrders();
  }, [user]);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await $fetch("/api/v1/admin/order-requests", { isToast: false });
      if (res.response?.ok) {
        setOrders(res.json);
      } else {
        toast.error("Не удалось загрузить заявки");
      }
    } catch {
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  };
  if (userLoading || !user) return null;
  if (user.role !== "admin" && user.role !== "root") {
    router.push("/");
    return null;
  }
  const exportToCSV = () => {
    // Build CSV rows
    const headers = ["ID", "Описание", "Услуги", "Срок", "Бюджет", "Нейминг", "Дата"];
    const rows = orders.map(o => [
      o.id,
      o.about || "",
      (o.service_types_json || []).join(", "),
      o.estimate_deadline || "",
      o.estimate_budget || "",
      o.naming_help || "",
      new Date(o.created_at).toLocaleDateString(),
    ]);
    // Escape fields that contain commas or quotes
    const escape = (field: string) => {
      if (field.includes(",") || field.includes('"') || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    const csvRows = [
      headers.join(","),
      ...rows.map(row => row.map(escape).join(","))
    ];
    const csv = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-2 mb-2">Заявки</h1>
          <p className="text-muted-foreground">Входящие заказы и запросы</p>
        </div>
        <Button variant="outlined" size="small" onClick={exportToCSV}>
          Экспорт CSV
        </Button>
      </div>
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 shadow-sm border-(--outline) rounded-3xl h-64 animate-pulse bg-muted/30" />
          ))}
        </div>
      )}
      {!loading && orders.length === 0 && (
        <p className="text-muted-foreground text-center py-8">Нет заявок</p>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 shadow-sm border-(--outline) rounded-3xl flex flex-col h-full">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-heading-4 truncate">#{order.id.slice(0, 8)}</h3>
                <span className="text-xs text-muted-foreground">
                  Заказ от: {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              {order.about &&
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-body-3">О проекте:</span>
                    <p className="text-muted-foreground line-clamp-2">
                      {order.about}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-body-3">О проекте:</span>
                    <p className="text-muted-foreground line-clamp-2">
                      {order.service_types_json?.join(", ") || "—"}
                    </p>
                  </div>
                </div>
              }
              <div className="grid grid-cols-2 gap-4">
                <div className="text-body-5 space-y-1">
                  <p><span className="font-medium">Срок:</span> {order.estimate_deadline || "—"}</p>
                  <p><span className="font-medium">Бюджет:</span> {order.estimate_budget || "—"}</p>
                  <p><span className="font-medium">Нейминг:</span> {order.naming_help || "—"}</p>
                </div>
                <div className="text-body-5 space-y-1">
                  <p><span className="font-medium">Имя:</span> {order.contact?.name || "—"}</p>
                  <div className="flex gap-1 items-center">
                    <Phone className="size-3" />
                    <p>{order.contact?.phone || "—"}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <Mail className="size-3" />
                    <p> {order.contact?.email || "—"}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <TelegramLogotypeMonoIcon className="size-3! [&>path]:fill-(--on-bg-high)" />
                    <p>{order.contact?.telegram_username || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
            {
              order.files && order.files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-heading-5 mb-3">Файлы</h4>
                  <Carousel className="w-full mx-auto">
                    <CarouselContent>
                      {order.files.map((file, idx) => (
                        <CarouselItem key={file.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3">
                          <div className="flex flex-col items-center p-2 border rounded-lg h-24 justify-center bg-muted/20">
                            {file.filename.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
                              <ImageIcon className="size-8 aspect-square! text-muted-foreground" />
                            ) : (
                              <FileText className="size-8 aspect-square! text-muted-foreground" />
                            )}
                            <span className="text-[10px] truncate w-full text-center">{file.filename}</span>
                            <a href={file.file_path} target="_blank" className="mt-1">
                              <Download className="size-3 text-primary" />
                            </a>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4" />
                    <CarouselNext className="-right-4" />
                  </Carousel>
                </div>
              )
            }
            {
              (order.contact?.telegram_username && order.contact?.phone) ? (
                <div aria-label="order-buttons" className="mt-2 grid gap-2 grid-cols-2">
                  <Button
                    variant={'filled'}
                    asChild
                  >
                    <Link href={`https://t.me/${order.contact?.telegram_username || ""}`}>
                      <TelegramLogotypeMonoIcon className="[&>path]:fill-white!" />
                      Telegram
                    </Link>
                  </Button>
                  <Button
                    variant={'filled'}
                    asChild
                  >
                    <Link href={`tel:${order.contact?.phone || ""}`}>
                      <Phone />
                      Позвонить
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="mt-2">Контакты отсутсвуют</p>
              )
            }
          </Card>
        ))}
      </div>
    </div >
  );
}
