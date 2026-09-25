"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CloudUpload, X, Play, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";
import type { ProjectMedia } from "@/utils/api/projects";

interface Props {
  value: ProjectMedia[];
  onChange: (next: ProjectMedia[]) => void;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — matches the backend ceiling
const ACCEPT = "image/*,video/mp4,video/webm,video/quicktime";

export function ProjectMediaUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const uploadOne = async (file: File): Promise<ProjectMedia | null> => {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name}: файл больше ${MAX_BYTES / 1024 / 1024} МБ`);
      return null;
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await $fetch("/api/v1/uploads/media", {
      method: "POST",
      body: fd,
      isToast: false,
    });
    if (!res?.response?.ok) {
      toast.error(res?.json?.detail || `${file.name}: не удалось загрузить`);
      return null;
    }
    return {
      type: res.json.kind as "image" | "video",
      url: res.json.url as string,
      caption: null,
      thumbnail_url: null,
      sort_order: 0,
    };
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const results: ProjectMedia[] = [];
      for (const f of Array.from(files)) {
        const item = await uploadOne(f);
        if (item) results.push(item);
      }
      if (results.length) {
        onChange([...value, ...results].map((m, i) => ({ ...m, sort_order: i })));
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx).map((m, i) => ({ ...m, sort_order: i }));
    onChange(next);
  };

  const setCaption = (idx: number, caption: string) => {
    onChange(value.map((m, i) => (i === idx ? { ...m, caption } : m)));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((m, i) => ({ ...m, sort_order: i })));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {value.map((m, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
              onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
              onDragLeave={() => setDragOverIdx(null)}
              onDrop={(e) => {
                e.preventDefault();
                const from = Number(e.dataTransfer.getData("text/plain"));
                move(from, idx);
                setDragOverIdx(null);
              }}
              className={cn(
                "relative rounded-2xl border border-(--outline) bg-(--card) overflow-hidden group",
                dragOverIdx === idx && "ring-2 ring-(--primary) ring-offset-2"
              )}
            >
              <div className="relative aspect-video bg-black/40">
                {m.type === "image" ? (
                  <Image
                    src={m.url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/70">
                    <Play className="size-8" />
                    <span className="text-[10px] uppercase tracking-widest">Видео</span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="glass"
                  size="icon-small"
                  className="absolute top-2 right-2 size-7 rounded-full"
                  onClick={() => remove(idx)}
                >
                  <X className="size-3.5" />
                </Button>
                <GripVertical className="absolute top-2 left-2 size-4 text-white/60" />
              </div>
              <div className="p-2 space-y-1.5">
                <Input
                  value={m.caption || ""}
                  onChange={(e) => setCaption(idx, e.target.value)}
                  placeholder="Подпись"
                  className="h-8 text-xs"
                />
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="text"
                    size="icon-small"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    title="Вверх"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    size="icon-small"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === value.length - 1}
                    title="Вниз"
                  >
                    ↓
                  </Button>
                  <span className="text-[10px] text-(--on-bg-low) font-mono ml-auto">
                    {idx + 1} / {value.length}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "w-full flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-(--outline)",
          "hover:border-(--primary) hover:bg-(--primary-glass) transition-all py-8 group",
          uploading && "opacity-60 cursor-wait"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-(--primary)" />
            <span className="text-xs font-medium text-(--on-bg-medium)">Загрузка…</span>
          </>
        ) : (
          <>
            <CloudUpload className="size-6 text-(--on-bg-low) group-hover:text-(--primary) transition-colors" />
            <span className="text-xs font-bold uppercase tracking-wider text-(--on-bg-low) group-hover:text-(--primary)">
              Добавить изображения или видео
            </span>
            <span className="text-[10px] text-(--on-bg-low)">
              до 10 МБ · изображения и короткие видео
            </span>
          </>
        )}
      </button>
    </div>
  );
}
