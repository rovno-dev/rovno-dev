"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudArrowUpIcon, TrashIcon, CircleNotchIcon, CropIcon, DotsSixVerticalIcon, ArrowsOutIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reorder } from "motion/react";
import { ImageEditorDialog } from "./image-editor/image-editor-dialog";

export interface MediaItem {
  id: string;
  url: string;
  type: "image" | "video";
  alt: string;
  title: string;
  filename: string;
  status: "uploading" | "ready" | "error";
}

export interface InitialMediaData {
  type: "image" | "video";
  src: string;
  alt?: string;
  caption?: string;
}

export function MediaInsertDialog({
  open, onOpenChange, onInsert, initialFiles, initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (markdown: string) => void;
  initialFiles?: File[] | null;
  initialData?: InitialMediaData[] | null;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [fullWidth, setFullWidth] = useState(true);
  const [columns, setColumns] = useState("2");
  const [aspectRatio, setAspectRatio] = useState<"16/9" | "4/3" | "1/1" | "3/4">("4/3");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropId, setCropId] = useState<string | null>(null);

  useEffect(() => {
    if (open && initialFiles && initialFiles.length > 0) {
      handleFilesArray(initialFiles);
    }
  }, [open, initialFiles]);

  useEffect(() => {
    if (open && initialData && initialData.length > 0) {
      setItems(initialData.map(d => ({
        id: Math.random().toString(36).substring(7),
        url: d.src,
        type: d.type,
        alt: d.alt || "",
        title: d.caption || "",
        filename: d.src.split("/").pop() || "",
        status: "ready"
      })));
    } else if (open && !initialFiles && !initialData) {
      setItems([]);
    }
  }, [open, initialData, initialFiles]);

  const uploadFile = async (file: File, tempId: string) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error(`${file.name}: файл больше 20 МБ`);
      setItems(prev => prev.map(i => i.id === tempId ? { ...i, status: "error" } : i));
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await $fetch("/api/v1/uploads/media", {
        method: "POST",
        body: fd,
        isToast: false,
      });
      if (!res?.response?.ok) {
        throw new Error(res?.json?.detail || `Ошибка загрузки ${file.name}`);
      }
      setItems(prev => prev.map(i => 
        i.id === tempId 
          ? { ...i, url: res.json.url, type: res.json.kind, status: "ready", title: file.name.split(".")[0] } 
          : i
      ));
    } catch (err: any) {
      toast.error(err.message);
      setItems(prev => prev.map(i => i.id === tempId ? { ...i, status: "error" } : i));
    }
  };

  const handleFilesArray = (files: File[]) => {
    if (!files || files.length === 0) return;
    const filesToUpload = files.slice(0, 2 - items.length);
    if (filesToUpload.length === 0) {
      toast.error("Можно добавить не более 2 файлов в одну сетку");
      return;
    }
    
    const newItems: MediaItem[] = filesToUpload.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: "",
      type: file.type.startsWith("video/") ? "video" : "image",
      alt: "",
      title: "",
      filename: file.name,
      status: "uploading"
    }));
    setItems(prev => [...prev, ...newItems]);
    filesToUpload.forEach((file, i) => uploadFile(file, newItems[i].id));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    handleFilesArray(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: "alt" | "title", value: string) => 
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const handleCropApply = async (blob: Blob, filename: string) => {
    if (!cropId) return;
    setItems(prev => prev.map(i => i.id === cropId ? { ...i, status: "uploading" } : i));
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], filename, { type: blob.type }));
      const res = await $fetch("/api/v1/uploads/media", { method: "POST", body: fd, isToast: false });
      if (!res?.response?.ok) throw new Error("Upload failed");
      setItems(prev => prev.map(i => i.id === cropId ? { ...i, url: res.json.url, status: "ready" } : i));
    } catch {
      toast.error("Ошибка при сохранении обрезанного изображения");
      setItems(prev => prev.map(i => i.id === cropId ? { ...i, status: "error" } : i));
    } finally {
      setCropId(null);
      setCropSrc(null);
    }
  };

  const handleInsert = () => {
    const readyItems = items.filter(i => i.status === "ready").slice(0, 2);
    if (readyItems.length === 0) return;
    
    const mediaData = readyItems.map(item => ({
      type: item.type,
      src: item.url,
      alt: item.alt || item.title || "image",
      caption: item.title
    }));
    
    // ФИКС: JSON должен быть строго в одну строку. MDXEditor (Lexical) падает на переносах строк в JSX.
    const jsonString = JSON.stringify(mediaData);
    
    onInsert(`<Gallery fullWidth={${fullWidth}} columns={${columns}} aspectRatio="${aspectRatio}" media={${jsonString}} />\n\n`);
    setItems([]);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className={cn(
            "sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden transition-colors",
            dragOver && "ring-2 ring-(--primary) ring-offset-2 ring-offset-(--bg)"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
          onDrop={handleDrop}
        >
          <DialogHeader className="px-6 py-4 border-b border-(--outline) flex-row items-center justify-between space-y-0 gap-4">
            <DialogTitle>Добавить медиа</DialogTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-(--on-bg-medium) whitespace-nowrap">Колонки:</Label>
                <Select value={columns} onValueChange={setColumns}>
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-(--on-bg-medium) whitespace-nowrap">Пропорции:</Label>
                <Select value={aspectRatio} onValueChange={(v: any) => setAspectRatio(v)}>
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16/9">16:9</SelectItem>
                    <SelectItem value="4/3">4:3</SelectItem>
                    <SelectItem value="1/1">1:1</SelectItem>
                    <SelectItem value="3/4">3:4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="full-width" checked={fullWidth} onCheckedChange={setFullWidth} />
                <Label htmlFor="full-width" className="text-sm cursor-pointer flex items-center gap-1">
                  <ArrowsOutIcon className="size-4" /> Широко
                </Label>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-admin">
            <div
              onClick={() => {
                if (items.length >= 2) {
                  toast.error("Достигнут лимит в 2 файла");
                  return;
                }
                fileInputRef.current?.click();
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer",
                dragOver ? "border-(--primary) bg-(--primary-glass)" : "border-(--outline) hover:border-(--primary) hover:bg-(--primary-glass)/50",
                items.length >= 2 && "opacity-50 cursor-not-allowed hidden"
              )}
            >
              <CloudArrowUpIcon className="size-10 text-(--on-bg-low)" />
              <div className="text-center">
                <p className="text-sm font-medium text-(--on-bg-high)">Нажмите или перетащите файлы сюда</p>
                <p className="text-xs text-(--on-bg-medium) mt-1">Максимум 2 файла для сетки</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {items.length > 0 && (
              <Reorder.Group axis="y" values={items} onReorder={setItems} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item) => (
                  <Reorder.Item 
                    key={item.id} 
                    value={item} 
                    className="relative flex flex-col gap-3 p-3 rounded-2xl border border-(--outline) bg-(--card) group cursor-grab active:cursor-grabbing shadow-sm w-full"
                    whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                  >
                    <div className="relative w-full rounded-xl overflow-hidden bg-(--bg-disabled) border border-(--outline)" style={{ aspectRatio: aspectRatio.replace("/", " / ") }}>
                      {item.status === "uploading" ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--card)/50 backdrop-blur-sm z-20">
                          <CircleNotchIcon className="size-6 animate-spin text-(--primary) mb-2" />
                        </div>
                      ) : item.status === "error" ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-(--error-card)/50 z-20">
                          <span className="text-xs font-medium text-(--error)">Ошибка</span>
                        </div>
                      ) : item.type === "image" ? (
                        <Image src={item.url} alt="" fill className="object-cover pointer-events-none" draggable={false} />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" controls />
                      )}
                      {item.status !== "uploading" && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium uppercase tracking-wider backdrop-blur-sm z-10 flex items-center gap-1 pointer-events-none">
                          <DotsSixVerticalIcon className="size-3" />
                          {item.type === "image" ? "IMG" : "VID"}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {item.type === "image" && item.status === "ready" && (
                          <Button type="button" variant="glass" size="icon-small" onClick={(e) => { e.stopPropagation(); setCropId(item.id); setCropSrc(item.url); }} className="size-7 rounded-full" title="Обрезать">
                            <CropIcon className="size-3.5" />
                          </Button>
                        )}
                        <Button type="button" variant="glass" size="icon-small" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="size-7 rounded-full">
                          <TrashIcon className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input value={item.alt} onChange={(e) => updateItem(item.id, "alt", e.target.value)} placeholder="Alt текст (для SEO)" className="h-8 text-xs bg-(--bg) border-(--outline)" disabled={item.status !== "ready"} />
                      <Input value={item.title} onChange={(e) => updateItem(item.id, "title", e.target.value)} placeholder="Подпись" className="h-8 text-xs bg-(--bg) border-(--outline)" disabled={item.status !== "ready"} />
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-(--outline) bg-(--bg) flex-row justify-between sm:justify-between items-center">
            <span className="text-sm text-(--on-bg-medium)">Выбрано: {items.filter(i => i.status === "ready").length} из 2</span>
            <div className="flex gap-2">
              <Button variant="outlined" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button onClick={handleInsert} disabled={items.filter(i => i.status === "ready").length === 0} className="bg-(--primary) text-(--on-primary)">Вставить</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {cropSrc && (
        <ImageEditorDialog
          open={!!cropSrc}
          onOpenChange={(open) => { if (!open) { setCropId(null); setCropSrc(null); } }}
          src={cropSrc}
          onApply={handleCropApply}
        />
      )}
    </>
  );
}
