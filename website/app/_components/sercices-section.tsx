"use client";

import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import Link from "next/link";

const AuditIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="size-16 md:size-20">
    <path d="M14 10H38L50 22V54H14V10Z" />
    <path d="M38 10V22H50" />
    <path d="M22 44V36M28 44V28M34 44V32M40 44V24" strokeWidth="1.5" />
    <circle cx="32" cy="34" r="14" fill="var(--bg)" strokeWidth="2" />
    <path d="M42 44L54 56" strokeWidth="3" />
  </svg>
);

const DigitalizationIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="size-16 md:size-20">
    <rect x="16" y="12" width="32" height="12" rx="2" fill="var(--bg)" />
    <circle cx="22" cy="18" r="1.5" fill="currentColor" />
    <circle cx="28" cy="18" r="1.5" fill="currentColor" />
    <path d="M36 18H42" />
    <rect x="16" y="26" width="32" height="12" rx="2" fill="var(--bg)" />
    <circle cx="22" cy="32" r="1.5" fill="currentColor" />
    <circle cx="28" cy="32" r="1.5" fill="currentColor" />
    <path d="M36 32H42" />
    <rect x="16" y="40" width="32" height="12" rx="2" fill="var(--bg)" />
    <circle cx="22" cy="46" r="1.5" fill="currentColor" />
    <circle cx="28" cy="46" r="1.5" fill="currentColor" />
    <path d="M36 46H42" />
    <path d="M8 18H16M48 18H56M8 32H16M48 32H56M8 46H16M48 46H56" strokeWidth="1.5" strokeDasharray="2 2" />
    <path d="M8 18V46M56 18V46" strokeWidth="1" opacity="0.5" />
    <path d="M32 52V58M32 6V12" />
    <circle cx="32" cy="58" r="2" fill="currentColor" />
    <circle cx="32" cy="6" r="2" fill="currentColor" />
  </svg>
);

const StartupIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="size-16 md:size-20">
    <path d="M32 8C32 8 44 18 44 36C44 44 38 52 32 56C26 52 20 44 20 36C20 18 32 8 32 8Z" fill="var(--bg)" />
    <circle cx="32" cy="26" r="6" />
    <circle cx="32" cy="26" r="2.5" fill="currentColor" />
    <path d="M20 36L10 44V52L20 46" />
    <path d="M44 36L54 44V52L44 46" />
    <path d="M26 52L32 60L38 52" />
    <path d="M29 52L32 56L35 52" strokeWidth="1" opacity="0.5" />
    <path d="M14 26H6M14 30H4M50 26H58M50 30H60" strokeWidth="1" opacity="0.5" />
    <path d="M48 12L50 16L54 18L50 20L48 24L46 20L42 18L46 16L48 12Z" fill="currentColor" />
    <path d="M12 16L14 18L16 16L14 14L12 16Z" fill="currentColor" />
    <path d="M54 32L56 34L58 32L56 30L54 32Z" fill="currentColor" />
  </svg>
);

const SERVICES = [
  {
    id: "01",
    title: "Аудит",
    description:
      "Детально проверим инфраструктуру, найдём слабые места и подскажем как действовать дальше. Подготовим детальный план и ТЗ под подходящую технологию и функционал.",
    icon: <AuditIcon />,
  },
  {
    id: "02",
    title: "Цифровизация",
    description:
      "Автоматизируем процессы, разработаем цифровые продукты под нужные задачи и будем заниматься тем, чтобы работа инфраструктуры никогда не останавливалась.",
    icon: <DigitalizationIcon />,
  },
  {
    id: "03",
    title: "Стартап",
    description:
      "Реализуем цифровой продукт, поможем выйграть инвестиционные раунды или просто протестируем идею для вашего стартапа.",
    icon: <StartupIcon />,
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-(--bg) text-(--on-bg-high) py-24 md:py-32 pb-40 md:pb-32">
      <Container>
        <div className="flex flex-col gap-16 md:gap-24">

          {/* Section Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-sans font-medium tracking-[-0.03em] uppercase text-center w-full break-words"
          >
            Услуги
          </motion.h2>

          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-(--outline)">
            {SERVICES.map((service, index) => (
              <Link
                key={service.id}
                href="/order"
                className={`group relative flex flex-col justify-start p-8 md:p-12 lg:p-16 transition-colors duration-500 hover:bg-(--card) focus-visible:bg-(--card) outline-none h-full min-h-[400px] md:min-h-[500px] border-r border-b border-(--outline) ${index === 2 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
              >
                {/* Top Row: Custom Icon + Arrow */}
                <div className="flex justify-between items-start w-full mb-16 md:mb-24 shrink-0">
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    {service.icon}
                  </div>
                  <div className="flex items-center justify-center size-10 md:size-12 rounded-none border border-(--outline) bg-(--bg) group-hover:bg-(--primary) group-hover:border-(--primary) group-hover:text-(--on-primary) transition-all duration-300">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 md:size-5">
                      <path d="M2.5 12.5L12.5 2.5M12.5 2.5H4.5M12.5 2.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Row: Text Content */}
                <div className="mt-auto flex flex-col gap-4">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-sans font-medium tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-(--on-bg-medium) text-base md:text-lg leading-relaxed max-w-md">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}
