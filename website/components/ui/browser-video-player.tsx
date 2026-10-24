"use client";

import { useRef, useState } from "react";
import { PlayCircle, PauseCircle, ArrowsOut, ShieldCheck } from "@phosphor-icons/react";

export function BrowserVideoPlayer({ 
  src, 
  url = "app.workspace.ru", 
  className = "" 
}: { 
  src: string, 
  url?: string, 
  className?: string 
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-(--outline) bg-(--card) flex flex-col group/browser ${className}`}>
      {/* Browser Header */}
      <div className="h-10 bg-(--bg) border-b border-(--outline) flex items-center px-4 gap-2">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-400/80" />
          <div className="size-3 rounded-full bg-amber-400/80" />
          <div className="size-3 rounded-full bg-green-400/80" />
        </div>
        <div className="mx-auto bg-(--card) border border-(--outline) rounded-md px-3 py-1 text-[10px] text-(--on-bg-low) font-mono flex items-center gap-2">
          <ShieldCheck className="size-3" />
          {url}
        </div>
      </div>
      
      {/* Video Container */}
      <div ref={containerRef} className="relative aspect-video w-full bg-black overflow-hidden group/video">
        <video 
          ref={videoRef}
          src={src} 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          onClick={togglePlay}
        />
        
        {/* Big Play Button (Only visible when paused) */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10"
            onClick={togglePlay}
          >
            <PlayCircle weight="fill" className="size-20 text-white/80 hover:text-white transition-colors" />
          </div>
        )}

        {/* Bottom Control Bar (Visible on hover) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 z-20">
          <button onClick={togglePlay} className="text-white hover:text-(--primary) transition-colors">
            {isPlaying ? (
              <PauseCircle weight="fill" className="size-8" />
            ) : (
              <PlayCircle weight="fill" className="size-8" />
            )}
          </button>
          
          <button onClick={toggleFullscreen} className="text-white hover:text-(--primary) transition-colors" title="Fullscreen">
            <ArrowsOut weight="bold" className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
