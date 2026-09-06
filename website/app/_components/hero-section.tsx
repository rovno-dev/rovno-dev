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

const ITEM_WIDTH = 550;
const ITEM_GAP = 48;

export default function HeroSection() {
  const { t, lang } = useLanguage();

  // Start exactly at the middle set for effortless infinite loops
  const [index, setIndex] = useState(BADGES.length);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Triple the list memoized to protect execution contexts
  const extendedBadges = useMemo(() => [...BADGES, ...BADGES, ...BADGES], []);
  const activeBadge = BADGES[index % BADGES.length];

  // 2. Automated Infinite Carousel Tick Tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        // Reset position seamlessly before hitting edge boundaries
        if (prev >= BADGES.length * 2 - 1) return BADGES.length;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 3. Performance Safe Viewport Resizing Observer (Eliminates layout thrashing)
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

  // 4. Pure CSS Math Offset Computation
  const transformX = useMemo(() => {
    if (!containerWidth) return 0;
    const totalOffset = index * (ITEM_WIDTH + ITEM_GAP);
    const centerOffset = containerWidth / 2 - ITEM_WIDTH / 2;
    return centerOffset - totalOffset;
  }, [index, containerWidth]);

  return (
    <section className="relative min-h-[85vh] py-36 flex flex-col justify-center overflow-hidden text-(--on-bg-high)">

      {/* OPTIMIZATION #1: Single Context Video Element Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {activeBadge.video && (
          <video
            key={activeBadge.video} // Forces safe frame cleanup between asset switching
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
          <h1 className="text-center text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-heading font-bold leading-[1.05] tracking-tighter mb-6 select-none">
            {t("hero.title.part1")} <span className="marker-highlight">{t("hero.title.part2")}</span>
          </h1>

          {/* Carousel Viewport Box Container */}
          <div
            ref={containerRef}
            className={cn(
              "relative overflow-hidden py-6 transition-opacity duration-300",
              isReady ? "opacity-100" : "opacity-0"
            )}
            style={{ maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)" }}
          >
            <div
              className="flex transition-transform duration-700 ease-out will-change-transform"
              style={{
                gap: `${ITEM_GAP}px`,
                transform: `translateX(${transformX}px)`
              }}
            >
              {extendedBadges.map((item, idx) => {
                const isActive = idx === index;
                return (
                  <div
                    key={`${item.label.en}-${idx}`}
                    style={{ width: `${ITEM_WIDTH}px` }}
                    className={cn(
                      "shrink-0 h-[160px] flex items-center justify-center transition-all duration-700 select-none",
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
