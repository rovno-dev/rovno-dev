"use client";

import { useRef, useState } from "react";
import { PlayCircle, PauseCircle, ArrowsOut } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export function CustomVideoPlayer({
  src,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
}: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
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
    <div ref={containerRef} className={cn("relative overflow-hidden group/video bg-black", className)}>
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
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
  );
}
