"use client";

import React from "react";
import { Container } from "@/components/ui/container";
import { Box, ChartSpline, Gem, Signature, } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ServiceType = {
  title: string;
  description: string;
  icon: React.JSX.Element;
  color?: string;
  services: string[];
}

const services: ServiceType[] = [
  {
    title: "Разработка",
    description: "Сделаем цифровой продукт любой сложности",
    icon: <Box />,
    // color: "#3b82f6",
    services: ["Сайты", "MCP", "Мобильные приложения", "Telegram- & Max- боты", "Telegram Mini apps"]
  },
  {
    title: "3D & Motion",
    description: "Сделаем видео любой сложности",
    icon: <Gem />,
    // color: "#f59e0b",
    services: ["CGI-графика", "Рекламные ролики", "3D", "Монтаж", "Скейка", "Анимация"]
  },
  {
    title: "Продвижение",
    description: "Сделаем всё, чтобы о вас знали",
    icon: <ChartSpline />,
    // color: "#ec4899",
    services: ["Контекстная реклама", "Таргет", "Я.Директ", "SEO", "UX-Аудит", "SMM"]
  },
  {
    title: "Брендинг",
    description: "Сделаем бренд, который будут узнавать",
    icon: <Signature />,
    // color: "#a855f7",
    services: ["Логотипы", "Брендбук", "Фирменный стиль", "Айдентика"]
  },

];

export default function ServicesSection() {
  return (
    <section className="pt-2 sm:pt-4 pb-8 sm:pb-18">
      <Container className="pt-6 sm:pt-14">
        <h2 className="text-display-1 mb-10 text-center">
          Наши услуги
        </h2>

        {/* The Grid: Perfectly flush 1px internal dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group relative p-8 transition-colors hover:bg-(--primary-glass) lg:p-6 border-(--outline)
                /* Mobile: Bottom borders everywhere except the last item */
                border-b last:border-b-0
                /* Desktop: Reset mobile layout borders */
                md:border-b-0 md:last:border-b-0 lg:border-r lg:last:border-r-0
                /* Desktop: Add vertical divider after the first item in each row */
                md:[&:nth-child(odd)]:border-r
                /* Desktop: Add horizontal divider under the first row items */
                md:[&:nth-child(-n+2)]:border-b lg:border-b-0!"
            >
              {/* Subtle background glow effect on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
                style={{
                  background: `radial-gradient(circle at center, ${service.color} 0%, transparent 70%)`
                }}
              />

              <div className="relative z-10">
                {/* Icon Box */}
                <div
                  className="mb-6 flex size-10 items-center justify-center rounded-lg border border-(--outline) bg-(--card) text-zinc-400 transition-colors group-hover:text-primary"
                  style={{ color: service.color }}
                >
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-(--on-bg-medium)">
                  {service.title}
                </h3>
                <p className="mb-8 text-sm leading-relaxed text-(--on-bg-low)">
                  {service.description}
                </p>

                {/* Tech services Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {service.services.map((tech) => (
                    <Badge
                      size={'chip-small'}
                      variant={'glass-static'}
                      key={tech}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}