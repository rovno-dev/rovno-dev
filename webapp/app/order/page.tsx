"use client";
import React, { useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { KeyboardArrowRightIcon, CloudIcon } from "@/components/icons";

const SERVICE_TYPES = [
  "Логотип / Фирменный стиль / Брендбук",
  "Дизайн презентации / Коммерческое предложение",
  "Создание сайта (Лендинг / Многостраничный / Интернет-магазин)",
  "Моушн-дизайн / Видеоролик / Анимация",
  "3D-моделирование / Визуализация / 3D-анимация",
  "Реклама и продвижение (SEO, Таргет, Контекст)",
  "Другое (опишу ниже)"
];

export default function OrderPage() {
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("services", JSON.stringify(selectedServices));
    
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/main/v1/orders/create`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Заявка успешно отправлена!");
        (e.target as HTMLFormElement).reset();
        setSelectedServices([]);
        setFiles(null);
      } else {
        toast.error("Ошибка при отправке.");
      }
    } catch (err) {
      toast.error("Сетевая ошибка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-(--bg) pb-20">
      <section className="py-12 md:py-20 border-b border-(--outline)">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-1 text-(--on-bg-high) mb-6 uppercase tracking-tighter">Бриф на разработку</h1>
            <p className="text-body-1 text-(--on-bg-medium) leading-relaxed">
              Заполните короткий бриф, и мы свяжемся с вами в течение 1 рабочего дня.
            </p>
          </div>
        </Container>
      </section>

      <Container className="mt-12">
        <form onSubmit={onSubmit} className="max-w-[800px] space-y-12 animate-reveal delay-100">
          
          <div className="space-y-4">
            <h3 className="text-display-4 uppercase tracking-tight">1. Тип услуги</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((service) => (
                <label 
                  key={service} 
                  className="flex items-center gap-3 p-4 rounded-xl border border-(--outline) hover:bg-(--state-hover) transition-colors cursor-pointer"
                >
                  <Checkbox 
                    checked={selectedServices.includes(service)} 
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedServices(p => [...p, service]);
                      else setSelectedServices(p => p.filter(s => s !== service));
                    }}
                  />
                  <span className="text-body-3 select-none">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">2. О компании и нейминг</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Название компании / бренда</FieldLabel>
                <Input name="company_name" placeholder="Rovno.dev" />
              </Field>
              <Field>
                <FieldLabel>Нужна помощь с неймингом?</FieldLabel>
                <Select name="naming_help" defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    <SelectItem value="yes">Да, нужно название</SelectItem>
                    <SelectItem value="no">Нет, уже есть</SelectItem>
                    <SelectItem value="discuss">Нужна консультация</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">3. О проекте</h3>
            <Field>
              <FieldLabel>Расскажите кратко о проекте</FieldLabel>
              <Textarea 
                name="description" 
                required
                className="min-h-[150px]"
                placeholder="Цели, задачи, референсы..." 
              />
            </Field>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">4. Бюджет и сроки</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Желаемые сроки</FieldLabel>
                <Select name="deadline" defaultValue="asap">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    <SelectItem value="asap">Как можно скорее</SelectItem>
                    <SelectItem value="1month">До 1 месяца</SelectItem>
                    <SelectItem value="3months">1–3 месяца</SelectItem>
                    <SelectItem value="chill">Не горит</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Ориентировочный бюджет</FieldLabel>
                <Select name="budget" defaultValue="consult">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper" sideOffset={5}>
                    <SelectItem value="15k">До 15 000 ₽</SelectItem>
                    <SelectItem value="50k">15 000 – 50 000 ₽</SelectItem>
                    <SelectItem value="150k">50 000 – 150 000 ₽</SelectItem>
                    <SelectItem value="infinity">Более 150 000 ₽</SelectItem>
                    <SelectItem value="consult">Нужна консультация</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">5. Контакты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Как к Вам обращаться? *</FieldLabel>
                <Input name="user_name" required placeholder="Имя" />
              </Field>
              <Field>
                <FieldLabel>Телефон или мессенджер *</FieldLabel>
                <Input name="user_contact" required placeholder="@username или +7..." />
              </Field>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">6. Файлы</h3>
            <Field>
              <div className="relative group/file">
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-(--outline) rounded-2xl p-8 text-center group-hover/file:border-(--primary) transition-colors">
                  <CloudIcon className="size-10 mx-auto mb-2 text-(--on-bg-low)" />
                  <p className="text-body-3 text-(--on-bg-medium)">
                    {files ? `Выбрано файлов: ${files.length}` : "Прикрепите файлы (до 20 шт)"}
                  </p>
                </div>
              </div>
            </Field>
          </div>

          <div className="pt-6 border-t border-(--outline)">
            <Button type="submit" size="large" className="w-full md:w-fit h-16! px-12! rounded-2xl!" disabled={loading}>
              {loading ? "Отправка..." : "Отправить заявку"}
              <KeyboardArrowRightIcon className="size-6" />
            </Button>
          </div>

        </form>
      </Container>
    </main>
  );
}
