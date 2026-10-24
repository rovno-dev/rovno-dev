"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRight, ArrowLeft, FlowerLotus, Sparkle, Heart, ShoppingBag, ChartLineUp, TelegramLogo } from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { useEffect } from "react";
import { motion } from "motion/react";
import type { CustomPageContext } from "../custom-pages";
import { CveteyaLogo } from "./cveteya-logo";
import { TelegramLogotypeMonoIcon } from "@/components/icons";
import { MaxLogoIcon } from "@/components/icons/logotypes/max-logo-icon";

const ACCENT_PINK = "#E94E77";
const TEXT_DARK = "#2C2A29";
const TEXT_MUTED = "#7A7571";

function GlassButton({ href, children, variant = "light" }: { href: string, children: React.ReactNode, variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all duration-300 overflow-hidden ${isDark
        ? "bg-[#2C2A29]/90 text-white border border-white/10 shadow-[0_8px_32px_rgba(44,42,41,0.2)] hover:bg-[#2C2A29]"
        : "bg-white/40 backdrop-blur-md text-[#2C2A29] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:bg-white/60"
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Link>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[32px] p-8 md:p-10 relative overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      {children}
    </div>
  );
}

export function CveteyaProjectPage({ project, content }: { project: CustomPageContext, content: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const originalClass = html.className;

    html.classList.remove("dark");
    html.classList.add("light");

    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#FCFAF8";

    return () => {
      html.className = originalClass;
      document.body.style.backgroundColor = originalBg;
    };
  }, []);


  // Simulating incoming notifications
  const notifications = [
    { id: 1, app: "Telegram", text: "Скидка ждет вас!", time: "9:41 AM", icon: "telegram" },
    { id: 2, app: "MAX", text: "Новый промокод внутри", time: "9:41 AM", icon: "max" },
    { id: 3, app: "Telegram", text: "Секретный бонус активирован", time: "9:41 AM", icon: "telegram" },
  ];

  return (
    <main className="min-h-screen bg-[#FCFAF8] text-[#2C2A29] font-sans selection:bg-[#F2C6D4] selection:text-[#2C2A29] overflow-x-clip relative">

      {/* Background Ambient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#F2C6D4]/40 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#B2D8C6]/40 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#E6DAC9]/50 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10">
        {/* ──────────────── HERO ──────────────── */}
        <section className="relative min-h-[95dvh] flex flex-col justify-center items-center pt-32 pb-20">
          <Container className="text-center relative z-10 flex flex-col items-center">

            <ScrollReveal threshold={0.01} className="flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-sm font-medium mb-8 text-[#2C2A29]">
                <Sparkle className="text-[#F2C6D4]" weight="fill" />
                <span>Кейс · 2026</span>
              </div>

              {/* SVG Logo */}
              <CveteyaLogo className="w-full h-auto" />

              <p className="text-lg md:text-2xl text-[#7A7571] max-w-2xl mx-auto leading-relaxed mb-12 font-light">
                {project.description || "Цифровой опыт для современного цветочного бутика. E-commerce, арт-дирекшн и жидкие интеракции."}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                {project.href && (
                  <GlassButton href={project.href}>
                    <span>Смотреть сайт</span>
                    <ArrowUpRight weight="bold" />
                  </GlassButton>
                )}
                <GlassButton href="#gallery" variant="dark">
                  <span>Смотреть галерею</span>
                </GlassButton>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200} threshold={0.01} className="w-full max-w-[1000px] mt-20">
              <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl border border-white/50">
                <Image
                  src={project.coverImage || "/static-images/projects/cveteya/cveteya-cover.png"}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-4 md:p-6 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-[#F2C6D4] flex items-center justify-center">
                    <FlowerLotus className="w-6 h-6 text-[#2C2A29]" weight="fill" />
                  </div>
                  <div className="text-left">
                    <p className="font-serif text-lg md:text-xl font-medium text-[#2C2A29]">Bloom & Grow</p>
                    <p className="text-xs md:text-sm text-[#7A7571]">Брендинг и веб-сайт</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* ──────────────── BENTO / FEATURES (4 CARDS) ──────────────── */}
        <section className="py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#B2D8C6] mb-3">Что мы сделали</p>
                  <h2 className="text-4xl md:text-5xl font-serif text-[#2C2A29] leading-tight">
                    Дизайн, который дышит.
                  </h2>
                </div>
                <p className="max-w-md text-[#7A7571] leading-relaxed">
                  Мы заменили традиционную жесткую сетку на плавные, органичные макеты, которые позволяют цветам быть главными героями.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <ScrollReveal delay={0}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#F2C6D4]/50 flex items-center justify-center mb-6 border border-white/50">
                    <ShoppingBag className="w-7 h-7 text-[#2C2A29]" weight="bold" />
                  </div>
                  <h3 className="text-xl font-serif mb-3">E-commerce</h3>
                  <p className="text-[#7A7571] text-sm leading-relaxed flex-1">
                    Бесшовный процесс оформления заказа, как в физическом бутике. Мягкий онбординг, четкие карточки товаров и удобная корзина.
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#B2D8C6]/50 flex items-center justify-center mb-6 border border-white/50">
                    <Heart className="w-7 h-7 text-[#2C2A29]" weight="bold" />
                  </div>
                  <h3 className="text-xl font-serif mb-3">Арт-дирекшн</h3>
                  <p className="text-[#7A7571] text-sm leading-relaxed flex-1">
                    Пастельная палитра, редакционная типографика и мягкая макро-съемка создают эмоциональную связь с пользователем.
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6DAC9]/50 flex items-center justify-center mb-6 border border-white/50">
                    <Sparkle className="w-7 h-7 text-[#2C2A29]" weight="bold" />
                  </div>
                  <h3 className="text-xl font-serif mb-3">Liquid UI</h3>
                  <p className="text-[#7A7571] text-sm leading-relaxed flex-1">
                    Микро-интеракции, параллакс-скроллинг и элементы глассморфизма делают интерфейс тактильным и живым.
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#D6D0F2]/50 flex items-center justify-center mb-6 border border-white/50">
                    <ChartLineUp className="w-7 h-7 text-[#2C2A29]" weight="bold" />
                  </div>
                  <h3 className="text-xl font-serif mb-3">SEO & Аналитика</h3>
                  <p className="text-[#7A7571] text-sm leading-relaxed flex-1">
                    Полная настройка технического SEO, интеграция систем аналитики и оптимизация скорости загрузки для максимального охвата.
                  </p>
                </GlassCard>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* ──────────────── PROMO BANNER (TELEGRAM/MAX) ──────────────── */}
        <section className="py-16">
          <Container>
            <ScrollReveal>
              <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 overflow-hidden relative">

                {/* Left Content */}
                <div className="flex-1 max-w-xl z-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold leading-[1.1] tracking-tight mb-4 text-[#1A1A1A]">
                    Перейди в Telegram-бот или MAX и получи скидку
                  </h2>
                  <p className="text-base md:text-lg text-[#666] leading-relaxed mb-8">
                    Экономьте с комфортом. Подпишитесь на нашего бота в Telegram или MAX, чтобы получить секретный промокод на скидку. Без спама, только выгода в один клик
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href="https://max.ru"
                      target="_blank"
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#E94E77] text-white font-medium hover:bg-[#d43a63] transition-colors shadow-lg shadow-[#E94E77]/30"
                    >
                      Открыть MAX
                    </Link>
                    <Link
                      href="https://t.me"
                      target="_blank"
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-[#E94E77] text-[#E94E77] font-medium hover:bg-[#E94E77]/5 transition-colors"
                    >
                      Открыть Telegram
                    </Link>
                  </div>
                </div>

                {/* Right Content (Phone Mockup) */}
                <div className="flex-1 flex justify-center lg:justify-end relative w-full max-w-[400px]">
                  {/* Phone Frame */}
                  <div className="relative w-[280px] h-[580px] bg-[#0a0a0a] rounded-[45px] p-2.5 shadow-2xl border-[4px] border-[#333] z-10 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="relative w-full h-full bg-gradient-to-br from-[#5B9C9C] via-[#47747F] to-[#2B4156] rounded-[35px] overflow-hidden flex flex-col items-center pt-14">

                      {/* Dynamic Island */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-20" />

                      {/* Time & Date */}
                      <div className="text-white text-center mb-10 z-10">
                        <p className="text-sm font-medium opacity-90 mb-1">Понедельник, 6 июня</p>
                        <p className="text-7xl font-light tracking-tighter">9:41</p>
                      </div>

                      {/* Notifications Container */}
                      <div className="w-full px-4 space-y-3 z-10 overflow-hidden">
                        {notifications.map((notif, index) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                              delay: index * 0.4,
                              type: "spring",
                              stiffness: 200,
                              damping: 20
                            }}
                            className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex gap-3 text-white shadow-lg"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                              {notif.icon === "telegram" ? (
                                <TelegramLogotypeMonoIcon className="w-6 h-6 text-[#229ED9]" />
                              ) : (
                                <MaxLogoIcon className="w-6 h-6 text-[#229ED9]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-semibold text-sm">{notif.app}</span>
                                <span className="text-xs opacity-70">{notif.time}</span>
                              </div>
                              <p className="text-sm opacity-90 truncate">{notif.text}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Bottom Ambient Light */}
                      <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-white/20 blur-[60px] rounded-full" />
                    </div>
                  </div>

                  {/* Decorative blurred blob behind phone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#F2C6D4] rounded-full blur-[80px] opacity-60 mix-blend-multiply z-0" />
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>

        {/* ──────────────── GALLERY (4 CARDS) ──────────────── */}
        <section id="gallery" className="py-24">
          <Container>
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-serif text-center mb-16">
                Взглянуть поближе.
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8">
              <ScrollReveal delay={0}>
                <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-1.png"
                    alt="Cveteya Gallery 1"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-2.png"
                    alt="Cveteya Gallery 2"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="relative aspect-[16/9] rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-3.png"
                    alt="Cveteya Gallery 3"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={300}>
                <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-4.png"
                    alt="Cveteya Gallery 4"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* ──────────────── IMPACT / METRICS (4 CARDS) ──────────────── */}
        <section className="py-24">
          <Container>
            <ScrollReveal>
              <GlassCard className="p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-white/40 to-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C6D4] rounded-full blur-[80px] opacity-40 mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B2D8C6] rounded-full blur-[80px] opacity-40 mix-blend-multiply" />

                <h2 className="text-3xl md:text-5xl font-serif mb-12 relative z-10">
                  Цветущие результаты.
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-6xl font-serif text-[#2C2A29] mb-2">+42%</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Конверсия</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-6xl font-serif text-[#2C2A29] mb-2">2.4x</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Средний чек</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-6xl font-serif text-[#2C2A29] mb-2">-30%</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Показатель отказов</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-6xl font-serif text-[#2C2A29] mb-2">+120%</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Время на сайте</span>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </Container>
        </section>

        {/* ──────────────── CTA ──────────────── */}
        <section className="py-32 relative">
          <Container className="text-center relative z-10">
            <ScrollReveal>
              <h2 className="text-4xl md:text-6xl font-serif mb-8 text-[#2C2A29]">
                Готовы к росту?
              </h2>
              <p className="text-lg text-[#7A7571] mb-12 max-w-lg mx-auto">
                Давайте создадим что-то прекрасное вместе. Мы сейчас принимаем новые проекты.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <GlassButton href="/order" variant="dark">
                  Оформить заказ
                  <ArrowUpRight weight="bold" />
                </GlassButton>
                <GlassButton href="/projects">
                  <ArrowLeft weight="bold" />
                  Все проекты
                </GlassButton>
              </div>
            </ScrollReveal>
          </Container>
        </section>

      </div>
    </main>
  );
}
