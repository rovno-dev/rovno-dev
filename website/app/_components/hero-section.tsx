"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { LightbulbIcon } from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

const BADGES = [
  { label: { ru: "Сайты", en: "Websites" }, video: "/videos/websites.webm" },
  { label: { ru: "Приложения", en: "Apps" }, video: "/videos/apps.webm" },
  { label: { ru: "Дизайны", en: "Designs" }, video: "/videos/designs.webm" },
  { label: { ru: "Рекламы", en: "ADs" }, video: "/videos/ads.webm" },
  { label: { ru: "Видео", en: "Videos" }, video: "/videos/videos.webm" },
  { label: { ru: "3D-модели", en: "3D models" }, video: "/videos/3d-models.webm" },
  { label: { ru: "Логотипы", en: "Logos" }, video: "/videos/logos.webm" },
  { label: { ru: "Брендинги", en: "Brandings" }, video: "/videos/brandings.webm" },
  { label: { ru: "Решения", en: "Solutions" }, video: "/videos/solutions.webm" }
];


export default function HeroSection() {
  const { t, lang } = useLanguage();
  const [index, setIndex] = useState(BADGES.length);
  const [offset, setOffset] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev === BADGES.length * 3 - 1) return BADGES.length;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const blockWidth = 550;
    const gap = 48;
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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top, var(--primary-glass), transparent 75%)" }}
        />
      </div>
      <Container className="relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-heading font-bold leading-[1.05] tracking-tighter mb-6 select-none">
            {t("hero.title.part1")} <span className="marker-highlight">{t("hero.title.part2")}</span>
          </h1>
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
                        {item.label[lang]}
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
                {t("hero.order")}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
