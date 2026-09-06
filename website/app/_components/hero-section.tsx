"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { LightbulbIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

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
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBadgeIndex((prev) => (prev + 1) % BADGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-36 pb-36 flex flex-col justify-center overflow-hidden text-(--on-bg-high)">
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
          {/* Auto Carousel with Glass Badges */}
          <div className="pointer-events-none flex justify-center">
            <div key={currentBadgeIndex} className="animate-in fade-in zoom-in-95 duration-500">
              <Badge variant={'tonal-card-static'} size={'chip-xlarge'}>
                {BADGES[currentBadgeIndex]}
              </Badge>
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
