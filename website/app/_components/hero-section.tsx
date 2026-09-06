"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { LightbulbIcon } from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Badges with localized backdrop looping assets
const BADGES = [
  { label: "Сайты", video: "/videos/alabuga.webm" },
  { label: "Приложения", video: "/videos/hero-video.webm" },
  { label: "Дизайны", video: "/videos/innopolis.webm" },
  { label: "Рекламы", video: "/videos/it-park.webm" },
  { label: "Видео", video: "/videos/alabuga.webm" },
  { label: "3D-модели", video: "/videos/hero-video.webm" },
  { label: "Логотипы", video: "/videos/it-park.webm" },
  { label: "Брендинги", video: "/videos/innopolis.webm" },
  { label: "Решения", video: "/videos/hero-video.webm" },
];

export default function HeroSection() {
  const [index, setIndex] = useState(BADGES.length);
  const [offset, setOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth infinite slider progression
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev === BADGES.length * 3 - 1) return BADGES.length;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute exact center tracking positions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // These values control the massive width of each text column unit
    const blockWidth = 550;
    const gap = 48; // gap-12
    const totalOffset = index * (blockWidth + gap);
    const centerOffset = container.offsetWidth / 2 - blockWidth / 2;

    setOffset(centerOffset - totalOffset);

    const timeout = setTimeout(() => setIsReady(true), 60);
    return () => clearTimeout(timeout);
  }, [index]);

  const activeIndex = index % BADGES.length;
  const extendedBadges = [...BADGES, ...BADGES, ...BADGES];

  const handleVideoLoad = (idx: number) => {
    setLoadedVideos((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <section className="relative min-h-[85vh] py-36 flex flex-col justify-center overflow-hidden text-(--on-bg-high)">

      {/* BACKGROUND VIDEOS LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {extendedBadges.map((item, idx) => {
          const isActive = idx % BADGES.length === activeIndex;
          const isVideoLoaded = loadedVideos[idx];

          return (
            item.video && (
              <video
                key={`bg-video-${idx}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out",
                  isActive && isVideoLoaded ? "opacity-100" : "opacity-0"
                )}
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => handleVideoLoad(idx)}
              >
                <source src={item.video} type="video/mp4" />
              </video>
            )
          );
        })}
        {/* Contrast Overlay & Decorative Radial Glow */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top, var(--primary-glass), transparent 75%)" }}
        />
      </div>

      {/* FOREGROUND CONTENT */}
      <Container className="relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-heading font-bold leading-[1.05] tracking-tighter mb-6 select-none">
            Самые <span className="marker-highlight">ровные:</span>
          </h1>

          {/* Giant Text Horizontal Track */}
          <div
            ref={containerRef}
            className={cn(
              "relative overflow-hidden py-6 transition-opacity duration-300",
              isReady ? "opacity-100" : "opacity-0"
            )}
            style={{ maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}
          >
            <div
              className="flex gap-12 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${offset}px)` }}
            >
              {extendedBadges.map((item, idx) => {
                const isActive = idx % BADGES.length === activeIndex;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "shrink-0 w-[550px] h-[160px] flex items-center justify-center transition-all duration-700 select-none",
                      isActive
                        ? "text-white scale-110 opacity-100 drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
                        : "text-white/20 scale-90 blur-[1px]"
                    )}
                  >
                    {/* High-impact filling font template */}
                    <svg
                      viewBox="0 0 500 120"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="central"
                        textAnchor="middle"
                        fontSize="95"
                        fontWeight="900"
                        textLength="480"
                        lengthAdjust="spacingAndGlyphs"
                        className="fill-current font-heading uppercase tracking-tighter"
                      >
                        {item.label}
                      </text>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-12 justify-center">
            <Button size="large" className="w-[288px] h-14 text-lg shadow-xl relative z-20" asChild>
              <Link href={ROUTES.order.href}>
                <LightbulbIcon className="w-5 h-5" />
                Оформить заказ
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
