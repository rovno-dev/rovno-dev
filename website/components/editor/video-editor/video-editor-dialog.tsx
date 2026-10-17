"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, CircleNotchIcon } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onApply: (posterBlob: Blob, startTime: string, endTime: string) => Promise<void> | void;
}

export function VideoEditorDialog({ open, onOpenChange, file, onApply }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [applying, setApplying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration;
    setDuration(d);
    setEndTime(d);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const parseTime = (str: string) => {
    const [m, s] = str.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  };

  const handleApply = async () => {
    if (!videoRef.current) return;
    setApplying(true);
    try {
      // Seek to the poster frame (default to 1s or start time)
      videoRef.current.currentTime = Math.min(startTime + 1, endTime - 0.1);
      
      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoRef.current?.removeEventListener("seeked", onSeeked);
          resolve();
        };
        videoRef.current?.addEventListener("seeked", onSeeked);
      });

      // Draw to canvas to extract poster
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.9)
      );

      await onApply(blob, formatTime(startTime), formatTime(endTime));
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-(--outline)">
          <DialogTitle>Настройка видео-обложки</DialogTitle>
        </DialogHeader>
        <div className="p-5 space-y-4 bg-(--bg)">
          {videoUrl && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                className="max-h-[40vh] w-full object-contain"
                onLoadedMetadata={handleLoadedMetadata}
                controls
              />
            </div>
          )}
          
          <div className="space-y-4 bg-(--card) p-4 rounded-xl border border-(--outline)">
            <div>
              <label className="text-sm font-medium mb-1 block">Начало: {formatTime(startTime)}</label>
              <input
                type="range" min={0} max={duration - 1} step={0.1}
                value={startTime}
                onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 1))}
                className="w-full accent-(--primary)"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Конец: {formatTime(endTime)}</label>
              <input
                type="range" min={startTime + 1} max={duration} step={0.1}
                value={endTime}
                onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 1))}
                className="w-full accent-(--primary)"
              />
            </div>
            <p className="text-xs text-(--on-bg-low)">
              Кадр для постера будет взят с {formatTime(startTime + 1)}.
            </p>
          </div>
        </div>
        <DialogFooter className="px-5 py-3 border-t border-(--outline) flex-row justify-between">
          <Button variant="text" onClick={() => onOpenChange(false)} disabled={applying}>Отмена</Button>
          <Button onClick={handleApply} disabled={applying || !duration}>
            {applying ? <CircleNotchIcon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
            Применить и загрузить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
