"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import * as mammoth from "mammoth";
import { z } from "zod";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Newspaper } from "lucide-react";
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
import { ServiceSelection } from "./_components/service-selection";
import { ProjectDetails } from "./_components/project-details";
import { FileUpload } from "./_components/file-upload";
import { ContactInfo } from "./_components/contact-info";
import { PhoneInputField } from "@/components/ui/phone-input";

const orderSchema = z.object({
  user_name: z.string().min(2, "Имя должно быть не короче 2 символов"),
  user_phone: z.string().min(1, "Укажите номер телефона"),
  user_telegram: z.string().optional(),
  user_email: z.email("Некорректный формат email").min(1, "Введите email"),
  description: z.string().optional(),
  services: z.array(z.string()).min(1, "Выберите хотя бы одну услугу"),
  company_name: z.string().optional(),
  naming_help: z.string().optional(),
  deadline: z.string().optional(),
  budget: z.string().optional(),
  agreement: z.boolean().refine((val) => val === true, "Необходимо согласие для отправки"),
});

type OrderFormValues = z.infer<typeof orderSchema>;

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
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormValues, string>>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone number state
  const [phone, setPhone] = useState<string>("");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const id = Math.random().toString(36).substring(7);
        const name = file.name.toLowerCase();
        let type: FileWithPreview['type'] = 'other';
        if (file.type.startsWith('image/') || name.match(/\.(jpg|jpeg|png|gif|webp)$/)) type = 'image';
        else if (file.type === 'application/pdf' || name.endsWith('.pdf')) type = 'pdf';
        else if (name.endsWith('.docx') || name.endsWith('.doc')) type = 'doc';
        else if (name.endsWith('.md') || name.endsWith('.mdx')) type = 'md';
        const previewUrl = (type === 'image' || type === 'pdf') ? URL.createObjectURL(file) : null;
        const newFile: FileWithPreview = { file, preview: previewUrl, id, type };
        setAttachments(prev => [...prev, newFile].slice(0, 20));
        if (type === 'doc') {
          const reader = new FileReader();
          reader.onload = async (loadEvent) => {
            const result = await mammoth.convertToHtml({ arrayBuffer: loadEvent.target?.result as ArrayBuffer });
            setAttachments(prev => prev.map(attr => attr.id === id ? { ...attr, htmlPreview: result.value } : attr));
          };
          reader.readAsArrayBuffer(file);
        } else if (type === 'md') {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const html = (loadEvent.target?.result as string).replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/\n/gim, '<br />');
            setAttachments(prev => prev.map(attr => attr.id === id ? { ...attr, htmlPreview: html } : attr));
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const rawData = {
      services: selectedServices,
      description: formData.get("description"),
      deadline: formData.get("deadline"),
      budget: formData.get("budget"),
      company_name: formData.get("company_name"),
      naming_help: formData.get("naming_help"),
      user_name: formData.get("user_name"),
      user_phone: phone, // from state
      user_telegram: formData.get("user_telegram"),
      user_email: formData.get("user_email"),
      agreement: formData.get("agreement") === "on",
    };
    const result = orderSchema.safeParse(rawData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof OrderFormValues, string>> = {};
      result.error.issues.forEach(issue => fieldErrors[issue.path[0] as keyof OrderFormValues] = issue.message);
      setErrors(fieldErrors);
      setLoading(false);
      toast.error("Проверьте правильность заполнения полей");
      return;
    }
    const finalFormData = new FormData(e.currentTarget);
    finalFormData.set("services", JSON.stringify(selectedServices));
    finalFormData.set("user_phone", phone);
    // remove the old "user_contact" if present
    finalFormData.delete("user_contact");
    attachments.forEach(attr => finalFormData.append("files", attr.file));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/v1/orders/create`, {
        method: "POST",
        body: finalFormData,
      });
      if (res.ok) {
        toast.success("Заявка принята!", { description: "Мы скоро свяжемся с вами." });
        e.currentTarget.reset();
        setSelectedServices([]);
        setAttachments([]);
        setPhone("");
      } else {
        const data = await res.json();
        toast.error("Ошибка сервера", { description: data.detail?.[0]?.msg || "Попробуйте позже" });
      }
    } catch { toast.error("Сетевая ошибка."); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Container className="pt-8 pb-12">
        <h1 className="text-display-2 mb-3 uppercase tracking-tighter leading-none">Сделать заказ</h1>
        <p className="text-body-1 text-(--on-bg-low) leading-relaxed font-medium">Опишите вашу задачу и мы подготовим предложение.</p>
      </Container>
      <Container>
        <form onSubmit={onSubmit} className="max-w-[800px] space-y-12 animate-reveal delay-100">
          <ServiceSelection selectedServices={selectedServices} setSelectedServices={setSelectedServices} error={errors.services} />
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">2. Контакты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field data-invalid={!!errors.user_name}>
                <FieldLabel>Ваше имя <span className="text-destructive">*</span></FieldLabel>
                <Input name="user_name" placeholder="Ваше имя" />
                {errors.user_name && <p className="text-sm text-destructive">{errors.user_name}</p>}
              </Field>
              <Field data-invalid={!!errors.user_email}>
                <FieldLabel>Электронная почта <span className="text-destructive">*</span></FieldLabel>
                <Input name="user_email" type="email" placeholder="email@example.com" />
                {errors.user_email && <p className="text-sm text-destructive">{errors.user_email}</p>}
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field data-invalid={!!errors.user_phone}>
                <FieldLabel>Телефон <span className="text-destructive">*</span></FieldLabel>
                <PhoneInputField
                  value={phone}
                  onChange={setPhone}
                  error={errors.user_phone}
                />
              </Field>
              <Field>
                <FieldLabel>Telegram (опционально)</FieldLabel>
                <Input name="user_telegram" placeholder="@username" />
              </Field>
            </div>
          </div>
          <ProjectDetails error={errors.description} />
          <div className="space-y-6">
            <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">4. О компании</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field><FieldLabel>Название бренда</FieldLabel><Input name="company_name" placeholder="Название" /></Field>
              <Field><FieldLabel>Нужен нейминг?</FieldLabel>
                <Select name="naming_help" defaultValue="no"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper"><SelectItem value="yes">Да, нужно название</SelectItem><SelectItem value="no">Нет, уже есть</SelectItem><SelectItem value="discuss">Да, но хотел бы обсудить его</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <FileUpload attachments={attachments} onRemoveFile={removeFile} onOpenLightbox={(i) => { setActiveIndex(i); setLightboxOpen(true); }} fileInputRef={fileInputRef} onFileChange={handleFileChange} />
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox id="agreement" name="agreement" />
              <Label htmlFor="agreement" className="text-body-4 text-(--on-bg-medium) leading-tight cursor-pointer">
                Даю согласие на обработку моих Персональных Данных
              </Label>
            </div>
            {errors.agreement && <p className="text-sm text-destructive font-medium">{errors.agreement}</p>}
          </div>
          <div className="pt-6">
            <Button type="submit" size="xlarge" className="w-full sm:w-fit! sm:px-16!" disabled={loading}>{loading ? "Отправка..." : "Отправить заявку"}</Button>
          </div>
        </form>
      </Container>
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent showCloseButton={false} className="!fixed !inset-0 !z-50 !max-w-none !max-h-none !p-0 !border-0 !bg-black/98 !rounded-none !translate-none !top-0 !left-0">
          <Button variant="glass" className="absolute top-4 right-4 z-[999]! rounded-full border-(--white)" size="icon-medium" onClick={() => setLightboxOpen(false)}>
            <X className="size-10! [&>path]:fill-(--white)" />
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
                        <Newspaper className="size-16! [&>path]:fill-(--dark-1)!" />
                        <h2 className="text-display-3 text-white break-all">{attr.file.name}</h2>
                        <Button variant="glass" shape="round" size="large" asChild><a href={attr.preview || URL.createObjectURL(attr.file)} download={attr.file.name}>Скачать</a></Button>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {attachments.length > 1 && (<><CarouselPrevious className="left-6 z-50 bg-white/5 text-white size-12!" /><CarouselNext className="right-6 z-50 bg-white/5 text-white size-12!" /></>)}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}
