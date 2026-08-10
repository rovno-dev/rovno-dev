"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { KeyboardArrowRightIcon, CloudIcon, CloseSmallIcon, ArticleIcon } from "@/components/icons";
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
  "2д анимация (анимация логотипа, социальные ролики), Монтаж, Склейка",
  "3D-моделирование, 3D-анимация (имиджевый ролик, коммерческий, социальный)",
  "Реклама и продвижение (SEO, Таргет, Контекст)",
  "Другое (опишу ниже, в графе «О проекте»"
];
interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  type: 'image' | 'pdf' | 'doc' | 'other';
}
export default function OrderPage() {
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FileWithPreview[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!api || !lightboxOpen) return;
    if (e.key === "ArrowLeft") api.scrollPrev();
    if (e.key === "ArrowRight") api.scrollNext();
  }, [api, lightboxOpen]);
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
  useEffect(() => {
    if (!api || !lightboxOpen) return;
    const timer = setTimeout(() => {
      api.scrollTo(activeIndex, true);
    }, 50);
    return () => clearTimeout(timer);
  }, [api, activeIndex, lightboxOpen]);
  const getFileType = (file: File): 'image' | 'pdf' | 'doc' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.name.match(/\.(doc|docx|md)$/i)) return 'doc';
    return 'other';
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        id: Math.random().toString(36).substring(7),
        type: getFileType(file)
      }));
      setAttachments(prev => [...prev, ...newFiles].slice(0, 20));
    }
  };
  const removeFile = (id: string) => {
    setAttachments(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter(f => f.id !== id);
    });
  };
  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("services", JSON.stringify(selectedServices));
    attachments.forEach((attr) => formData.append("files", attr.file));
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
            <h1 className="text-display-1 text-(--on-bg-high) mb-6 uppercase tracking-tighter leading-none">Бриф на разработку</h1>
            <p className="text-body-1 text-(--on-bg-medium) leading-relaxed font-medium">
              Опишите вашу задачу и мы подготовим предложение в течение рабочего дня.
            </p>
          </div>
        </Container>
      </section>
      <Container className="mt-12">
        <form onSubmit={onSubmit} className="max-w-[800px] space-y-12 animate-reveal delay-100">
          <div className="space-y-4">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">1. Тип услуги</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((service) => (
                <label
                  key={service}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer min-h-[72px] bg-card",
                    selectedServices.includes(service) ? "border-(--primary) ring-1 ring-(--primary)/30 bg-(--primary-glass)" : "border-(--outline) hover:border-(--on-bg-low)"
                  )}
                >
                  <Checkbox
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedServices(p => [...p, service]);
                      else setSelectedServices(p => p.filter(s => s !== service));
                    }}
                  />
                  <span className="text-body-4 font-medium leading-tight select-none">{service}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">2. О проекте</h3>
            <Field>
              <Textarea
                name="description"
                required
                className="min-h-[160px] text-body-2! rounded-2xl!"
                placeholder="Расскажите о целях проекта, целевой аудитории и ваших пожеланиях..."
              />
            </Field>
          </div>
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">3. О компании</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel>Название бренда</FieldLabel>
                <Input name="company_name" placeholder="Название" className="h-12! rounded-xl!" />
              </Field>
              <Field>
                <FieldLabel>Нужен нейминг?</FieldLabel>
                <Select name="naming_help" defaultValue="no">
                  <SelectTrigger className="h-12! rounded-xl! w-full!"><SelectValue /></SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="yes">Да, нужно название</SelectItem>
                    <SelectItem value="no">Нет, уже есть</SelectItem>
                    <SelectItem value="discuss">Да, но хотел бы обсудить его</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">4. Файлы (media, md, docx, pdf)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((attr, idx) => (
                <div key={attr.id} className="relative aspect-square group rounded-2xl border border-(--outline) overflow-hidden bg-card transition-shadow hover:shadow-lg">
                  <div className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 relative" onClick={() => openLightbox(idx)}>
                    {attr.type === 'image' ? (
                      <Image src={attr.preview} alt="preview" fill className="object-contain transition-transform group-hover:scale-105" />
                    ) : (
                      <>
                        <div className={cn(
                          "size-14 rounded-xl flex items-center justify-center mb-2 transition-colors",
                          attr.type === 'pdf' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                          <ArticleIcon className="size-8! fill-current" />
                        </div>
                        <span className="text-[11px] font-semibold text-(--on-bg-medium) text-center break-all line-clamp-2 px-1">
                          {attr.file.name}
                        </span>
                        <div className="absolute bottom-2 left-0 w-full text-center">
                          <span className="text-[9px] uppercase tracking-widest text-(--on-bg-low) font-bold opacity-60">
                            {attr.file.name.split('.').pop()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    size={'icon-small'}
                    variant={'glass'}
                    onClick={(e) => { e.stopPropagation(); removeFile(attr.id); }}
                    className="absolute top-2 right-2 z-10 size-7 flex items-center justify-center rounded-full"
                  >
                    <CloseSmallIcon className="size-5!" />
                  </Button>
                </div>
              ))}
              {attachments.length < 20 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--outline) hover:border-(--primary) hover:bg-(--primary-glass) transition-all group"
                >
                  <div className="size-12 rounded-full bg-(--bg-disabled)/50 flex items-center justify-center group-hover:bg-(--primary)/10 transition-colors">
                    <CloudIcon className="size-6 text-(--on-bg-low) group-hover:text-(--primary)" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-(--on-bg-low) group-hover:text-(--primary)">Добавить</span>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.md,.txt,.zip,.rar,.7zip"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">5. Контакты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="user_name" required placeholder="Ваше имя" className="h-12! rounded-xl!" />
              <Input name="user_contact" required placeholder="Телефон или Telegram" className="h-12! rounded-xl!" />
            </div>
          </div>
          <div className="pt-8">
            <Button type="submit" size="large" className="w-full md:w-fit h-16! px-12! rounded-2xl! text-lg! uppercase tracking-tighter" disabled={loading}>
              {loading ? "Отправка..." : "Отправить заявку"}
              <KeyboardArrowRightIcon className="size-6" />
            </Button>
          </div>
        </form>
      </Container>
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="!fixed !inset-0 !z-50 !max-w-none !max-h-none !p-0 !border-0 !bg-black/98 !rounded-none !translate-none !top-0 !left-0"
        >
          <Button
            variant="text"
            className="absolute top-4 right-4 z-[60] text-white/50 hover:text-white hover:bg-white/10 rounded-full"
            size="icon-medium"
            onClick={() => setLightboxOpen(false)}
          >
            <CloseSmallIcon className="size-10!" />
          </Button>
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-[100dvh] ml-0">
              {attachments.map((attr) => (
                <CarouselItem key={attr.id} className="h-full flex items-center justify-center p-0">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {attr.type === 'image' ? (
                      <div className="relative w-full h-full flex items-center justify-center px-4">
                        <Image src={attr.preview} alt={attr.file.name} fill className="object-contain" sizes="100vw" priority />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-8 p-12 rounded-[40px] border border-white/10 bg-(--glass) backdrop-blur-3xl text-center max-w-lg animate-reveal shadow-2xl">
                        <div className={cn(
                          "size-32 rounded-3xl flex items-center justify-center shadow-inner",
                          attr.type === 'pdf' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"
                        )}>
                          <ArticleIcon className="size-16! [&>path]:fill-(--dark-1)!" />
                        </div>
                        <div className="space-y-3">
                          <h2 className="text-display-3 text-white break-all line-clamp-3 px-4 leading-tight">{attr.file.name}</h2>
                          <div className="flex items-center justify-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                              {attr.file.name.split('.').pop()}
                            </span>
                            <span className="text-body-4 text-(--dark-1)">{(attr.file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                        <Button variant="glass" shape="round" size="large" className="w-full h-14! text-base! text-white!" asChild>
                          <a href={URL.createObjectURL(attr.file)} download={attr.file.name}>Скачать документ</a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {attachments.length > 1 && (
              <>
                <CarouselPrevious className="left-6 z-50 bg-white/5 text-white hover:bg-white/20 border-white/10 size-12!" />
                <CarouselNext className="right-6 z-50 bg-white/5 text-white hover:bg-white/20 border-white/10 size-12!" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </main>
  );
}
