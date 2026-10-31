"use client";
import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInputField } from "@/components/ui/phone-input";
import { toast } from "sonner";
import { ArrowRight, CircleNotch } from "@phosphor-icons/react";

export function QuickOrderDialog({
  serviceName,
  children,
}: {
  serviceName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [desc, setDesc] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Пожалуйста, заполните имя и телефон");
      return;
    }
    setLoading(true);

    // Reusing the existing endpoint. user_email is omitted (nullable).
    const formData = new FormData();
    formData.append("services", JSON.stringify([serviceName]));
    formData.append("user_name", name);
    formData.append("user_phone", phone);
    formData.append("description", desc);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/v1/orders/create`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Заявка принята! Мы свяжемся с вами в ближайшее время.");
        setOpen(false);
        setName("");
        setPhone("");
        setDesc("");
      } else {
        const data = await res.json();
        toast.error(data.detail?.[0]?.msg || "Ошибка при отправке");
      }
    } catch {
      toast.error("Сетевая ошибка. Проверьте подключение.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-(--outline) bg-(--bg) gap-0">
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-heading font-semibold tracking-tight text-(--on-bg-high)">
              Обсудить проект
            </h2>
            <p className="text-body-4 text-(--on-bg-medium) mt-1">
              Услуга: <span className="text-(--primary) font-medium">{serviceName}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Ваше имя *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Иван" 
                className="bg-(--card) border-(--outline) h-11" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Телефон *</Label>
              <PhoneInputField value={phone} onChange={setPhone} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-(--on-bg-high)">Комментарий</Label>
              <Textarea 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                placeholder="Кратко о задаче..." 
                className="min-h-[80px] bg-(--card) border-(--outline)" 
              />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-medium mt-2">
              {loading ? <CircleNotch className="size-5 animate-spin mr-2" /> : null}
              {loading ? "Отправка..." : "Отправить заявку"}
            </Button>
          </form>

          <div className="pt-6 border-t border-(--outline) text-center">
            <p className="text-body-5 text-(--on-bg-medium)">
              Нужно прикрепить файлы или выбрать несколько услуг?
            </p>
            <Link 
              href="/order" 
              className="text-body-4 text-(--primary) hover:underline mt-1 inline-flex items-center gap-1 font-medium"
            >
              Перейти к полной форме
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
