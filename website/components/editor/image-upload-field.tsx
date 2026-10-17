"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CloudArrowUpIcon, CircleNotchIcon, XIcon, PencilSimpleIcon,
} from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { ImageEditorDialog } from "./image-editor/image-editor-dialog";
import { readFileAsDataURL } from "./image-editor/canvas-utils";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  defaultAspect?: "free" | "1:1" | "4:3" | "16:9" | "21:8";
  fileType?: "image" | "video" | "both";
}

export function ImageUploadField({
  value, onChange, placeholder, defaultAspect, fileType = "both",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [editorAspect, setEditorAspect] = useState<"free" | "1:1" | "4:3" | "16:9" | "21:8">(
    defaultAspect ?? "free",
  );

  const pickFile = () => inputRef.current?.click();

  const uploadBlob = async (blob: Blob, filename: string): Promise<string> => {
    const fd = new FormData();
    fd.append("file", new File([blob], filename, { type: blob.type }));
    const res = await $fetch("/api/v1/uploads/images", {
      method: "POST",
      body: fd,
      isToast: false,
    });
    if (!res?.response?.ok || !res.json?.url) {
      throw new Error(res?.json?.detail || "Upload failed");
    }
    return res.json.url as string;
  };

  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Файл больше 20 МБ");
      return;
    }
    
    // Handle video upload directly (skip editor)
    if (file.type.startsWith("video/")) {
      if (fileType === "image") {
        toast.error("Это поле только для изображений");
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await $fetch("/api/v1/uploads/media", {
          method: "POST",
          body: fd,
          isToast: false,
        });
        if (!res?.response?.ok || !res.json?.url) {
          throw new Error(res?.json?.detail || "Ошибка загрузки видео");
        }
        onChange(res.json.url);
        toast.success("Видео загружено и конвертировано в WebM");
      } catch (err: any) {
        toast.error(err?.message || "Не удалось загрузить видео");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
      return;
    }

    if (fileType === "video") {
      toast.error("Это поле только для видео");
      return;
    }

    // Handle image
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setEditorSrc(dataUrl);
      setEditorAspect(defaultAspect ?? "free");
      setEditorOpen(true);
    } catch (err: any) {
      toast.error(err?.message || "Не удалось открыть изображение");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleEditExisting = () => {
    if (!value) return;
    setEditorSrc(value);
    setEditorAspect(defaultAspect ?? "free");
    setEditorOpen(true);
  };

  const handleApplyEdit = async (blob: Blob, filename: string) => {
    setUploading(true);
    try {
      const url = await uploadBlob(blob, filename);
      onChange(url);
      toast.success("Изображение обновлено");
    } catch (err: any) {
      toast.error(err?.message || "Не удалось сохранить");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const isVideoFile = value ? (value.endsWith(".webm") || value.endsWith(".mp4") || value.endsWith(".mov")) : false;
  const isEmbed = value ? (value.includes("youtube.com") || value.includes("youtu.be") || value.includes("kinescope.io") || value.includes("vimeo.com")) : false;
  const canEdit = !isVideoFile && !isEmbed;

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-(--outline) bg-(--card) group">
          {isVideoFile ? (
            <video src={value} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : isEmbed ? (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <span className="text-white/50 text-sm font-mono truncate px-4">{value}</span>
            </div>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <Button
                type="button"
                variant="glass"
                size="icon-small"
                className="size-8 rounded-full"
                onClick={handleEditExisting}
                title="Редактировать"
              >
                <PencilSimpleIcon className="size-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="glass"
              size="icon-small"
              className="size-8 rounded-full"
              onClick={() => onChange("")}
              title="Удалить"
            >
              <XIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "/uploads/media/... или https://..."}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outlined"
          onClick={pickFile}
          disabled={uploading}
        >
          {uploading ? (
            <CircleNotchIcon className="size-4 animate-spin" />
          ) : (
            <CloudArrowUpIcon className="size-4" />
          )}
          {uploading ? "Загрузка…" : "Загрузить"}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={fileType === "image" ? "image/*" : fileType === "video" ? "video/mp4,video/webm,video/quicktime" : "image/*,video/mp4,video/webm,video/quicktime"}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <ImageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        src={editorSrc}
        defaultAspect={editorAspect}
        lockedAspect={!!defaultAspect && defaultAspect !== "free"}
        onApply={handleApplyEdit}
      />
    </div>
  );
}
