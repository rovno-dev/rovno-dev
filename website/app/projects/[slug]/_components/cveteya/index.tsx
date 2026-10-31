"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, animate, useMotionValue } from "motion/react";
import { ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { CustomPageContext } from "../custom-pages";
import { CveteyaLogo } from "./cveteya-logo";
import { TelegramLogotypeMonoIcon } from "@/components/icons";
import { MaxLogoIcon } from "@/components/icons/logotypes/max-logo-icon";
import { CustomVideoPlayer } from "@/components/ui/custom-video-player";
import PixelTransition from "@/components/ui/pixel-transition";

// ─────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────
const BG_COLOR = "#F8F6F4"; // Warm paper
const INK = "#1A1A1A"; // Deep ink
const MUTED = "#7A7571"; // Warm grey
const ACCENT = "#C76575"; // Muted rose

// ─────────────────────────────────────────────────────────────
// Animated Number (Triggers when visible)
// ─────────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(decimals));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(count, value, { duration: 2.5, ease: [0.16, 1, 0.3, 1] });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, count]);

  return (
    <span ref={ref} className="flex items-baseline font-serif">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function CveteyaProjectPage({ project, content }: { project: CustomPageContext, content: React.ReactNode }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Force Light Mode for this specific page
  useEffect(() => {
    const html = document.documentElement;
    const originalClass = html.className;
    html.classList.remove("dark");
    html.classList.add("light");
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = BG_COLOR;
    return () => {
      html.className = originalClass;
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const notifications = [
    { id: 1, app: "Telegram", text: "Скидка 15% на ваш любимый сорт пионов", time: "9:41 AM", icon: "telegram" },
    { id: 2, app: "MAX", text: "Новый промокод внутри", time: "9:41 AM", icon: "max" },
    { id: 3, app: "Telegram", text: "Секретный бонус активирован", time: "9:41 AM", icon: "telegram" },
  ];

  return (
    <main
      className="min-h-screen font-sans selection:bg-[#C76575] selection:text-white overflow-x-clip"
      style={{ backgroundColor: BG_COLOR, color: INK }}
    >
      {/* ──────────────── HERO ──────────────── */}
      <section
        ref={heroRef}
        className="relative h-[100svh] min-h-[700px] w-full overflow-hidden flex flex-col items-center justify-center bg-black"
      >
        <div className="absolute inset-0 z-0">
          <CustomVideoPlayer
            src="/static-images/projects/cveteya/cveteya-footage.webm"
            className="w-full h-full opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#F8F6F4] z-10" />
        </div>

        <motion.div
          style={{ y: heroTextY, opacity: heroOpacity }}
          className="relative z-20 flex flex-col items-center text-center px-6 w-full max-w-5xl mt-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <CveteyaLogo className="w-full max-w-[500px] text-white mb-12 drop-shadow-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <Link
              href="https://cveteya.com"
              target="_blank"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium transition-transform duration-300 hover:scale-105"
            >
              Перейти в магазин
              <ArrowUpRight weight="bold" className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ──────────────── INTRO / MANIFESTO ──────────────── */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight max-w-4xl">
            Переосмысляем то, как мы <br className="hidden md:block" />
            <span className="italic text-[#7A7571]">воспринимаем</span> цветы.
          </h2>
          <p className="mt-10 text-lg md:text-xl text-[#7A7571] leading-relaxed max-w-2xl">
            Мы убрали визуальный шум традиционного e-commerce. Никаких жестких сеток и агрессивных баннеров. Только плавный, тактильный цифровой опыт, который относится к каждому букету как к произведению искусства.
          </p>
        </div>
      </section>

      {/* ──────────────── LOOKBOOK / GALLERY ──────────────── */}
      <section className="pb-24 md:pb-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className="relative aspect-[3/4] rounded-sm overflow-hidden"
            >
              <Image src="/static-images/projects/cveteya/composition.png" alt="Цветочная композиция" fill className="object-cover hover:scale-105 transition-transform duration-[1.5s] ease-out" />
              <div className="absolute bottom-6 left-6 font-serif italic text-2xl drop-shadow-lg text-(--dark-9) p-3 bg-white/50 backdrop-blur-[var(--blur-glass)] rounded-xl">Простой заказ в 1 клик</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-[3/4] rounded-sm overflow-hidden md:mt-32"
            >
              <Image src="/static-images/projects/cveteya/default.png" alt="Процесс" fill className="object-cover hover:scale-105 transition-transform duration-[1.5s] ease-out" />
              <div className="absolute bottom-6 left-6 font-serif italic text-2xl drop-shadow-lg  p-3 bg-white/50 backdrop-blur-[var(--blur-glass)] rounded-xl">Ритуал</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────── APP SHOWCASE (TELEGRAM/MAX) ──────────────── */}
      <section className="py-24 md:py-32 bg-[#EBE5DE] text-[#1A1A1A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          <div className="flex-1 max-w-xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] mb-6">Прямая связь.</h2>
            <p className="text-lg text-[#7A7571] leading-relaxed mb-10">
              Мы выстроили диалоговую коммерцию внутри Telegram и MAX. Персональные дропы, секретные промокоды и повторные заказы в один клик — там, где пользователь уже находится.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-1 pr-5 py-1 rounded-full bg-white border border-black/5 shadow-sm">
                <TelegramLogotypeMonoIcon className="size-10 text-[#229ED9]" />
                <span className="text-body-3 text-[#1A1A1A]">Бот в Telegram</span>
              </div>
              <div className="flex items-center gap-2  px-1 pr-5 py-1 rounded-full bg-white border border-black/5 shadow-sm">
                <MaxLogoIcon className="size-10 text-[#8B5CF6]" />
                <span className="text-body-3 text-[#1A1A1A]">Бот в MAX</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end relative w-full max-w-[400px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#C76575] opacity-[0.1] blur-[120px] rounded-full pointer-events-none" />

            <div className="relative w-[320px] h-[650px] bg-white rounded-[52px] p-[8px] shadow-2xl border-[4px] border-black/5 z-10">
              <div className="relative w-full h-full bg-[#F8F6F4] rounded-[44px] overflow-hidden flex flex-col items-center pt-16 border border-black/5">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-20" />
                <div className="text-[#1A1A1A] text-center mb-12 z-10">
                  <p className="text-sm font-medium text-black/40 mb-1">Понедельник, 6 июня</p>
                  <p className="text-7xl font-light tracking-tighter">9:41</p>
                </div>
                <div className="w-full px-4 space-y-3 z-10">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                      className="bg-white border border-black/5 rounded-2xl p-3 flex items-center gap-4 text-[#1A1A1A] shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-center justify-center shrink-0 size-12 rounded-[14px] bg-[#F8F6F4] shadow-sm border border-black/5">
                        {notif.icon === "telegram" ? (
                          <TelegramLogotypeMonoIcon className="size-8 text-[#229ED9]" />
                        ) : (
                          <MaxLogoIcon className="size-8 text-[#8B5CF6]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-semibold text-[13px]">{notif.app}</span>
                          <span className="text-[11px] text-black/30">{notif.time}</span>
                        </div>
                        <p className="text-[13px] text-black/60 truncate">{notif.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── IMPACT / NUMBERS (SCROLL ANIMATED) ──────────────── */}
      <section className="relative py-32 md:py-48 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-24 gap-x-8 text-left py-20">

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col border-l border-[#1A1A1A]/10 pl-6"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl text-[#1A1A1A] mb-4">
                <AnimatedNumber value={42} prefix="+" suffix="%" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#C76575] font-semibold mb-3">Конверсия</div>
              <p className="text-sm text-[#7A7571] leading-relaxed">Рост оформленных заказов после полного редизайна воронки продаж.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex flex-col border-l border-[#1A1A1A]/10 pl-6 md:mt-16"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl text-[#1A1A1A] mb-4">
                <AnimatedNumber value={2.4} decimals={1} suffix="x" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#C76575] font-semibold mb-3">Средний чек</div>
              <p className="text-sm text-[#7A7571] leading-relaxed">Клиенты стали выбирать более крупные и премиальные композиции.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col border-l border-[#1A1A1A]/10 pl-6"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl text-[#1A1A1A] mb-4">
                <AnimatedNumber value={30} prefix="-" suffix="%" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#C76575] font-semibold mb-3">Показатель отказов</div>
              <p className="text-sm text-[#7A7571] leading-relaxed">Пользователи дольше изучают каталог благодаря плавной навигации.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col border-l border-[#1A1A1A]/10 pl-6 md:mt-16"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl text-[#1A1A1A] mb-4">
                <AnimatedNumber value={120} prefix="+" suffix="%" />
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-[#C76575] font-semibold mb-3">Время на сайте</div>
              <p className="text-sm text-[#7A7571] leading-relaxed">Тактильный интерфейс и арт-дирекшн удерживают внимание аудитории.</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ──────────────── CTA (PIXEL TRANSITION) ──────────────── */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto h-[320px] md:h-[400px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
          <PixelTransition
            firstContent={
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F6F4] p-6 md:p-8 text-center border border-black/5 rounded-3xl">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-4 md:mb-6 text-[#1A1A1A]">
                  Готовы вывести продукт <br className="hidden md:block" /> на новый уровень?
                </h2>
                <p className="text-base md:text-lg text-[#7A7571]">
                  Наведите курсор, чтобы начать.
                </p>
              </div>
            }
            secondContent={
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A1A] p-6 md:p-8 text-center rounded-3xl">
                <h2 className="text-3xl md:text-5xl font-serif mb-8 md:mb-10 text-white">
                  Обсудим ваш проект?
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/order"
                    className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-[#1A1A1A] rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    Оставить заявку
                    <ArrowUpRight weight="bold" />
                  </Link>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 border border-white/20 text-white rounded-full font-medium hover:border-white transition-colors"
                  >
                    <ArrowLeft weight="bold" />
                    Все проекты
                  </Link>
                </div>
              </div>
            }
            gridSize={10}
            pixelColor="#C76575"
            animationStepDuration={0.4}
            className="w-full h-full"
          />
        </div>
      </section>
    </main>
  );
}
