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
  price: {
    from: string,
    avg: string,
  };
}

const services: ServiceType[] = [
  {
    title: "Разработка",
    description: "Сделаем цифровой продукт любой сложности",
    icon: <Box />,
    color: "#3b82f6",
    services: ["Сайты", "MCP", "Мобильные приложения", "Telegram- & Max- боты", "Telegram Mini apps"],
    price: {
      from: "50 000",
      avg: "150 000",
    },
  },
  {
    title: "3D & Motion",
    description: "Сделаем видео любой сложности",
    icon: <Gem />,
    color: "#f59e0b",
    services: ["CGI-графика", "Рекламные ролики", "3D", "Монтаж", "Скейка", "Анимация"],
    price: {
      from: "45 000",
      avg: "100 000",
    },
  },
  {
    title: "Продвижение",
    description: "Сделаем всё, чтобы о вас знали",
    icon: <ChartSpline />,
    color: "#ec4899",
    services: ["Контекстная реклама", "Таргет", "Я.Директ", "SEO", "UX-Аудит", "SMM"],
    price: {
      from: "40 000",
      avg: "70 000",
    },
  },
  {
    title: "Брендинг",
    description: "Сделаем бренд, который будут узнавать",
    icon: <Signature />,
    color: "#a855f7",
    services: ["Логотипы", "Брендбук", "Фирменный стиль", "Айдентика"],
    price: {
      from: "75 000",
      avg: "150 000",
    },
  },

];

export default function ServicesSection() {
  return (
    <section className="pt-6 sm:pt-12 pb-8 sm:pb-18">
      <Container>
        <h2 className="text-display-2 sm:text-display-1 mb-10 text-center">
          Ровные решения<br />
          для развития бизнеса
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
                  background: `radial-gradient(circle at center, ${service.color} 0%, transparent 90%)`
                }}
              />

              <div className="relative z-10">
                {/* Icon Box */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="mb-10 flex size-10 items-center justify-center rounded-lg border border-(--outline) bg-(--card) text-zinc-400 transition-colors group-hover:text-primary"
                  // style={{ color: service.color }}
                  >
                    {service.icon}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <p className="text-(--on-bg-medium) text-body-3">
                      <span className="text-body-5">от</span> {service.price.from} ₽
                    </p>
                    <p className="text-(--on-bg-medium) text-body-3">
                      <span className="text-body-5"><span className="">Ровно:</span> от</span> {service.price.avg} ₽
                    </p>
                  </div>

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