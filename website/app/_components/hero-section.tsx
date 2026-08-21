"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Box, Gem, ChartSpline, Signature, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/app/_data/projects";

// Маппинг услуг к списку проектов (можно расширить)
const serviceToProjectSlugs: Record<string, string[]> = {
  "Разработка": ["vanguard", "sadovod", "courtElegance", "concord"],
  "3D & Motion": ["alx", "bread", "concord"],
  "Продвижение": ["vanguard", "sadovod", "concord"],
  "Брендинг": ["alx", "bread"],
};

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

// Функция для получения последнего проекта (по периоду) для услуги
function getLatestProjectForService(serviceTitle: string): Project {
  const slugs = serviceToProjectSlugs[serviceTitle] || [];
  const candidates = slugs
    .map((slug) => PROJECTS[slug])
    .filter(Boolean)
    .sort((a, b) => {
      const yearA = parseInt(a.period || "0", 10);
      const yearB = parseInt(b.period || "0", 10);
      return yearB - yearA;
    });
  return candidates[0] || PROJECTS.vanguard;
}

export default function HeroSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Данные для текущей услуги
  const currentService = services[selectedIndex];
  const currentProject = getLatestProjectForService(currentService.title);
  const Icon = currentService.icon;

  return (
    <section className="relative min-h-[calc(100dvh-46px)] md:min-h-[calc(100dvh-88px)] overflow-hidden bg-black text-white">
      {/* Фон – обложка последнего проекта текущей услуги */}
      <div className="absolute inset-0 z-0 transition-opacity duration-700">
        <Image
          src={currentProject.cover.imageSrc}
          alt={currentProject.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/60" />
      </div>

      {/* Контент */}
      <div className="relative z-10 flex flex-col justify-between min-h-full pt-28 md:pt-36 pb-10">
        <Container>
          {/* Верхняя строка */}
          <div className="flex items-center justify-between animate-reveal mb-12">
            <span className="text-body-5 uppercase tracking-[0.3em] text-white/40">Rovno.dev</span>
            <span className="text-body-5 uppercase tracking-[0.3em] text-white/40">2024—2026</span>
          </div>

          {/* Гигантская типографика – название текущей услуги */}
          <h1 className="font-heading font-bold leading-[0.9] tracking-tight select-none mb-6">
            <span className="block text-[15vw] md:text-[10vw] lg:text-[140px] uppercase">
              {currentService.title}
            </span>
          </h1>

          {/* Описание услуги */}
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-8">
            {currentService.description}
          </p>

          {/* Список под-услуг текущей услуги */}
          <div className="flex flex-wrap gap-2 mb-8">
            {currentService.services.map((s) => (
              <span key={s} className="text-sm px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/80">
                {s}
              </span>
            ))}
          </div>

          {/* Цена */}
          <div className="flex items-center gap-6 text-white/60">
            <div>
              <span className="text-xs uppercase text-white/40">от</span>
              <span className="text-2xl font-semibold text-white">{currentService.price.from} ₽</span>
            </div>
            <div>
              <span className="text-xs uppercase text-white/40">в среднем</span>
              <span className="text-2xl font-semibold text-white">{currentService.price.avg} ₽</span>
            </div>
          </div>
        </Container>

        {/* Карусель внизу – маленькие превью услуг */}
        <div className="w-full mt-8">
          <Container>
            <div className="flex gap-4">
              {services.map((service, index) => {
                const serviceIcon = service.icon;
                const project = getLatestProjectForService(service.title);
                const isActive = index === selectedIndex;
                return (
                  <button
                    key={service.title}
                    onClick={() => setSelectedIndex(index)}
                    className={`group flex flex-col items-start gap-2 p-3 rounded-2xl border transition-all duration-300 w-40 md:w-48 flex-shrink-0 ${isActive
                      ? "border-white/40 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                  >
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={project.cover.imageSrc}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Signature className="size-4 text-white/70" />
                      <span className="text-sm font-medium text-white/90">{service.title}</span>
                    </div>
                    <p className="text-xs text-white/40 line-clamp-2">{service.description}</p>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between mt-6">
              <Button size="large" shape="round" asChild className="bg-white text-black hover:bg-white/90">
                <Link href="/order">
                  Обсудить проект
                  <ArrowUpRight className="size-5!" />
                </Link>
              </Button>
              <Link
                href={`/projects/${currentProject.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4"
              >
                Открыть кейс: {currentProject.title}
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
}
