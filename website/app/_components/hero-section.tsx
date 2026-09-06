"use client";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";
import { LightbulbIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

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
          {/* Auto Carousel with Glass Badges */}
          <div className="pointer-events-none">
            <div className="flex w-max animate-marquee gap-4 pl-4">
              {[...BADGES, ...BADGES].map((badge, idx) => (
                <Badge variant={'glass-static'} size={'chip-xlarge'}>
                  {badge}
                </Badge>
              ))}
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
