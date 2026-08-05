"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { KeyboardArrowRightIcon, CloudIcon, CloseSmallIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const SERVICE_TYPES = [
  "Логотип / Фирменный стиль / Брендбук",
  "Дизайн презентации / Коммерческое предложение",
  "Создание сайта (Лендинг / Многостраничный / Интернет-магазин)",
  "Моушн-дизайн / Видеоролик / Анимация",
  "3D-моделирование / Визуализация / 3D-анимация",
  "Реклама и продвижение (SEO, Таргет, Контекст)",
  "Другое (опишу ниже)"
];

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

export default function OrderPage() {
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const processed = newFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      id: Math.random().toString(36).substring(7)
    }));
    setAttachments(prev => [...prev, ...processed].slice(0, 20));
  };

  const removeFile = (id: string) => {
    setAttachments(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const target = prev.find(f => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return filtered;
    });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    formData.append("services", JSON.stringify(selectedServices));
    attachments.forEach((attr) => {
      formData.append("files", attr.file);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/main/v1/orders/create`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Заявка успешно отправлена!");
        form.reset();
        setSelectedServices([]);
        setAttachments([]);
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
              Опишите вашу задачу, и мы подготовим предложение в течение рабочего дня.
            </p>
          </div>
        </Container>
      </section>

      <Container className="mt-12">
        <form onSubmit={onSubmit} className="max-w-[800px] space-y-12 animate-reveal delay-100">
          
          {/* 1. Services */}
          <div className="space-y-4">
            <h3 className="text-display-4 uppercase tracking-tight">1. Тип услуги</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((service) => (
                <label 
                  key={service} 
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                    selectedServices.includes(service) ? "border-(--primary) bg-(--primary-glass)" : "border-(--outline) hover:bg-(--state-hover)"
                  )}
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

          {/* 2. Company */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">2. О компании</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Название бренда</FieldLabel>
                <Input name="company_name" placeholder="Название" />
              </Field>
              <Field>
                <FieldLabel>Нужен нейминг?</FieldLabel>
                <Select name="naming_help" defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="yes">Да, нужно название</SelectItem>
                    <SelectItem value="no">Нет, уже есть</SelectItem>
                    <SelectItem value="discuss">Обсудим</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* 3. Description */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">3. О проекте</h3>
            <Field>
              <Textarea 
                name="description" 
                required
                className="min-h-[120px] text-body-2!"
                placeholder="Расскажите о целях проекта, целевой аудитории и ваших пожеланиях..." 
              />
            </Field>
          </div>

          {/* 4. Files Manager (Avito Style) */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">4. Файлы и ТЗ</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {attachments.map((attr) => (
                <div key={attr.id} className="relative aspect-square group rounded-xl border border-(--outline) overflow-hidden bg-(--card)">
                  {attr.preview ? (
                    <Image src={attr.preview} alt="preview" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full p-2 text-center text-[10px] break-all text-(--on-bg-low)">
                      {attr.file.name}
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => removeFile(attr.id)}
                    className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <CloseSmallIcon className="size-4" />
                  </button>
                </div>
              ))}
              
              {attachments.length < 20 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--outline) hover:border-(--primary) hover:bg-(--primary-glass) transition-all text-(--on-bg-low) hover:text-(--primary)"
                >
                  <CloudIcon className="size-6" />
                  <span className="text-[10px] font-medium">Добавить</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.png,.zip"
            />
          </div>

          {/* 5. Contacts */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">5. Контакты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="user_name" required placeholder="Ваше имя" />
              <Input name="user_contact" required placeholder="Телефон или Telegram" />
            </div>
          </div>

          <div className="pt-8 border-t border-(--outline)">
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
