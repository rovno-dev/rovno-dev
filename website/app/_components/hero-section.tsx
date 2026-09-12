"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { LightbulbIcon } from "@phosphor-icons/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

const BADGES = [
  { label: { ru: "Сайты", en: "Websites" }, video: "/videos/hero/websites.webm" },
  { label: { ru: "Приложения", en: "Apps" }, video: "/videos/hero/apps.webm" },
  { label: { ru: "Дизайны", en: "Designs" }, video: "/videos/hero/designs.webm" },
  { label: { ru: "Рекламы", en: "ADs" }, video: "/videos/hero/ads.webm" },
  { label: { ru: "Видео", en: "Videos" }, video: "/videos/hero/videos.webm" },
  { label: { ru: "3D-модели", en: "3D models" }, video: "/videos/hero/3d-models.webm" },
  { label: { ru: "Логотипы", en: "Logos" }, video: "/videos/hero/logos.webm" },
  { label: { ru: "Брендинги", en: "Brandings" }, video: "/videos/hero/brandings.webm" },
  { label: { ru: "Решения", en: "Solutions" }, video: "/videos/hero/solutions.webm" }
];

export default function HeroSection() {
  const { t, lang } = useLanguage();

  const [index, setIndex] = useState(BADGES.length);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const extendedBadges = useMemo(() => [...BADGES, ...BADGES, ...BADGES], []);
  const activeBadge = BADGES[index % BADGES.length];

  // 1. Dynamic Sizing based on available screen space
  const isMobile = containerWidth < 640;
  const itemWidth = isMobile ? Math.min(300, containerWidth - 48) : 550;
  const itemGap = isMobile ? 24 : 48;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= BADGES.length * 2 - 1) return BADGES.length;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setContainerWidth(container.clientWidth);
    setIsReady(true);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 2. Center offset math recalculated dynamically using responsive parameters
  const transformX = useMemo(() => {
    if (!containerWidth) return 0;
    const totalOffset = index * (itemWidth + itemGap);
    const centerOffset = containerWidth / 2 - itemWidth / 2;
    return centerOffset - totalOffset;
  }, [index, containerWidth, itemWidth, itemGap]);

  return (
    <section className="relative pt-30 pb-20 sm:pt-36 pb-24 flex flex-col justify-center overflow-hidden text-(--on-bg-high)">

      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {activeBadge.video && (
          <video
            key={activeBadge.video}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={activeBadge.video} type="video/webm" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at top, var(--primary-glass), transparent 75%)" }}
        />
      </div>

      <Container className="relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-center text-white text-[2rem] sm:text-[4rem] lg:text-[5.5rem] font-heading font-bold leading-[1.05] tracking-tighter mb-6 select-none px-4">
            {t("hero.title.part1")} <span className="marker-highlight">{t("hero.title.part2")}</span>
          </h1>

          {/* Carousel Viewport Box Container */}
          <div
            ref={containerRef}
            className={cn(
              "relative overflow-hidden py-4 sm:py-6 transition-opacity duration-300",
              isReady ? "opacity-100" : "opacity-0"
            )}
            style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}
          >
            <div
              className="flex transition-transform duration-700 ease-out will-change-transform"
              style={{
                gap: `${itemGap}px`,
                transform: `translateX(${transformX}px)`
              }}
            >
              {extendedBadges.map((item, idx) => {
                const isActive = idx === index;
                return (
                  <div
                    key={`${item.label.en}-${idx}`}
                    style={{ width: `${itemWidth}px` }}
                    className={cn(
                      "shrink-0 h-[80px] sm:h-[160px] flex items-center justify-center transition-all duration-700 select-none",
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

          <div className="flex flex-wrap gap-4 mt-4 sm:mt-4 justify-center px-4">
            <Button size="large" className="w-full max-w-[288px] h-14 text-lg shadow-xl relative z-20" asChild>
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
