"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { LightbulbIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const BADGES = [
  "Сайты",
  "Приложения",
  "Дизайны",
  "Рекламы",
  "Видео",
  "3D-модели",
  "Логотипы",
  "Брендинги",
  "Решения",
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-advance with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        // Jump back to the start of the second copy to keep sliding
        if (prev === BADGES.length * 3 - 1) return BADGES.length;
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Calculate translate offset to center the active badge
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const badgeWidth = 200; // fixed width for all badges
    const gap = 16; // gap-4 = 1rem = 16px
    const totalOffset = index * (badgeWidth + gap);
    const centerOffset = container.offsetWidth / 2 - badgeWidth / 2;
    setOffset(centerOffset - totalOffset);
  }, [index]);

  const activeIndex = index % BADGES.length;

  return (
    <section className="relative py-36 flex flex-col justify-center overflow-hidden text-(--on-bg-high)">
      {/* Subtle radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, var(--primary-glass), transparent 60%)" }}
      />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-center text-[2.5rem] sm:text-[4rem] lg:text-[5.5rem] font-heading font-bold leading-[1.05] tracking-tighter mb-8">
            Cамые{" "}<span className="marker-highlight"> ровные:</span>{" "}
          </h1>

          {/* Infinite Carousel with visible neighbors */}
          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
          >
            <div
              className="flex gap-4 transition-transform duration-700 ease-out"
              style={{ transform: `translateX(${offset}px)` }}
            >
              {[...BADGES, ...BADGES, ...BADGES].map((badge, idx) => {
                const isActive = idx % BADGES.length === activeIndex;
                return (
                  <div key={idx} className="shrink-0 w-[200px] flex justify-center items-center h-[72px]">
                    <Badge
                      variant={isActive ? "tonal-card-static" : 'outlined-static'}
                      size={'chip-xlarge'}
                      className={cn(
                        'w-full justify-center transition-all duration-500 rounded-xl',
                        isActive ? "h-full" : ""
                      )}
                    >
                      {badge}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10 justify-center">
            <Button size="large" asChild>
              <Link href={ROUTES.order.href}>
                <LightbulbIcon />
                Оформить заказ
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section >
  );
}
