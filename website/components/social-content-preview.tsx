"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { TerminalStyledInline } from "./layout/fancy/terminal-styled-inline";

export interface ShortVideoProps {
  video: {
    src: string;
  },
  title: string;
  description: string;
  className?: string;
}

export function ShortVideo({ video, title, description, className }: ShortVideoProps) {
  return (
    <div
      className={cn("h-full aspect-[9/16] relative overflow-hidden bg-black rounded-2xl shadow-xl border border-border/40 shrink-0", className)}
    >
      <video
        src={video.src}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        controls
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12">
        <h3 className="text-sm font-semibold text-white line-clamp-1">
          {title}
        </h3>
        <p className="text-[11px] text-gray-300 line-clamp-2 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

export function FakeAddressBar({ url }: { url: string }) {
  const displayUrl = url.replace(/(^\w+:|^)\/\//, "");

  return (
    <div className="w-full bg-muted/60 border-b border-border px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground select-none shrink-0">
      <div className="flex gap-1.5 opacity-60">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
      </div>
      <div className="flex-1 max-w-md mx-auto bg-background border border-border/80 rounded-md py-1 px-3 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-1.5 min-w-0">
          <Lock size={10} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate tracking-wide">{displayUrl}</span>
        </div>
        <RefreshCw size={10} className="opacity-50 shrink-0 cursor-pointer hover:opacity-100 transition-opacity" />
      </div>
      <div className="w-12" />
    </div>
  );
}

export interface SocialContentPreviewProps {
  type: "video" | "short-video" | "article" | "repo" | "post";
  title: string;
  description?: string;
  thumbnail?: string;
  link: string;
  className?: string;
  authorAvatar?: string;
  authorName?: string;
  date?: string;
  isVerified?: boolean;
}

export function SocialContentPreview({
  type,
  title,
  description,
  thumbnail,
  link,
  className,
  authorAvatar = "/default-avatar.png",
  authorName = "Author",
  date = "now",
  isVerified = false,
}: SocialContentPreviewProps) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "w-full h-[60vh] 2xl:h-[80vh] border border-border rounded-xl flex flex-col items-center justify-between overflow-hidden bg-background shadow-md group transition-all duration-300 hover:border-primary/30",
        className
      )}
    >
      <FakeAddressBar url={link} />

      {/* Главная рабочая область контента */}
      <div className="w-full flex-1 flex items-center justify-center p-6 overflow-hidden min-h-0 relative bg-neutral-950/5 dark:bg-transparent">

        {/* Short Videos (Исправлено выравнивание и пропорции 9:16) */}
        {type === "short-video" && (
          <article className="flex items-center justify-center gap-6 w-full h-full max-h-full py-2">
            <ShortVideo
              title="Ровные сюжеты. Выпуск 1"
              description=""
              video={{
                src: "/videos/socials/short-videos-1.webm"
              }}
              className=""
            />
            <ShortVideo
              title="Ровные новости. Выпуск 1"
              description=""
              video={{
                src: "/videos/socials/short-videos-2.webm"
              }}
              className="hidden lg:block"
            />
            <ShortVideo
              title="Ровные сюжеты. Выпуск 5"
              description=""
              video={{
                src: "/videos/socials/short-videos-3.webm"
              }}
              className="hidden xl:block"
            />
          </article>
        )}

        {/* Long Video (Исправлено под формат 16:9 с сохранением пропорций) */}
        {type === "video" && (
          <article className="w-full h-full max-w-full max-h-full flex items-center justify-center bg-black rounded-lg overflow-hidden border border-border/40 relative aspect-[16/9]">
            <video
              src="/videos/socials/videos.webm"
              className="w-full h-full object-contain bg-black"
              autoPlay
              muted
              loop
              playsInline
              controls
            />
            {/* Оверлей с текстом поверх видео */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-14 pointer-events-none">
              <h3 className="text-lg font-bold text-white line-clamp-1">{title}</h3>
              <p className="mt-1 text-xs text-gray-200 line-clamp-2 max-w-2xl">{description}</p>
            </div>
          </article>
        )}

        {/* Article */}
        {type === "article" && (
          <Card className="mx-auto w-full max-w-xl lg:max-w-2xl shadow-lg border-border flex flex-col max-h-full overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">Articles</p>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto min-h-0">
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              {thumbnail && (
                <div className="rounded-xl overflow-hidden mt-2 border border-border/60">
                  <Image
                    src={thumbnail}
                    alt={title}
                    width={800}
                    height={450}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Repository */}
        {type === "repo" && (
          <Card className="mx-auto w-full max-w-xl lg:max-w-2xl shadow-lg border-border flex flex-col max-h-full overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">Dev</p>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto min-h-0">
              <h3 className="text-display-3 font-bold font-mono">{title}</h3>
              <TerminalStyledInline className="w-full!" />
              <h4 className="text-display-4 font-bold font-mono">File Structure</h4>

            </div>
          </Card>
        )}

        {/* Telegram Post */}
        {type === "post" && (
          <Card className="mx-auto w-full max-w-xl lg:max-w-2xl shadow-lg border-border bg-background flex flex-col max-h-full overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b border-border shrink-0">
              <div className="relative shrink-0 w-9 h-9">
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">{authorName}</span>
                  {isVerified && (
                    <span className="inline-flex items-center justify-center bg-[#0088cc] text-white rounded-full p-0.5 w-3.5 h-3.5 text-[8px] font-bold">✓</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{date}</p>
              </div>
              <div className="ml-auto text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="p-4 space-y-2.5 overflow-y-auto min-h-0">
              <h3 className="text-sm font-semibold">{title}</h3>
              {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
              {thumbnail && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border border-border/60 mt-2">
                  <Image
                    src={thumbnail}
                    alt="Post attachment"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

      </div>
    </Link>
  );
}
