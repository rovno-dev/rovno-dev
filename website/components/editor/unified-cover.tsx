"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CloudArrowUpIcon, CircleNotchIcon, XIcon, VideoCameraIcon } from "@phosphor-icons/react";
import { $fetch } from "@/utils/fetch";
import { ImageEditorDialog } from "./image-editor/image-editor-dialog";
import { VideoEditorDialog } from "./video-editor/video-editor-dialog";
import { readFileAsDataURL } from "./image-editor/canvas-utils";

interface Props {
  imageUrl: string;
  videoUrl: string;
  onChange: (imageUrl: string, videoUrl: string) => void;
}

export const UnifiedCover = React.memo(function UnifiedCover({ imageUrl, videoUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const activeUrl = videoUrl || imageUrl;

  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Файл больше 20 МБ");
      return;
    }
    
    if (file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoEditorOpen(true);
    } else {
      setUploading(true);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setEditorSrc(dataUrl);
        setEditorOpen(true);
      } catch {
        toast.error("Не удалось открыть изображение");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const handleApplyImage = async (blob: Blob, filename: string) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], filename, { type: blob.type }));
      const res = await $fetch("/api/v1/uploads/media", { method: "POST", body: fd, isToast: false });
      if (!res?.response?.ok) throw new Error("Upload failed");
      onChange(res.json.url, ""); 
      toast.success("Обложка обновлена");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyVideo = async (posterBlob: Blob, startTime: string, endTime: string, crop: { x: number; y: number; w: number; h: number }) => {
    if (!videoFile) return;
    setUploading(true);
    try {
      // 1. Upload poster
      const posterFd = new FormData();
      posterFd.append("file", new File([posterBlob], "poster.jpg", { type: "image/jpeg" }));
      const posterRes = await $fetch("/api/v1/uploads/media", { method: "POST", body: posterFd, isToast: false });
      
      // 2. Upload video with crop
      const videoFd = new FormData();
      videoFd.append("file", videoFile);
      videoFd.append("start_time", startTime);
      videoFd.append("end_time", endTime);
      videoFd.append("crop_x", crop.x.toString());
      videoFd.append("crop_y", crop.y.toString());
      videoFd.append("crop_w", crop.w.toString());
      videoFd.append("crop_h", crop.h.toString());
      
      const videoRes = await $fetch("/api/v1/uploads/media", { method: "POST", body: videoFd, isToast: false });
      
      if (!posterRes?.response?.ok || !videoRes?.response?.ok) throw new Error("Upload failed");
      
      onChange(posterRes.json.url, videoRes.json.url);
      toast.success("Видео загружено");
    } catch (err: any) {
      toast.error("Ошибка загрузки видео");
      throw err;
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {activeUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-(--outline) bg-(--card) group max-w-md">
          {videoUrl ? (
          videoUrl.endsWith(".webm") || videoUrl.endsWith(".mp4") ? (
            <video src={videoUrl} poster={imageUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
          ) : (
            <iframe src={`${videoUrl}?autoplay=1&muted=1&loop=1`} className="absolute inset-0 w-full h-full object-cover pointer-events-none border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" />
          )
        ) : (
           /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
          {videoUrl && (
            <div className="absolute top-2 left-2 bg-black/60 text-white rounded-md px-2 py-0.5 text-xs font-mono flex items-center gap-1 backdrop-blur-sm">
              <VideoCameraIcon /> Video
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="glass" size="icon-small" className="size-8 rounded-full" onClick={() => onChange("", "")}>
              <XIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="w-full max-w-md aspect-[4/3] rounded-2xl border-2 border-dashed border-(--outline) bg-(--card)/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-(--primary) hover:bg-(--primary-glass) transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <CloudArrowUpIcon className="size-8 text-(--on-bg-low)" />
          <span className="text-sm font-medium text-(--on-bg-high)">Загрузить фото или видео</span>
          <span className="text-xs text-(--on-bg-low)">до 20 МБ</span>
        </div>
      )}
      
      {activeUrl && (
        <div>
           <Button variant="outlined" size="small" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <CircleNotchIcon className="size-4 animate-spin" /> : <CloudArrowUpIcon className="size-4" />}
            Заменить обложку
          </Button>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <ImageEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        src={editorSrc}
        defaultAspect="4:3"
        lockedAspect={true}
        onApply={handleApplyImage}
      />
      
      <VideoEditorDialog
        open={videoEditorOpen}
        onOpenChange={setVideoEditorOpen}
        file={videoFile}
        onApply={handleApplyVideo}
      />
    </div>
  );
});
