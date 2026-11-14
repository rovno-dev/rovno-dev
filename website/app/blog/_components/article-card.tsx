"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const isVideo =
    article.image_url?.endsWith(".webm") || article.image_url?.endsWith(".mp4");

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block animate-reveal fill-mode-both relative w-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image: 4:3, no rounding, no border. Text lives below it. */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-(--card)">
        {article.image_url ? (
          isVideo ? (
            <video
              src={article.image_url}
              preload="metadata"
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              onMouseEnter={(e) => e.currentTarget.play().catch(() => { })}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
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
      </div>

      {/* Text block under the image */}
      <div className="pt-4 md:pt-5">
        <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-(--on-bg-low)">
          {formatDate(article.date, lang)}
        </p>

        <MarqueeText
          text={article.title}
          className="text-xl md:text-2xl lg:text-3xl text-(--on-bg-medium) leading-[1.15] tracking-tight font-heading"
        />

        {article.description && (
          <p className="mt-2 text-sm md:text-body-4 text-(--on-bg-medium) leading-relaxed line-clamp-2">
            {article.description}
          </p>
        )}
      </div>
    </Link>
  );
}
