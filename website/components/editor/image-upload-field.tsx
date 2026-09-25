"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CloudArrowUp, CircleNotchIcon, X, PencilSimple,
} from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { ImageEditorDialog } from "./image-editor/image-editor-dialog";
import { readFileAsDataURL } from "./image-editor/canvas-utils";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  /** Suggested aspect ratio in the editor's crop tab. */
  defaultAspect?: "free" | "1:1" | "4:3" | "16:9" | "21:8";
}

export function ImageUploadField({ value, onChange, placeholder, defaultAspect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [editorAspect, setEditorAspect] = useState<"free" | "1:1" | "4:3" | "16:9" | "21:8">(
    defaultAspect ?? "free",
  );

  const pickFile = () => inputRef.current?.click();

  // Upload the raw file OR the edited blob to the backend.
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
    setUploading(true);
    try {
      // Open the editor pre-loaded with the picked file. We show it as a
      // data URL so the editor never has to round-trip to the server just
      // to preview.
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
      throw err; // keep the dialog open on failure
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-(--outline) bg-(--card) group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="glass"
              size="icon-small"
              className="size-8 rounded-full"
              onClick={handleEditExisting}
              title="Редактировать"
            >
              <PencilSimple className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="glass"
              size="icon-small"
              className="size-8 rounded-full"
              onClick={() => onChange("")}
              title="Удалить"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "/uploads/images/... или https://..."}
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
            <CloudArrowUp className="size-4" />
          )}
          {uploading ? "Загрузка…" : "Загрузить"}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <ImageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        src={editorSrc}
        defaultAspect={editorAspect}
        onApply={handleApplyEdit}
      />
    </div>
  );
}
