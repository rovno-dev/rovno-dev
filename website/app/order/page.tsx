"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { KeyboardArrowRightIcon, CloudIcon, CloseSmallIcon, KeyboardArrowLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const SERVICE_TYPES = [
  "Логотип / Фирменный стиль / Брендбук",
  "Дизайн презентации / Коммерческое предложение",
  "Создание сайта (Лендинг / Многостраничный / Интернет-магазин)",
  "Моушн-дизайн / Видеоролик / Анимация",
  "3D-моделирование / Визуализация / 3D-анимация",
  "Реклама и продвижение (SEO, Таргет, Контекст)",
  "Другое (опишу ниже, в графе «О компании»)"
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

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageAttachments = attachments.filter(a => a.preview !== '');

  // Sync carousel position when index changes from outside (grid click)
  useEffect(() => {
    if (!api || !lightboxOpen) return;
    api.scrollTo(activeIndex, true);
  }, [api, activeIndex, lightboxOpen]);

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
      const target = prev.find(f => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const openLightbox = (id: string) => {
    const idx = imageAttachments.findIndex(img => img.id === id);
    if (idx !== -1) {
      setActiveIndex(idx);
      setLightboxOpen(true);
    }
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
              Опишите вашу задачу и мы подготовим предложение в течение рабочего дня.
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

          {/* 2. Description */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">2. О проекте</h3>
            <Field>
              <Textarea
                name="description"
                required
                className="min-h-[120px] text-body-2!"
                placeholder="Расскажите о целях проекта, целевой аудитории и ваших пожеланиях..."
              />
            </Field>
          </div>

          {/* 3. Company */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">3. О компании</h3>
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
                    <SelectItem value="discuss">Да, но хотел бы обсудить его</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* 4. Files Manager (Avito/Telegram Style) */}
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight">4. Файлы (медиа, тз, заготовки и т.п.)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {attachments.map((attr) => (
                <div key={attr.id} className="relative aspect-square group rounded-xl border border-(--outline) overflow-hidden bg-(--card)">
                  {attr.preview ? (
                    <div className="cursor-pointer w-full h-full relative" onClick={() => openLightbox(attr.id)}>
                      <Image src={attr.preview} alt="preview" fill className="object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full p-2 text-center text-[10px] break-all text-(--on-bg-low)">
                      {attr.file.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(attr.id)}
                    className="absolute top-1.5 right-1.5 z-10 size-6 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
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

          <div className="pt-8">
            <Button type="submit" size="large" className="w-full md:w-fit h-16! px-12! rounded-2xl!" disabled={loading}>
              {loading ? "Отправка..." : "Отправить заявку"}
              <KeyboardArrowRightIcon className="size-6" />
            </Button>
          </div>
        </form>
      </Container>

      {/* Telegram-style Multi-image Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="!fixed !inset-0 !z-50 !flex !items-center !justify-center !w-screen !h-screen !max-w-none !max-h-none !p-0 !border-0 !bg-black/95 !rounded-none !translate-x-0 !translate-y-0 !top-0 !left-0"
          showCloseButton={false}
        >
          <Button
            variant="text"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            size="icon-medium"
            onClick={() => setLightboxOpen(false)}
          >
            <CloseSmallIcon className="size-6!" />
          </Button>

          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-screen ml-0">
              {imageAttachments.map((img, index) => (
                <CarouselItem key={img.id} className="h-full flex items-center justify-center p-0 pl-0">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {imageAttachments.length > 1 && (
              <>
                <CarouselPrevious className="left-6 z-50 bg-white/10 text-white hover:bg-white/20 border-0" />
                <CarouselNext className="right-6 z-50 bg-white/10 text-white hover:bg-white/20 border-0" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </main>
  );
}