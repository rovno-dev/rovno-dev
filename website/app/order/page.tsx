"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import * as mammoth from "mammoth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { toast } from "sonner";
import { CloudIcon, CloseSmallIcon, ArticleIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  "Что-либо другое (опишу ниже, в графе «О проекте»"
];

const DEADLINE_OPTIONS = [
  "Как можно скорее",
  "До 1 месяца",
  "1–3 месяца",
  "Не горит, обсуждаем"
];

const BUDGET_OPTIONS = [
  "До 15 000 ₽",
  "15 000 – 50 000 ₽",
  "50 000 – 150 000 ₽",
  "Более 150 000 ₽",
  "Нужна консультация по цене"
];

interface FileWithPreview {
  file: File;
  preview: string | null;
  htmlPreview?: string;
  id: string;
  type: 'image' | 'pdf' | 'doc' | 'md' | 'other';
}

const AVALIABLE_FILE_TYPES = 'image/*, .pdf, .docx, .doc, .md, .mdx, .xls, .xlsx, .zip, .7zip';

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

  const getFileType = (file: File): 'image' | 'pdf' | 'doc' | 'md' | 'other' => {
    const name = file.name.toLowerCase();
    if (file.type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) return 'image';
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (name.endsWith('.docx') || name.endsWith('.doc')) return 'doc';
    if (name.endsWith('.md') || name.endsWith('.mdx')) return 'md';
    return 'other';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const id = Math.random().toString(36).substring(7);
        const type = getFileType(file);
        const isPreviewable = type === 'image' || type === 'pdf';
        const previewUrl = isPreviewable ? URL.createObjectURL(file) : null;
        const newFile: FileWithPreview = { file, preview: previewUrl, id, type };
        setAttachments(prev => [...prev, newFile].slice(0, 20));

        if (type === 'doc') {
          const reader = new FileReader();
          reader.onload = async (loadEvent) => {
            const arrayBuffer = loadEvent.target?.result as ArrayBuffer;
            try {
              const result = await mammoth.convertToHtml({ arrayBuffer });
              setAttachments(prev => prev.map(attr =>
                attr.id === id ? { ...attr, htmlPreview: result.value } : attr
              ));
            } catch (err) { console.error("Mammoth error:", err); }
          };
          reader.readAsArrayBuffer(file);
        }
        if (type === 'md') {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const text = loadEvent.target?.result as string;
            const html = text.replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\n/gim, '<br />');
            setAttachments(prev => prev.map(attr =>
              attr.id === id ? { ...attr, htmlPreview: html } : attr
            ));
          };
          reader.readAsText(file);
        }
      });
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
        <Container><div className="max-w-[800px] animate-reveal">
          <h1 className="text-display-1 text-(--on-bg-high) mb-6 uppercase tracking-tighter leading-none">Бриф на разработку</h1>
          <p className="text-body-1 text-(--on-bg-medium) leading-relaxed font-medium">Опишите вашу задачу и мы подготовим предложение.</p>
        </div></Container>
      </section>

      <Container className="mt-12">
        <form onSubmit={onSubmit} className="max-w-[800px] space-y-12 animate-reveal delay-100">
          <div className="space-y-4">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">1. Тип услуги</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICE_TYPES.map((service) => (
                <label key={service} className={cn("flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer min-h-[72px] bg-card", selectedServices.includes(service) ? "border-(--primary) ring-1 ring-(--primary)/30 bg-(--primary-glass)" : "border-(--outline) hover:border-(--primary-card)")}>
                  <Checkbox checked={selectedServices.includes(service)} onCheckedChange={(checked) => {
                    if (checked) setSelectedServices(p => [...p, service]);
                    else setSelectedServices(p => p.filter(s => s !== service));
                  }} />
                  <span className="text-body-4 font-medium leading-tight select-none">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">2. О проекте</h3>
            <Field><Textarea name="description" required className="min-h-[160px] text-body-2! rounded-2xl!" placeholder="Расскажите о целях проекта..." /></Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">Желаемые сроки</label>
                <Select name="deadline">
                  <SelectTrigger className="w-full h-12! rounded-xl! bg-card border-(--outline) hover:border-(--primary-card)"><SelectValue placeholder="Выберите срок" /></SelectTrigger>
                  <SelectContent>{DEADLINE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-body-4 font-bold uppercase tracking-widest text-(--on-bg-low)">Ориентировочный бюджет</label>
                <Select name="budget">
                  <SelectTrigger className="w-full h-12! rounded-xl! bg-card border-(--outline) hover:border-(--primary-card)"><SelectValue placeholder="Выберите бюджет" /></SelectTrigger>
                  <SelectContent>{BUDGET_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">3. Файлы (макс. 10мб.)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {attachments.map((attr, idx) => (
                <div key={attr.id} className="relative aspect-square group rounded-2xl border border-(--outline) overflow-hidden bg-card transition-shadow hover:shadow-lg">
                  <div className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 relative" onClick={() => openLightbox(idx)}>
                    {attr.type === 'image' && attr.preview ? (
                      <Image src={attr.preview} alt="preview" fill className="object-contain" />
                    ) : (
                      <>
                        <div className={cn("size-14 rounded-xl flex items-center justify-center mb-2", attr.type === 'pdf' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500")}><ArticleIcon className="size-8! fill-current" /></div>
                        <span className="text-[11px] font-semibold text-(--on-bg-medium) text-center line-clamp-2 px-1">{attr.file.name}</span>
                      </>
                    )}
                  </div>
                  <Button variant={'glass'} size={'icon-small'} onClick={(e) => { e.stopPropagation(); removeFile(attr.id); }} className="absolute top-2 right-2 size-7 rounded-full"><CloseSmallIcon className="size-5!" /></Button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--outline) hover:border-(--primary) hover:bg-(--primary-glass) transition-all group">
                <CloudIcon className="size-6 [&>path]:fill-(--dark-1)! group-hover:[&>path]:fill-(--primary)!" /><span className="text-xs font-bold uppercase text-(--on-bg-low) group-hover:text-(--primary)">Добавить</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} accept={AVALIABLE_FILE_TYPES} />
          </div>

          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">4. Контакты</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="user_name" required placeholder="Ваше имя" className="h-12! rounded-xl!" />
              <Input name="user_contact" required placeholder="Телефон или Telegram" className="h-12! rounded-xl!" />
              <Input name="user_email" type="email" placeholder="Email (необязательно)" className="h-12! rounded-xl!" />
            </div>
          </div>

          <div className="pt-8">
            <Button type="submit" size="large" className="w-full md:w-fit h-16! px-12! rounded-2xl! text-lg! uppercase tracking-tighter" disabled={loading}>{loading ? "Отправка..." : "Отправить заявку"}</Button>
          </div>
        </form>
      </Container>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent showCloseButton={false} className="!fixed !inset-0 !z-50 !max-w-none !max-h-none !p-0 !border-0 !bg-black/98 !rounded-none !translate-none !top-0 !left-0">
          <Button variant="glass" className="absolute top-4 right-4 z-[999]! rounded-full border-(--white)" size="icon-medium" onClick={() => setLightboxOpen(false)}>
            <CloseSmallIcon className="size-10! [&>path]:fill-(--white)" />
          </Button>
          <Carousel setApi={setApi} className="w-full h-full">
            <CarouselContent className="h-[100dvh] ml-0">
              {attachments.map((attr) => (
                <CarouselItem key={attr.id} className="h-full flex items-center justify-center p-0">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {attr.type === 'image' && attr.preview ? (
                      <Image src={attr.preview} alt={attr.file.name} fill className="object-contain" sizes="100vw" priority />
                    ) : attr.type === 'pdf' && attr.preview ? (
                      <iframe src={attr.preview} className="w-full h-full rounded-xl bg-white border-0" title={attr.file.name} />
                    ) : (attr.type === 'doc' || attr.type === 'md') && attr.htmlPreview ? (
                      <div className="w-full max-w-4xl max-h-[85vh] overflow-auto bg-white rounded-2xl p-8 shadow-2xl animate-reveal">
                        <div className="prose-doc text-black" dangerouslySetInnerHTML={{ __html: attr.htmlPreview }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-8 p-12 rounded-[40px] border border-white/10 bg-(--glass) backdrop-blur-3xl text-center max-w-lg">
                        <ArticleIcon className="size-16! [&>path]:fill-(--dark-1)!" />
                        <h2 className="text-display-3 text-white break-all">{attr.file.name}</h2>
                        <Button variant="glass" shape="round" size="large" asChild><a href={attr.preview || URL.createObjectURL(attr.file)} download={attr.file.name}>Скачать</a></Button>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {attachments.length > 1 && (
              <>
                <CarouselPrevious className="left-6 z-50 bg-white/5 text-white size-12!" />
                <CarouselNext className="right-6 z-50 bg-white/5 text-white size-12!" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </main>
  );
}
