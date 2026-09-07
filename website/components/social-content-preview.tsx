"use client";
import Image from "next/image";
import Link from "next/link";
import { Play, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SocialContentPreviewProps {
  type: "video" | "article";
  title: string;
  description?: string;
  thumbnail?: string; // image URL
  link: string;
  className?: string;
}

export function SocialContentPreview({
  type,
  title,
  description,
  thumbnail,
  link,
  className,
}: SocialContentPreviewProps) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-(--outline) bg-(--card) transition-all hover:shadow-lg hover:shadow-(--primary)/10",
        "max-w-[550px] w-full mx-auto",
        className
      )}
    >
      {/* Media area (video thumbnail or article cover) */}
      <div className="relative aspect-video overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-(--primary-card) to-(--bg-disabled) flex items-center justify-center">
            {type === "video" ? (
              <Play className="w-14 h-14 text-(--primary) fill-(--primary)" />
            ) : (
              <ArrowUpRight className="w-14 h-14 text-(--primary)" />
            )}
          </div>
        )}
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {type === "video" && (
          <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
            Video
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="p-5">
        <h3 className="text-display-4 font-heading font-semibold text-(--on-bg-high) mb-2 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-body-3 text-(--on-bg-medium) line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
