"use client";
import { Eye, Clock, CalendarCheck } from "@phosphor-icons/react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

function extractTextFromTiptap(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.content) return node.content.map(extractTextFromTiptap).join(" ");
  return "";
}

function calculateReadTime(content: any): number {
  if (!content) return 1;
  let text = "";
  if (typeof content === "string") {
    text = content;
  } else if (content.content) {
    text = extractTextFromTiptap(content);
  }
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return 1;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function useSessionViews(slug: string) {
  const [views, setViews] = useState(0);
  useEffect(() => {
    const key = `view_count_${slug}`;
    const sessionKey = `viewed_${slug}`;
    const baseViews = 150 + (slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 450);
    let stored = localStorage.getItem(key);
    let currentViews = stored ? parseInt(stored, 10) : baseViews;
    if (!sessionStorage.getItem(sessionKey)) {
      currentViews += 1;
      localStorage.setItem(key, currentViews.toString());
      sessionStorage.setItem(sessionKey, "true");
    }
    setViews(currentViews);
  }, [slug]);
  return views;
}

export function ContentMeta({
  slug,
  content,
  updatedAt,
  imageUrl,
  className,
}: {
  slug: string;
  content: any;
  updatedAt: string;
  imageUrl?: string;
  className?: string;
}) {
  const views = useSessionViews(slug);
  const readTime = calculateReadTime(content);
  const formattedDate = new Date(updatedAt).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [bgColor, setBgColor] = useState<{ r: number; g: number; b: number } | null>(null);

  // Auto-contrast logic based on the provided image
  useEffect(() => {
    if (!imageUrl) return;
    let isCancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Sample the bottom area where the pill is located
        ctx.drawImage(img, 0, img.naturalHeight * 0.6, img.naturalWidth, img.naturalHeight * 0.4, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
        if (count > 0) {
          setBgColor({
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count),
          });
        }
      } catch (err) {}
    };
    return () => { isCancelled = true; };
  }, [imageUrl]);

  const isLight = useMemo(() => {
    if (!bgColor) return false; // Default to white text if no image
    const luminance = (0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b) / 255;
    return luminance > 0.55;
  }, [bgColor]);

  const textColor = isLight ? "text-[var(--dark-8)]" : "text-white";
  const subTextColor = isLight ? "text-[var(--dark-8)]/60" : "text-white/50";
  const iconBg = isLight ? "bg-black/5" : "bg-black/20";
  const iconColor = isLight ? "text-[var(--dark-8)]/70" : "text-white/70";

  return (
    <div
      className={cn(
        "flex flex-wrap justify-between h-full items-center gap-4 px-4 py-3 bg-[linear-gradient(154deg,rgba(255,255,255,0.10)_8.21%,rgba(255,255,255,0.06)_53.6%,rgba(255,255,255,0.10)_102.77%)] rounded-2xl shadow-[0_10.68px_64.08px_0_rgba(0,0,0,0.25)] backdrop-blur-[5.340000152587891px] border border-[#666666]/50 w-full max-w-[800px] mx-auto mt-8",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center justify-center size-10 rounded-xl", iconBg, iconColor)}>
          <Eye className="size-5" weight="duotone" />
        </div>
        <div className="flex flex-col">
          <span className={cn("text-[10px] uppercase tracking-wider font-semibold", subTextColor)}>
            Total Views
          </span>
          <span className={cn("text-lg font-semibold leading-none tabular-nums", textColor)}>
            {views}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("flex items-center justify-center size-10 rounded-xl", iconBg, iconColor)}>
          <Clock className="size-5" weight="duotone" />
        </div>
        <div className="flex flex-col">
          <span className={cn("text-[10px] uppercase tracking-wider font-semibold", subTextColor)}>
            Read Time
          </span>
          <span className={cn("text-lg font-semibold leading-none", textColor)}>
            {readTime} min read
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("flex items-center justify-center size-10 rounded-xl", iconBg, iconColor)}>
          <CalendarCheck className="size-5" weight="duotone" />
        </div>
        <div className="flex flex-col">
          <span className={cn("text-[10px] uppercase tracking-wider font-semibold", subTextColor)}>
            Updated On
          </span>
          <span className={cn("text-lg font-semibold leading-none tabular-nums", textColor)}>
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
