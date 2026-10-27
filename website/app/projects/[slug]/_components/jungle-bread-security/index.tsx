"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import {
  ShieldCheck,
  VideoCamera,
  UserFocus,
  Waveform,
  ArrowUpRight,
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  ArrowsOut,
  Desktop,
  Dog
} from "@phosphor-icons/react/dist/ssr";
import type { CustomPageContext } from "../custom-pages";
import { BrowserVideoPlayer } from "@/components/ui/browser-video-player";

export function JungleBreadSecurityPage({ project, content }: { project: CustomPageContext, content: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Force dark mode on this specific page
  useEffect(() => {
    const html = document.documentElement;
    const originalClass = html.className;

    html.classList.remove("light");
    html.classList.add("dark");

    // Optional: Force background color in case the root layout overrides it
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0A0A0B";

    return () => {
      html.className = originalClass;
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <main className="min-h-screen bg-(--bg) text-(--on-bg-high) selection:bg-blue-500/30">

      {/* ──────────────── HERO ──────────────── */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[700px] overflow-hidden flex items-center justify-center bg-black">

        {/* Parallax Background Video */}
        <motion.div
          style={{ y: videoY }}
          className="absolute inset-0 w-full h-[120%] -top-[10%] z-0"
        >
          {/* Using a placeholder video, replace with actual security camera footage */}
          <video
            src="/videos/hero/solutions.webm"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-black/60 z-10" />
          {/* Bottom Gradient Fade into the page background */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-(--bg) to-transparent z-10" />
        </motion.div>

        {/* Foreground Content */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-20 text-center flex flex-col items-center px-6 w-full max-w-4xl mt-16"
        >
          <ScrollReveal>

            <h1 className="text-display-1 md:text-[5rem] lg:text-[6rem] font-heading tracking-tighter mb-6 text-white drop-shadow-2xl">
              Безопасность для <br className="hidden md:block" />Jungle Bread
            </h1>

            <p className="text-body-2 text-white/80 max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-md">
              {project.description || "Умная охранная система для садика для собак. Прямые эфиры для владельцев, полный контроль для администрации и ИИ-детекция поведения."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="large" variant="filled" asChild >
                <Link
                  href={'https://app.jungle-bread.com'}
                  target="_blank"
                  rel="noopener noreferrer"

                >
                  Оригинал кейса
                  <ArrowUpRight weight="bold" className="size-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </motion.div>
      </section>

      {/* ──────────────── WEB APP SHOWCASE ──────────────── */}
      <section className="py-24 border-b border-(--outline)">
        <Container>
          <div className="flex flex-col gap-16 md:gap-24">

            {/* Top: Camera + Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

              {/* Camera Illustration */}
              <div className="w-full flex justify-center">
                <ScrollReveal className="w-full flex justify-center">
                  <div className="relative w-full max-w-[400px] aspect-[3/4]">
                    <Image
                      src="/static-images/projects/jungle-bread/cctv.webp"
                      alt="CCTV Camera"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain"
                      style={{
                        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)"
                      }}
                    />
                  </div>
                </ScrollReveal>
              </div>

              {/* Text & List */}
              <div className="w-full">
                <ScrollReveal delay={100}>
                  <div>
                    <h2 className="text-display-3 md:text-display-2 font-heading font-semibold tracking-tight mb-6">
                      Веб-приложение для контроля
                    </h2>
                    <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8">
                      Мы разработали удобную веб-платформу, которая позволяет владельцам и сотрудникам садика не переживать о питомцах. Включите трансляцию в браузере в любой момент, чтобы проверить, как проходит день.
                    </p>
                    <ul className="space-y-4 mb-8">
                      {[
                        "Доступ из любого браузера без установки",
                        "Прямые эфиры с камер в HD-качестве",
                        "Push-уведомления и система оповещений",
                        "Единая экосистема для владельцев и админов"
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-body-3 text-(--on-bg-high)">
                          <div className="size-6 rounded-full bg-(--primary-glass) flex items-center justify-center shrink-0">
                            <span className="text-(--primary) text-sm font-bold">✓</span>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              </div>
            </div>

            {/* Bottom: Video Player (Always down) */}
            <div className="w-full max-w-4xl mx-auto">
              <ScrollReveal delay={200}>
                <BrowserVideoPlayer src="/static-images/projects/jungle-bread/hero.webm" url="app.junglebread.ru" />
              </ScrollReveal>
            </div>

          </div>
        </Container>
      </section>

      {/* ──────────────── LIVE CAMERAS (2 CAMERAS) ──────────────── */}
      <section id="live" className="py-24 bg-(--card)/30 border-b border-(--outline)">
        <Container>
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-500 mb-4">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-red-500"></span>
                  </span>
                  LIVE
                </div>
                <h2 className="text-display-3 font-heading font-semibold tracking-tight">Камеры в реальном времени</h2>
                <p className="text-body-3 text-(--on-bg-medium) mt-2">Владельцы и администраторы видят происходящее без задержек.</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outlined-static" className="bg-(--bg)">2 камеры</Badge>
                <Badge variant="outlined-static" className="bg-(--bg)">1080p</Badge>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 1, title: "Игровая зона", status: "Онлайн", videoSrc: "/static-images/projects/jungle-bread/camera-1.webm" },
              { id: 2, title: "Комната отдыха", status: "Онлайн", videoSrc: "/static-images/projects/jungle-bread/camera-2.webm" }
            ].map((cam, i) => (
              <ScrollReveal key={cam.id} delay={i * 100}>
                <div className="group relative aspect-video rounded-2xl overflow-hidden bg-black border border-(--outline) cursor-pointer">
                  <video
                    src={cam.videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />

                  {/* Camera Overlay UI */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-mono">
                        <VideoCamera weight="fill" className="size-3 text-white/70" />
                        CAM 0{cam.id}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                        REC
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1 text-white drop-shadow-md">
                        <span className="font-semibold text-sm">{cam.title}</span>
                        <span className="text-xs text-white/70 font-mono">2026-10-24 14:32:0{cam.id}</span>
                      </div>
                      <div className="size-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight weight="bold" className="size-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ──────────────── FEATURES (4 CARDS, INFORMATIVE MOCKUPS) ──────────────── */}
      <section className="py-24">
        <Container>
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-display-3 font-heading font-semibold tracking-tight mb-4">Умный контроль</h2>
              <p className="text-body-2 text-(--on-bg-medium)">Система не просто транслирует видео, но и анализирует звуки для предотвращения конфликтов.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Card 1: Owners */}
            <ScrollReveal delay={0}>
              <Card className="p-6 rounded-3xl bg-(--card) border-(--outline) h-full flex flex-col group hover:border-(--primary)/30 transition-colors">
                <div className="w-full h-32 rounded-2xl bg-(--bg) border border-(--outline) mb-6 relative overflow-hidden flex flex-col group-hover:border-(--primary)/20 transition-colors">
                  <div className="h-7 border-b border-(--outline) flex items-center px-3 gap-1.5 bg-(--card)/50">
                    <div className="size-1.5 rounded-full bg-(--on-bg-low)/30" />
                    <div className="size-1.5 rounded-full bg-(--on-bg-low)/30" />
                    <div className="size-1.5 rounded-full bg-(--on-bg-low)/30" />
                  </div>
                  <div className="flex-1 p-3 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-(--primary-glass) flex items-center justify-center shrink-0 border border-(--primary)/20">
                      <UserFocus className="size-5 text-(--primary)" />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="h-2 w-2/3 bg-(--on-bg-low)/20 rounded-full" />
                      <div className="h-2 w-1/2 bg-(--on-bg-low)/20 rounded-full" />
                    </div>
                  </div>
                </div>
                <h3 className="text-heading-3 font-semibold mb-3">Доступ для владельцев</h3>
                <p className="text-body-3 text-(--on-bg-medium) flex-1">
                  Персональный доступ в веб-интерфейсе. Владелец видит только общие зоны и всегда знает, что с его собакой всё в порядке.
                </p>
              </Card>
            </ScrollReveal>

            {/* Card 2: Admin */}
            <ScrollReveal delay={100}>
              <Card className="p-6 rounded-3xl bg-(--card) border-(--outline) h-full flex flex-col group hover:border-(--primary)/30 transition-colors">
                <div className="w-full h-32 rounded-2xl bg-(--bg) border border-(--outline) mb-6 relative overflow-hidden flex group-hover:border-(--primary)/20 transition-colors">
                  <div className="w-12 border-r border-(--outline) flex flex-col items-center py-3 gap-3 bg-(--card)/50">
                    <ShieldCheck className="size-4 text-(--primary)" />
                    <div className="size-4 rounded bg-(--on-bg-low)/20" />
                    <div className="size-4 rounded bg-(--on-bg-low)/20" />
                  </div>
                  <div className="flex-1 p-3 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-lg bg-(--on-bg-low)/5 border border-(--outline) flex items-center justify-center">
                        <VideoCamera className="size-3.5 text-(--on-bg-low)" />
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-heading-3 font-semibold mb-3">Админ-панель</h3>
                <p className="text-body-3 text-(--on-bg-medium) flex-1">
                  Полный контроль для сотрудников. Управление камерами, архив записей, модерация доступа и ручная проверка инцидентов.
                </p>
              </Card>
            </ScrollReveal>

            {/* Card 3: Aggression */}
            <ScrollReveal delay={200}>
              <Card className="p-6 rounded-3xl bg-(--card) border-(--outline) h-full flex flex-col group hover:border-(--primary)/30 transition-colors">
                <div className="w-full h-32 rounded-2xl bg-(--bg) border border-(--outline) mb-6 relative overflow-hidden flex items-center justify-center group-hover:border-(--primary)/20 transition-colors">
                  <div className="relative z-10 flex flex-col items-center gap-3 w-full">
                    <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      !!!
                    </div>
                    <div className="h-10 w-32 flex items-end justify-center gap-2">
                      {[30, 60, 100, 70, 40, 90, 60, 80, 45].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1.5 rounded-full transition-all duration-300 ${i === 2 || i === 5 || i === 7 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-(--on-bg-low)/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <h3 className="text-heading-3 font-semibold mb-3">Детекция агрессии</h3>
                <p className="text-body-3 text-(--on-bg-medium) flex-1">
                  Система анализирует звуковой фон. При резком повышении децибел (лай, рычание, визг) администратор мгновенно получает уведомление.
                </p>
              </Card>
            </ScrollReveal>

            {/* Card 4: Web Platform */}
            <ScrollReveal delay={300}>
              <Card className="p-6 rounded-3xl bg-(--card) border-(--outline) h-full flex flex-col group hover:border-(--primary)/30 transition-colors">
                <div className="w-full h-32 rounded-2xl bg-(--bg) border border-(--outline) mb-6 relative overflow-hidden flex flex-col group-hover:border-(--primary)/20 transition-colors">
                  <div className="h-7 border-b border-(--outline) flex items-center px-3 gap-1.5 bg-(--card)/50">
                    <div className="size-1.5 rounded-full bg-red-500/50" />
                    <div className="size-1.5 rounded-full bg-yellow-500/50" />
                    <div className="size-1.5 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 p-3 flex flex-col items-center justify-center gap-2">
                    <div className="size-8 rounded-full bg-(--primary-glass) flex items-center justify-center">
                      <Desktop className="size-4 text-(--primary)" />
                    </div>
                    <div className="h-1.5 w-16 bg-(--on-bg-low)/20 rounded-full" />
                    <div className="h-1.5 w-10 bg-(--on-bg-low)/20 rounded-full" />
                  </div>
                </div>
                <h3 className="text-heading-3 font-semibold mb-3">Веб-платформа</h3>
                <p className="text-body-3 text-(--on-bg-medium) flex-1">
                  Не требует установки. Работает на любом устройстве с браузером. Единый центр управления для персонала и клиентов.
                </p>
              </Card>
            </ScrollReveal>

          </div>
        </Container>
      </section>

      {/* ──────────────── CTA ──────────────── */}
      <section className="py-24 border-t border-(--outline) bg-(--card)/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <Container className="relative z-10 text-center">
          <ScrollReveal>
            <Dog className="size-12 text-(--on-bg-low) mx-auto mb-6" weight="duotone" />
            <h2 className="text-display-2 font-heading font-semibold mb-6">Нужна похожая система?</h2>
            <p className="text-body-2 text-(--on-bg-medium) mb-10 max-w-xl mx-auto">
              Мы разрабатываем комплексные IoT и видео-решения для бизнеса любого масштаба.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="large" asChild>
                <Link href="/order">Обсудить проект</Link>
              </Button>
              <Button size="large" variant="outlined" asChild>
                <Link href="/projects">
                  <ArrowLeft className="size-4" />
                  Все проекты
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </main>
  );
}
