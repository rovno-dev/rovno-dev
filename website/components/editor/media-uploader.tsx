"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CircleNotchIcon, CloudArrowUpIcon, XIcon, PlayIcon, DotsSixVerticalIcon,
  ArrowUpIcon, ArrowDownIcon, PencilSimpleIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { $fetch } from "@/utils/fetch";
import { ImageEditorDialog } from "./image-editor/image-editor-dialog";
import { readFileAsDataURL } from "./image-editor/canvas-utils";
import type { ProjectMedia } from "@/utils/api/projects";

interface Props {
  value: ProjectMedia[];
  onChange: (next: ProjectMedia[]) => void;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/*,video/mp4,video/webm,video/quicktime";

export function ProjectMediaUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [editorReplaceIdx, setEditorReplaceIdx] = useState<number | null>(null);

  // Videos upload directly (there's nothing to crop). Images route through
  // the editor first so the admin can crop before the file ever hits the
  // server — that's the whole point of the "Telegram-style" flow.
  const uploadOne = async (file: File): Promise<ProjectMedia | null> => {
    if (file.size > MAX_BYTES) {
      toast.error(`${file.name}: файл больше ${MAX_BYTES / 1024 / 1024} МБ`);
      return null;
    }
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      // Open the editor with the picked file. Return null — the caller
      // will need to await the user's apply action separately.
      const dataUrl = await readFileAsDataURL(file);
      setEditorSrc(dataUrl);
      setEditorReplaceIdx(null); // insert mode
      setEditorOpen(true);
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

  const uploadBlobAsMedia = async (blob: Blob, filename: string) => {
    const fd = new FormData();
    fd.append("file", new File([blob], filename, { type: blob.type }));
    const res = await $fetch("/api/v1/uploads/media", {
      method: "POST",
      body: fd,
      isToast: false,
    });
    if (!res?.response?.ok) {
      throw new Error(res?.json?.detail || "Upload failed");
    }
    return {
      type: res.json.kind as "image" | "video",
      url: res.json.url as string,
      caption: null,
      thumbnail_url: null,
      sort_order: 0,
    } satisfies ProjectMedia;
  };

  const openEditorForIndex = (idx: number) => {
    const m = value[idx];
    if (!m || m.type !== "image") return;
    setEditorSrc(m.url);
    setEditorReplaceIdx(idx);
    setEditorOpen(true);
  };

  const handleEditorApply = async (blob: Blob, filename: string) => {
    const item = await uploadBlobAsMedia(blob, filename);
    if (editorReplaceIdx !== null) {
      const next = [...value];
      next[editorReplaceIdx] = {
        ...item,
        caption: value[editorReplaceIdx].caption,
        sort_order: editorReplaceIdx,
      };
      onChange(next.map((m, i) => ({ ...m, sort_order: i })));
    } else {
      onChange([...value, item].map((m, i) => ({ ...m, sort_order: i })));
    }
    setEditorReplaceIdx(null);
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
    const next = value
      .filter((_, i) => i !== idx)
      .map((m, i) => ({ ...m, sort_order: i }));
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
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIdx(idx);
              }}
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
                  <VideoThumb url={m.url} />
                )}
                <Button
                  type="button"
                  variant="glass"
                  size="icon-small"
                  className="absolute top-2 right-2 size-7 rounded-full"
                  onClick={() => remove(idx)}
                >
                  <XIcon className="size-3.5" />
                </Button>
                <DotsSixVerticalIcon className="absolute top-2 left-2 size-4 text-white/60" />
                {m.type === "image" && (
                  <Button
                    type="button"
                    variant="glass"
                    size="icon-small"
                    className="absolute bottom-2 right-2 size-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditorForIndex(idx);
                    }}
                    title="Редактировать"
                  >
                    <PencilSimpleIcon className="size-3.5" />
                  </Button>
                )}
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
                    <ArrowUpIcon className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    size="icon-small"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === value.length - 1}
                    title="Вниз"
                  >
                    <ArrowDownIcon className="size-3.5" />
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
            <CircleNotchIcon className="size-6 animate-spin text-(--primary)" />
            <span className="text-xs font-medium text-(--on-bg-medium)">Загрузка…</span>
          </>
        ) : (
          <>
            <CloudArrowUpIcon className="size-6 text-(--on-bg-low) group-hover:text-(--primary) transition-colors" />
            <span className="text-xs font-bold uppercase tracking-wider text-(--on-bg-low) group-hover:text-(--primary)">
              Добавить изображения или видео
            </span>
            <span className="text-[10px] text-(--on-bg-low)">
              до 10 МБ · изображения и короткие видео
            </span>
          </>
        )}
      </button>

      <ImageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        src={editorSrc}
        onApply={handleEditorApply}
      />
    </div>
  );
}


/**
 * Telegram-style video preview: renders the first frame as an inline poster
 * with a centered play button. Clicking swaps to a `<video controls>` for
 * playback; click-outside or Esc (browser default) collapses it back.
 *
 * The `#t=0.1` fragment on the video src forces browsers to seek to a
 * non-zero time so the poster frame actually renders. Without it, Chrome
 * shows a black rectangle until the user interacts.
 */
function VideoThumb({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        src={url}
        autoPlay
        controls
        playsInline
        className="absolute inset-0 w-full h-full object-cover bg-black"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="absolute inset-0 w-full h-full group/video"
      aria-label="Воспроизвести видео"
    >
      <video
        src={url + "#t=0.1"}
        preload="metadata"
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/video:bg-black/50 transition-colors">
        <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
          <PlayIcon className="size-5 ml-0.5" weight="fill" />
        </span>
      </span>
    </button>
  );
}
