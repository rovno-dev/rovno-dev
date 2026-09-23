"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload, LoaderCircle, X } from "lucide-react";
import { $fetch } from "@/utils/fetch";

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUploadField({ value, onChange, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await $fetch("/api/v1/uploads/images", {
        method: "POST",
        body: fd,
        isToast: false,
      });
      if (!res?.response?.ok) {
        throw new Error(res?.json?.detail || "Upload failed");
      }
      onChange(res.json.url as string);
    } catch (err: any) {
      toast.error(err.message || "Не удалось загрузить изображение");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl border border-(--outline) bg-(--card)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="glass"
            size="icon-small"
            className="absolute top-2 right-2 size-8 rounded-full"
            onClick={() => onChange("")}
            aria-label="Удалить обложку"
          >
            <X className="size-4" />
          </Button>
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
          onClick={handlePick}
          disabled={uploading}
        >
          {uploading
            ? <LoaderCircle className="size-4 animate-spin" />
            : <CloudUpload className="size-4" />}
          {uploading ? "Загрузка…" : "Загрузить"}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
