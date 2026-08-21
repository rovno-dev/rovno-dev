"use client";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Box, Gem, ChartSpline, Signature, ArrowUpRight } from "lucide-react";

const services = [
  {
    title: "Разработка",
    description: "Сделаем цифровой продукт любой сложности",
    icon: Box,
    color: "#3b82f6",
    services: ["Сайты", "MCP", "Мобильные приложения", "Telegram- & Max- боты", "Telegram Mini apps"],
    price: { from: "50 000", avg: "150 000" },
  },
  {
    title: "3D & Motion",
    description: "Сделаем видео любой сложности",
    icon: Gem,
    color: "#f59e0b",
    services: ["CGI-графика", "Рекламные ролики", "3D", "Монтаж", "Скейка", "Анимация"],
    price: { from: "45 000", avg: "100 000" },
  },
  {
    title: "Продвижение",
    description: "Сделаем всё, чтобы о вас знали",
    icon: ChartSpline,
    color: "#ec4899",
    services: ["Контекстная реклама", "Таргет", "Я.Директ", "SEO", "UX-Аудит", "SMM"],
    price: { from: "40 000", avg: "70 000" },
  },
  {
    title: "Брендинг",
    description: "Сделаем бренд, который будут узнавать",
    icon: Signature,
    color: "#a855f7",
    services: ["Логотипы", "Брендбук", "Фирменный стиль", "Айдентика"],
    price: { from: "75 000", avg: "150 000" },
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[calc(100dvh-46px)] md:min-h-[calc(100dvh-88px)] flex flex-col bg-black">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/_static/projects/vanguard/vanguard-cover.png"
          alt="Rovno.dev — цифровое агентство полного цикла"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30" />
      </div>

      {/* Content */}
      <Container className="relative z-10 flex flex-col justify-between flex-1 pt-28 pb-8 md:pt-36">
        {/* Top meta row */}
        <div className="flex items-center justify-between animate-reveal">
          <span className="text-body-5 uppercase tracking-[0.3em] text-white/40">Rovno.dev</span>
          <span className="text-body-5 uppercase tracking-[0.3em] text-white/40">2024—2026</span>
        </div>

        {/* Main typography */}
        <div className="mt-auto mb-16">
          <h1 className="font-heading font-bold leading-[0.9] tracking-tight text-white select-none">
            <span className="block text-[14vw] md:text-[9vw] lg:text-[120px]">РАЗРАБОТКА</span>
            <span className="block text-[14vw] md:text-[9vw] lg:text-[120px] text-white/30">ДИЗАЙН</span>
            <span className="block text-[14vw] md:text-[9vw] lg:text-[120px] text-white/60">3D & MOTION</span>
          </h1>
        </div>

        {/* Services strip */}
        <div className="border-t border-white/15 pt-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-body-4 font-semibold uppercase tracking-wider text-white/80">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-body-5 text-white/40 leading-relaxed line-clamp-2 mb-3">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.services.slice(0, 3).map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full border border-white/15 text-white/50">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-body-5 text-white/40">
                    <span className="text-white/70">от {service.price.from} ₽</span> · в среднем {service.price.avg} ₽
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mt-10">
          <Button size="xlarge" shape="round" asChild className="bg-white text-black hover:bg-white/90">
            <Link href="/order">
              Начать проект
              <ArrowUpRight className="size-5!" />
            </Link>
          </Button>
          <span className="hidden md:block text-body-5 text-white/30 max-w-xs text-right">
            Сайты · MCP · Приложения · Боты · Mini apps
          </span>
        </div>
      </Container>
    </section>
  );
}
