"use client";

import { useState, useEffect, useRef, useMemo, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import type { ArticleListItem } from "@/utils/api/articles";

function formatDate(iso: string, lang: string) {
  try {
    return new Date(iso).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function MarqueeText({
  text,
  className,
  style,
  speed = 40,
  gap = 40,
  pause = 2,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  speed?: number;
  gap?: number;
  pause?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMarquee, setIsMarquee] = useState(false);
  const [travel, setTravel] = useState(0);
  const [animName] = useState(
    () => `__mq_${Math.random().toString(36).slice(2, 7)}`
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const probe = probeRef.current;
    if (!wrapper || !probe) return;
    const measure = () => {
      const lh = parseFloat(getComputedStyle(probe).lineHeight);
      const wraps = probe.scrollHeight > Math.ceil(lh) + 2;
      setIsMarquee(wraps);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    measure();
    return () => ro.disconnect();
  }, [text]);

  useEffect(() => {
    if (isMarquee && trackRef.current) {
      const cycleWidth = trackRef.current.scrollWidth / 2;
      setTravel(cycleWidth / speed);
    }
  }, [isMarquee, text, gap, speed]);

  const total = travel + pause;
  const holdPct = total > 0 ? (pause / total) * 100 : 0;
  const trackClass = `mq-track-${animName}`;

  return (
    <div ref={wrapperRef} className="relative min-w-0 flex-1 overflow-hidden">
      <span
        ref={probeRef}
        aria-hidden="true"
        className={className}
        style={{
          ...style,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          visibility: "hidden",
          whiteSpace: "normal",
          pointerEvents: "none",
        }}
      >
        {text}
      </span>
      {isMarquee ? (
        <div className="overflow-hidden pl-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <style>{`
            @keyframes ${animName} {
              0%, ${holdPct}% { transform: translateX(0); }
              100%            { transform: translateX(-50%); }
            }
            .${trackClass} {
              animation: ${animName} ${total}s linear infinite;
              animation-play-state: paused;
            }
            .group:hover .${trackClass} {
              animation-play-state: running;
            }
          `}</style>
          <div
            ref={trackRef}
            className={`${trackClass} flex w-max whitespace-nowrap`}
            style={{ willChange: "transform" }}
          >
            <span className={className} style={style}>
              {text}
            </span>
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: gap, flexShrink: 0 }}
            />
            <span className={className} style={style} aria-hidden="true">
              {text}
            </span>
            <span
              aria-hidden="true"
              style={{ display: "inline-block", width: gap, flexShrink: 0 }}
            />
          </div>
        </div>
      ) : (
        <h3 className={className} style={style}>
          {text}
        </h3>
      )}
    </div>
  );
}

export function ArticleCard({
  article,
  index = 0,
  lang,
}: {
  article: ArticleListItem;
  index?: number;
  lang: string;
}) {
  const [bgColor, setBgColor] = useState<{ r: number; g: number; b: number } | null>(null);

  useEffect(() => {
    if (!article.image_url || article.image_url.endsWith(".webm") || article.image_url.endsWith(".mp4")) {
      setBgColor(null);
      return;
    }
    let isCancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = article.image_url;
    img.onload = () => {
      if (isCancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const sampleHeight = img.naturalHeight * 0.3;
        ctx.drawImage(img, 0, 0, img.naturalWidth, sampleHeight, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count > 0) {
          setBgColor({
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count),
          });
        }
      } catch (err) { }
    };
    return () => {
      isCancelled = true;
    };
  }, [article.image_url]);

  const isLight = useMemo(() => {
    if (!bgColor) return false;
    const luminance = (0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b) / 255;
    return luminance > 0.55;
  }, [bgColor]);

  const gradientStyle = bgColor
    ? { background: `linear-gradient(to bottom, rgba(${bgColor.r},${bgColor.g},${bgColor.b}, 0.95) 0%, rgba(${bgColor.r},${bgColor.g},${bgColor.b}, 0.4) 50%, transparent 100%)` }
    : { background: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" };

  const textColorClass = isLight ? "text-[var(--dark-8)]" : "text-[var(--gray-0)]";
  const shadowClass = isLight ? "drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]" : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]";

  return (
    <Link
      href={`/blog/${article.id}/${article.slug}`}
      className="group block animate-reveal fill-mode-both relative w-full overflow-hidden rounded-3xl border border-(--outline) bg-(--card) transition-all duration-500 hover:border-(--primary)/40 hover:shadow-2xl hover:shadow-(--primary)/5 aspect-[4/3]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {article.image_url ? (
        article.image_url.endsWith(".webm") || article.image_url.endsWith(".mp4") ? (
          <video
            src={article.image_url}
            preload="metadata"
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
          />
        ) : (
          <Image
            fill
            src={article.image_url}
            alt={article.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 50vw"
            quality={90}
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card)" />
      )}

      {/* Top dynamic gradient */}
      <div
        className="absolute inset-x-0 top-0 h-[55%] pointer-events-none z-[1] transition-colors duration-500"
        style={gradientStyle}
      />

      {/* Bottom subtle gradient */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-[1]" />

      {/* Top Section: Title, Description, Date */}
      <div className="absolute inset-x-0 top-0 p-4 md:p-6 z-10 pointer-events-none">
        <div className="flex flex-col max-w-full min-w-0">
          <MarqueeText
            text={article.title}
            className={`text-xl md:text-2xl font-heading  leading-tight tracking-tight ${textColorClass} ${shadowClass}`}
          />
          {article.description && (
            <p className={`mt-2 text-xs md:text-sm leading-snug line-clamp-2 ${isLight ? "text-[var(--dark-8)]/80" : "text-[var(--gray-0)]/80"} ${shadowClass}`}>
              {article.description}
            </p>
          )}
          <p className={`mt-3 text-[11px] font-mono uppercase tracking-wider ${isLight ? "text-[var(--dark-8)]/60" : "text-[var(--gray-0)]/60"} ${shadowClass}`}>
            {formatDate(article.date, lang)}
          </p>
        </div>
      </div>

      {/* Bottom Section: Tags and Arrow */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 z-10 flex items-end justify-between gap-4 pointer-events-none">
        {article.tags && article.tags.length > 0 ? (
          <div className="flex flex-wrap justify-start gap-2 pointer-events-auto min-w-0">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-3 py-1 text-[10px]  uppercase tracking-[0.12em] text-white"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}
        <div
          className={`flex items-center justify-center shrink-0 size-10 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-(--primary) group-hover:text-(--on-primary) group-hover:border-(--primary) ml-auto pointer-events-auto ${isLight
              ? "bg-white text-[var(--dark-8)] border-transparent"
              : "bg-black/20 backdrop-blur-md text-white border border-white/20"
            }`}
        >
          <ArrowUpRightIcon className="size-5" weight="bold" />
        </div>
      </div>
    </Link>
  );
}
