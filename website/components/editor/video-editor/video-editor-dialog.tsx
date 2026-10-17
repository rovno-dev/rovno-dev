"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CheckIcon, CircleNotchIcon, PlayIcon, PauseIcon, ArrowLeftIcon, CropIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onApply: (
    posterBlob: Blob, 
    startTime: string, 
    endTime: string,
    crop: { x: number; y: number; w: number; h: number }
  ) => Promise<void> | void;
}

export function VideoEditorDialog({ open, onOpenChange, file, onApply }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [applying, setApplying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Filmstrip state
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false);

  // Crop state (4:3)
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Natural dimensions
  const [natSize, setNatSize] = useState({ w: 1920, h: 1080 });
  const [cropData, setCropData] = useState({ x: 0, y: 0, w: 1, h: 1 });

  // Fixed 4:3 frame
  const FW = 480;
  const FH = 360;

  useEffect(() => {
    if (!open || !file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStartTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setThumbnails([]);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  // Calculate dynamic scale to cover the 4:3 frame
  const baseScale = Math.max(FW / natSize.w, FH / natSize.h);
  const currentScale = baseScale * zoom;
  const dw = natSize.w * currentScale;
  const dh = natSize.h * currentScale;

  const maxOffsetX = Math.max(0, (dw - FW) / 2);
  const maxOffsetY = Math.max(0, (dh - FH) / 2);

  const clampedX = Math.max(-maxOffsetX, Math.min(maxOffsetX, offset.x));
  const clampedY = Math.max(-maxOffsetY, Math.min(maxOffsetY, offset.y));

  // Sync crop data for FFmpeg
  useEffect(() => {
    const imgLeft = (FW - dw) / 2 + clampedX;
    const imgTop = (FH - dh) / 2 + clampedY;
    const cropX = Math.max(0, Math.min(1, (0 - imgLeft) / dw));
    const cropY = Math.max(0, Math.min(1, (0 - imgTop) / dh));
    const cropW = Math.min(1, FW / dw);
    const cropH = Math.min(1, FH / dh);
    setCropData({ x: cropX, y: cropY, w: cropW, h: cropH });
  }, [clampedX, clampedY, dw, dh]);

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setDuration(v.duration);
    setEndTime(v.duration);
    setNatSize({ w: v.videoWidth, h: v.videoHeight });
    
    v.play().then(() => setIsPlaying(true)).catch(() => {
      setIsMuted(true);
      v.play().then(() => setIsPlaying(true)).catch(() => {});
    });
    
    if (videoUrl) generateThumbnails(videoUrl);
  };

  const generateThumbnails = async (url: string) => {
    setIsGeneratingThumbs(true);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });
    
    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80 * (video.videoHeight / video.videoWidth);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const thumbs = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      video.currentTime = (video.duration / count) * i;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      thumbs.push(canvas.toDataURL("image/jpeg", 0.5));
    }
    
    setThumbnails(thumbs);
    setIsGeneratingThumbs(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (t >= endTime) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = startTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const safeSeek = (time: number): Promise<void> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video) return resolve();
      if (Math.abs(video.currentTime - time) < 0.1) return resolve();
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = time;
      setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }, 500);
    });
  };

  const handleApply = async () => {
    if (!videoRef.current) return;
    setApplying(true);
    try {
      await safeSeek(startTime);
      const video = videoRef.current;
      
      // Create poster matching the crop
      const canvas = document.createElement("canvas");
      // Use a standard high-res 4:3 size for the poster
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");
      
      // Draw only the cropped portion
      const sx = cropData.x * video.videoWidth;
      const sy = cropData.y * video.videoHeight;
      const sw = cropData.w * video.videoWidth;
      const sh = cropData.h * video.videoHeight;
      
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.9)
      );

      await onApply(blob, formatTime(startTime), formatTime(endTime), cropData);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  // Pan events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStart({ x: e.clientX - clampedX, y: e.clientY - clampedY });
    if (isPlaying) togglePlay(); // Pause on drag
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragStart(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className="sm:max-w-[1100px] w-[95vw] h-[90vh] max-h-[800px] p-0 gap-0 overflow-hidden bg-[#0a0a0a] border-none shadow-2xl rounded-2xl flex flex-col md:flex-row"
      >
        {/* LEFT: Video Player (4:3 Crop Box) */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          
          <div 
            className="relative cursor-move overflow-hidden border border-white/20 shadow-2xl"
            style={{ width: FW, height: FH }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                muted={isMuted}
                className="absolute pointer-events-none max-w-none"
                style={{
                  width: dw,
                  height: dh,
                  left: (FW - dw) / 2 + clampedX,
                  top: (FH - dh) / 2 + clampedY,
                }}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                playsInline
              />
            )}
            
            {/* 4:3 Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
            </div>
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/90 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/90 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/90 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/90 pointer-events-none" />
            
            {/* Play/Pause Overlay */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none",
              isPlaying ? "opacity-0" : "opacity-100 bg-black/20"
            )}>
              <div className="size-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl">
                {isPlaying ? <PauseIcon className="size-8" weight="fill" /> : <PlayIcon className="size-8 ml-1" weight="fill" />}
              </div>
            </div>
          </div>
          
          {/* Controls under video */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <button onClick={togglePlay} className="text-white hover:text-white/80">
                {isPlaying ? <PauseIcon className="size-5" weight="fill" /> : <PlayIcon className="size-5" weight="fill" />}
              </button>
              <span className="text-xs font-mono text-white/80">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <div className="w-px h-4 bg-white/20 mx-2" />
              <span className="text-xs text-white/60 flex items-center gap-1"><CropIcon className="size-4" /> Перетащите для обрезки</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Controls Sidebar */}
        <div className="w-full md:w-[380px] bg-[#121212] border-l border-white/5 flex flex-col shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <button onClick={() => onOpenChange(false)} className="text-white hover:text-white/70 transition-colors">
              <ArrowLeftIcon className="size-6" />
            </button>
            <span className="text-white font-semibold text-sm">Изменить</span>
            <Button 
              onClick={handleApply} 
              disabled={applying || !duration} 
              className="bg-white text-black hover:bg-white/90 h-8 px-4 rounded-md text-sm font-semibold"
            >
              {applying ? <CircleNotchIcon className="size-4 animate-spin text-black" /> : "Далее"}
            </Button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-8 scrollbar-admin">
            {/* Zoom Control */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white">Масштаб</h3>
                <span className="text-xs font-mono text-white/50">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={4}
                step={0.01}
                onValueChange={([v]) => setZoom(v)}
              />
            </div>

            {/* Trim (Filmstrip Slider) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Обрезка по времени</h3>
              
              <div className="relative py-2">
                <div className="relative h-16 rounded-sm overflow-hidden bg-white/5">
                  {thumbnails.length > 0 && (
                    <div className="absolute inset-0 flex">
                      {thumbnails.map((t, i) => (
                        <img key={i} src={t} className="flex-1 object-cover h-full opacity-50" alt="" />
                      ))}
                    </div>
                  )}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-black/60 pointer-events-none z-10 border-y border-l border-white/20"
                    style={{ width: `${(startTime / duration) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 right-0 bg-black/60 pointer-events-none z-10 border-y border-r border-white/20"
                    style={{ width: `${(1 - endTime / duration) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 border-[2px] border-white pointer-events-none z-20"
                    style={{
                      left: `${(startTime / duration) * 100}%`,
                      width: `${((endTime - startTime) / duration) * 100}%`
                    }}
                  />
                </div>

                <div className="absolute inset-0 z-30 flex items-center px-0">
                  <Slider
                    value={[startTime, endTime]}
                    min={0}
                    max={duration}
                    step={0.1}
                    minStepsBetweenThumbs={1}
                    onValueChange={([start, end]) => {
                      setStartTime(start);
                      setEndTime(end);
                    }}
                    onValueCommit={([start]) => {
                      if (videoRef.current) videoRef.current.currentTime = start;
                    }}
                    className={cn(
                      "[&_[data-slot=slider-track]]:bg-transparent",
                      "[&_[data-slot=slider-range]]:bg-transparent",
                      "[&_[data-slot=slider-thumb]]:h-16 [&_[data-slot=slider-thumb]]:w-2 [&_[data-slot=slider-thumb]]:rounded-none [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-none"
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs font-mono text-white/60">
                <span>{formatTime(startTime)}</span>
                <span>{formatTime(endTime)}</span>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-sm font-medium text-white">Звук включен</span>
              <Switch 
                checked={!isMuted} 
                onCheckedChange={(checked) => setIsMuted(!checked)} 
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
