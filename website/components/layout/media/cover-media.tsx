"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const FILE_VIDEO_RE = /\.(mp4|webm|ogv|mov)(?:[?#]|$)/i;

/** True when the URL points at a video file we can render in a <video>. */
export function isVideoSource(src?: string | null): boolean {
  if (!src) return false;
  return FILE_VIDEO_RE.test(src.split("?")[0].split("#")[0]);
}

export interface CoverMediaProps {
  /** Image or video URL. Video files are detected by extension. */
  src?: string | null;
  /** Poster shown before/while a video loads. Usually the image cover. */
  poster?: string | null;
  alt: string;
  /**
   * One fixed aspect ratio for the crop, e.g. "16/9" or "4/3".
   * Omit it when the parent already controls the frame size.
   */
  aspectRatio?: string;
  className?: string;
  /** Classes applied to the <img>/<video> itself (hover scale, contrast, etc.). */
  mediaClassName?: string;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  /** Start the video on hover and rewind when the pointer leaves. */
  playOnHover?: boolean;
  objectPosition?: string;
  /** Rendered inside the frame when `src` is empty. */
  fallback?: ReactNode;
  /** Overlays (gradients, title, badges) rendered on top of the media. */
  children?: ReactNode;
  /** Optional wrapper around the generated media, e.g. a motion parallax layer. */
  renderMedia?: (media: ReactNode) => ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * One frame for every cover image or video.
 *
 * The frame owns the crop (`overflow-hidden`) and the optional fixed
 * aspect ratio; the media always fills it with `object-fit: cover`.
 * Images and video files are detected automatically by extension.
 */
export function CoverMedia({
  src,
  poster,
  alt,
  aspectRatio,
  className,
  mediaClassName,
  sizes = "100vw",
  quality,
  priority,
  autoPlay = false,
  muted,
  loop,
  controls,
  playOnHover = false,
  objectPosition,
  fallback,
  children,
  renderMedia,
  onLoad,
  onError,
}: CoverMediaProps) {
  const mediaSrc = src?.trim() || null;
  const video = isVideoSource(mediaSrc);
  const objectStyle: CSSProperties | undefined = objectPosition
    ? { objectPosition }
    : undefined;

  const media = mediaSrc ? (
    video ? (
      <video
        src={mediaSrc}
        poster={poster || undefined}
        autoPlay={autoPlay}
        muted={muted ?? autoPlay}
        loop={loop ?? autoPlay}
        playsInline
        controls={controls}
        preload={autoPlay ? "auto" : "metadata"}
        style={objectStyle}
        className={cn(
          "absolute inset-0 h-full w-full object-cover",
          mediaClassName,
        )}
        onLoadedData={onLoad}
        onError={onError}
        onMouseEnter={
          playOnHover
            ? (event) => event.currentTarget.play().catch(() => {})
            : undefined
        }
        onMouseLeave={
          playOnHover
            ? (event) => {
                event.currentTarget.pause();
                event.currentTarget.currentTime = 0;
              }
            : undefined
        }
      />
    ) : (
      <Image
        src={mediaSrc}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        style={objectStyle}
        className={cn("object-cover", mediaClassName)}
        onLoad={onLoad}
        onError={onError}
      />
    )
  ) : null;

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-(--card)", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {mediaSrc ? (renderMedia ? renderMedia(media) : media) : fallback}
      {children}
    </div>
  );
}
