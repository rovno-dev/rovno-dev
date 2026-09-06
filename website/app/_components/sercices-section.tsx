"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Box, Gem, ChartSpline, Signature, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PROJECTS, type Project } from "@/app/_data/projects";

// Маппинг услуг к списку проектов
const serviceToProjectSlugs: Record<string, string[]> = {
  "Разработка": ["vanguard", "sadovod", "courtElegance", "concord"],
  "3D & Motion": ["alx", "bread", "concord"],
  "Продвижение": ["vanguard", "sadovod", "concord"],
  "Брендинг": ["alx", "bread"],
};

const services = [
  {
    title: "Разработку",
    description: "Сделаем цифровой продукт любой сложности",
    icon: Box,
    color: "#3b82f6",
    services: ["Сайты", "MCP", "Мобильные приложения", "Telegram- & Max- боты", "Telegram Mini apps"],
    price: { from: "75 000", avg: "250 000" },
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

// Получение последнего проекта для услуги
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

export default function ServicesSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", containScroll: "trimSnaps" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const hasInteracted = useRef(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    // Reset progress on slide change
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay logic
  useEffect(() => {
    if (hasInteracted.current) return;
    const startAutoplay = () => {
      autoPlayTimer.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            emblaApi?.scrollNext();
            return 0;
          }
          return prev + 1;
        });
      }, 60); // ~6 seconds total (100 * 60ms = 6000ms)
    };
    startAutoplay();
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [emblaApi]);

  const handleInteraction = () => {
    hasInteracted.current = true;
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
  };

  const currentService = services[selectedIndex];
  const currentProject = getLatestProjectForService(currentService.title);
  const Icon = currentService.icon;

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden text-on-bg-high">
      {/* <Link
        href={`/projects/${currentProject.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
      >
        <span className="text-sm font-medium text-white">Открыть кейс</span>
        <ArrowUpRight className="size-4 text-white" />
      </Link> */}

      <div className="relative z-10 flex flex-col justify-between min-h-full">
        <Container className="h-full">
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="h-full">
              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-4">
                    Мы делаем...
                  </p>
                  <h1 className="text-display-1 text-[2rem] sm:text-[2.75rem] lg:text-[4rem] mb-6">
                    {currentService.title}
                  </h1>
                  {/* <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-6">
                    {currentService.description}
                  </p> */}

                  <div className="mb-6 overflow-x-scroll no-scrollbar">
                    <div className="flex flex-nowrap gap-2 marquee-badges">
                      {currentService.services.map((s) => (
                        <span
                          key={s}
                          className="text-sm px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/80 whitespace-nowrap"
                        >
                          {s}
                        </span>
                      ))}
                      {/* Дублируем для бесшовного цикла на мобильном */}
                      {currentService.services.map((s) => (
                        <span
                          key={`${s}-dup`}
                          className="hidden md:hidden text-sm px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/80 whitespace-nowrap"
                          aria-hidden="true"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Цены – колонкой на мобильном, в ряд на десктопе */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-white/60 mb-8">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase text-white/40">от</span>
                      <span className="text-3xl font-semibold text-white">{currentService.price.from} ₽</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase text-white/40">Rovno от:</span>
                      <span className="text-3xl font-semibold text-white">{currentService.price.avg} ₽</span>
                    </div>
                  </div>
                </div>
                {/* Карусель внизу – маленькие превью услуг */}
                <div className="w-full mt-auto">
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex gap-4">
                      {services.map((service, index) => {
                        const ServiceIcon = service.icon;
                        const project = getLatestProjectForService(service.title);
                        const isActive = index === selectedIndex;
                        return (
                          <button
                            key={service.title}
                            onClick={() => {
                              emblaApi?.scrollTo(index);
                              handleInteraction();
                            }}
                            onPointerDown={handleInteraction}
                            className={`group flex flex-col items-start gap-2 rounded-2xl border transition-all duration-300 w-40 md:w-48 flex-shrink-0 
                              ${isActive
                                ? "border-primary bg-primary-glass"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                              }`}
                          >
                            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                              <Image
                                src={project.cover.imageSrc}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="px-4 py-3 w-full">
                              <div className="flex items-center gap-2">
                                <ServiceIcon className="size-4 text-white/70" />
                                <span className="text-sm font-medium text-white/90">{service.title}</span>
                              </div>
                              <div className={`mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden
                                ${isActive
                                  ? ""
                                  : "hidden"
                                }`}
                              >
                                <div
                                  className={`h-full bg-white/50 transition-all duration-100`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="hidden sm:flex">
              <Image
                src={currentProject.cover.imageSrc}
                alt={currentProject.title}
                width={1200}
                height={900}
                className="object-cover rounded-2xl"
                priority
              />
            </div>
          </div>
        </Container>
      </div >
    </section >
  );
}
