"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";

interface AlxProject {
  title: string;
  description?: string;
  cover: { imageSrc: string; videoSrc?: string };
  href?: string;
  period?: string;
  techStack?: string[];
}

const ACCENT = "#C7FF3C";
const HOT = "#FF3366";

const GALLERY = [
  "/static-images/projects/alx/alx-1.png",
  "/static-images/projects/alx/alx-2.png",
  "/static-images/projects/alx/alx-3.png",
  "/static-images/projects/alx/alx-4.png",
];

const PROCESS = [
  {
    n: "01",
    title: "Логотип & айдентика",
    body: "Разработали логотип и фирменный стиль мероприятия: типографика, цветовая система, паттерны — вся визуальная грамматика выставки.",
  },
  {
    n: "02",
    title: "Концепт-арт маскота",
    body: "Иллюстраторы проработали концепты будущего Чужого — главного маскота ALX-9. От первых скетчей до финального референса.",
  },
  {
    n: "03",
    title: "3D модель",
    body: "На основе концептов собрали полноценную роботизированную модель Чужого: топология, материалы, освещение под реальную сцену.",
  },
  {
    n: "04",
    title: "Сайт мероприятия",
    body: "Разработали сайт с регистрацией, покупкой билетов и возможностью присоединиться к сообществу и поддержать его.",
  },
];

const IMPACT = [
  { value: "+60%", label: "Узнаваемость бренда после ребрендинга" },
  { value: "01", label: "Роботизированная 3D-модель Чужого" },
  { value: "08", label: "Недель от брифа до запуска" },
];

const MARQUEE_ITEMS = Array.from({ length: 6 });

const GLITCH_CSS = `
@keyframes alxGlitchA {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  18% { clip-path: inset(22% 0 34% 0); transform: translate(-4px, 0); }
  38% { clip-path: inset(50% 0 12% 0); transform: translate(3px, 0); }
  58% { clip-path: inset(10% 0 62% 0); transform: translate(-2px, 0); }
  78% { clip-path: inset(72% 0 6% 0); transform: translate(2px, 0); }
}
@keyframes alxGlitchB {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  25% { clip-path: inset(30% 0 22% 0); transform: translate(5px, 0); }
  45% { clip-path: inset(60% 0 6% 0); transform: translate(-3px, 0); }
  65% { clip-path: inset(6% 0 70% 0); transform: translate(3px, 0); }
  85% { clip-path: inset(80% 0 2% 0); transform: translate(-1px, 0); }
}
@keyframes alxScan {
  0% { top: -5%; opacity: 0; }
  8% { opacity: 0.9; }
  92% { opacity: 0.9; }
  100% { top: 105%; opacity: 0; }
}
@keyframes alxMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes alxPulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
.alx-glitch { position: relative; display: inline-block; }
.alx-glitch::before,
.alx-glitch::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: inherit;
}
.alx-glitch::before {
  color: ${ACCENT};
  animation: alxGlitchA 3.6s infinite steps(2, end);
  mix-blend-mode: screen;
}
.alx-glitch::after {
  color: ${HOT};
  animation: alxGlitchB 2.8s infinite steps(2, end);
  mix-blend-mode: screen;
}
.alx-scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, ${ACCENT}, transparent);
  animation: alxScan 6s linear infinite;
  pointer-events: none;
}
.alx-marquee { animation: alxMarquee 40s linear infinite; }
.alx-pulse { animation: alxPulse 2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .alx-glitch::before,
  .alx-glitch::after { animation: none; opacity: 0; }
  .alx-scanline { animation: none; opacity: 0; }
  .alx-marquee { animation: none; }
  .alx-pulse { animation: none; }
}
`;

function Corner({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={
        "pointer-events-none absolute z-20 font-mono text-[10px] tracking-[0.3em] text-white/40 select-none " +
        className
      }
    >
      +
    </span>
  );
}

export function AlxProjectPage({ project }: { project: AlxProject }) {
  const href = project.href || "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka";
  const period = project.period || "2024";
  const techStack = project.techStack || ["Figma", "After Effects"];

  return (
    <main className="relative bg-[#050507] text-[#EDEDED] font-sans overflow-x-clip">
      <style dangerouslySetInnerHTML={{ __html: GLITCH_CSS }} />

      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative min-h-[calc(100dvh-88px)] w-full flex flex-col justify-between overflow-hidden border-b border-white/10">
        {/* Video background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {project.cover.videoSrc ? (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full pointer-events-none">
              <iframe
                src={`${project.cover.videoSrc}?autoplay=1&muted=1&loop=1&background=1`}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                title={project.title}
              />
            </div>
          ) : (
            <Image
              src={project.cover.imageSrc}
              alt={project.title}
              fill
              priority
              className="object-cover"
            />
          )}

          {/* Tonal overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050507]/70 via-[#050507]/80 to-[#050507]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050507_88%)]" />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${ACCENT} 1px, transparent 1px), linear-gradient(to bottom, ${ACCENT} 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Scanlines */}
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)",
            }}
          />

          {/* Moving scan line */}
          <div className="alx-scanline" />
        </div>

        {/* Corner crosshairs */}
        <Corner className="top-6 left-6" />
        <Corner className="top-6 right-6" />
        <Corner className="bottom-6 left-6" />
        <Corner className="bottom-6 right-6" />

        {/* Status bar (top) */}
        <Container variant="full-width" className="relative z-10 pt-8">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-2 h-2 rounded-full alx-pulse"
                style={{ background: ACCENT }}
              />
              <span>Rovno.dev</span>
              <span className="text-white/20">/</span>
              <span>Case 02</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span>AI Exhibition</span>
              <span className="text-white/20">/</span>
              <span>{period}</span>
            </div>
          </div>
        </Container>

        {/* Hero body */}
        <Container variant="full-width" className="relative z-10 py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.35em] text-white/60 mb-8">
              <span className="h-px w-12" style={{ background: ACCENT }} />
              <span>Bio-mechanical identity</span>
            </div>

            <h1
              data-text="ALX-9"
              className="alx-glitch text-[22vw] md:text-[14vw] lg:text-[12rem] leading-[0.85] font-heading font-black tracking-[-0.05em] text-white select-none"
            >
              ALX-9
            </h1>

            <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
              <div className="lg:col-span-7">
                <p className="text-2xl md:text-4xl font-heading font-semibold tracking-tight text-white/90 mb-4">
                  Чужой · ИИ выставка
                </p>
                <p className="text-body-2 md:text-body-1 text-white/60 leading-relaxed max-w-2xl">
                  {project.description ||
                    "Разработка фирменного стиля, 3D-модели и веб-сайта для крупнейшей выставки роботостроения и искусственного интеллекта."}
                </p>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-t border-white/15 pt-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                      Client
                    </div>
                    <div className="text-sm text-white/90">ALX</div>
                  </div>
                  <div className="border-t border-white/15 pt-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                      Scope
                    </div>
                    <div className="text-sm text-white/90">Identity · 3D · Web</div>
                  </div>
                  <div className="border-t border-white/15 pt-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                      Year
                    </div>
                    <div className="text-sm text-white/90">{period}</div>
                  </div>
                  <div className="border-t border-white/15 pt-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                      Stack
                    </div>
                    <div className="text-sm text-white/90 truncate">
                      {techStack.join(" · ")}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    asChild
                    size="large"
                    className="flex-1 !bg-[#C7FF3C] !text-[#050507] hover:!bg-[#d4ff5c] font-mono uppercase tracking-wider"
                  >
                    <Link href={href} target="_blank" rel="noopener noreferrer">
                      Смотреть кейс
                      <ArrowUpRight className="size-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* Scroll cue */}
        <Container variant="full-width" className="relative z-10 pb-8">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
            <span>Scroll</span>
            <ArrowDown className="size-4" />
            <span>01 / 06</span>
          </div>
        </Container>
      </section>

      {/* ============================================================
          MARQUEE
      ============================================================ */}
      <div className="relative border-b border-white/10 py-6 overflow-hidden select-none">
        <div className="flex whitespace-nowrap alx-marquee w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center gap-10 pr-10">
              {MARQUEE_ITEMS.map((_, i) => (
                <span
                  key={i}
                  className="font-mono uppercase text-2xl md:text-4xl tracking-tight text-white/70"
                >
                  ALX-9
                  <span className="mx-4" style={{ color: ACCENT }}>
                    ·
                  </span>
                  AI Exhibition
                  <span className="mx-4" style={{ color: ACCENT }}>
                    ·
                  </span>
                  Чужой
                  <span className="mx-4" style={{ color: ACCENT }}>
                    ·
                  </span>
                  {period}
                  <span className="mx-4" style={{ color: ACCENT }}>
                    ·
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          MANIFESTO
      ============================================================ */}
      <ScrollReveal threshold={0.05}>
        <section className="relative py-24 md:py-40 border-b border-white/10">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mb-3">
                  02 — Manifesto
                </div>
                <div
                  className="h-px w-16"
                  style={{ background: ACCENT }}
                />
              </div>
              <div className="lg:col-span-9">
                <p className="text-3xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-tight leading-[1.05] text-white">
                  Мы не просто{" "}
                  <span className="text-white/50">оформили выставку.</span>{" "}
                  Мы построили{" "}
                  <span style={{ color: ACCENT }}>вселенную</span> вокруг
                  роботизированного Чужого — от первого скетча до интерактивного
                  3D-опыта и сайта с билетной системой.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ============================================================
          PROCESS
      ============================================================ */}
      <ScrollReveal threshold={0.05}>
        <section className="relative py-24 md:py-32 border-b border-white/10">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-end justify-between mb-16">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mb-3">
                    03 — Process
                  </div>
                  <h2 className="text-4xl md:text-6xl font-heading font-semibold tracking-tight text-white">
                    От брифа до сцены.
                  </h2>
                </div>
                <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                  04 Steps
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                {PROCESS.map((step) => (
                  <div
                    key={step.n}
                    className="group relative bg-[#050507] p-8 md:p-10 min-h-[280px] flex flex-col justify-between hover:bg-[#0b0b10] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-12">
                      <span
                        className="font-mono text-6xl md:text-7xl font-black leading-none"
                        style={{ color: ACCENT }}
                      >
                        {step.n}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
                        Step
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-heading font-semibold text-white mb-3 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm text-white/55 leading-relaxed">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ============================================================
          MODEL SHOWCASE
      ============================================================ */}
      <ScrollReveal threshold={0.05}>
        <section className="relative py-24 md:py-32 border-b border-white/10">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-white/10">
                  <Image
                    src="/static-images/projects/alx/alx-1.png"
                    alt="ALX-9 — Чужой, 3D модель"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent" />

                  {/* Technical annotations */}
                  <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60 flex items-center gap-3">
                    <span
                      className="inline-block w-2 h-2 rounded-full alx-pulse"
                      style={{ background: ACCENT }}
                    />
                    <span>Model · 3D</span>
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
                    Fig. 01 / Роботизированный Чужой
                  </div>

                  {/* Crosshairs */}
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-white/20 text-xs">
                    +
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mb-3">
                  04 — The Xeno
                </div>
                <h2 className="text-4xl md:text-6xl font-heading font-semibold tracking-tight text-white mb-6 leading-[1.05]">
                  Чужой.
                  <br />
                  <span className="text-white/40">Собран по частям.</span>
                </h2>
                <p className="text-body-2 text-white/60 leading-relaxed mb-8">
                  От первых иллюстраций до полноценной роботизированной модели.
                  Каждый слой — это отдельная сцена: металл, механика, оптика,
                  свет. Модель стала центральным объектом выставки и точкой
                  взаимодействия для посетителей.
                </p>

                <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                  {[
                    { k: "Poly", v: "Hi-poly" },
                    { k: "Maps", v: "PBR" },
                    { k: "Stage", v: "Live" },
                  ].map((m) => (
                    <div key={m.k}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                        {m.k}
                      </div>
                      <div className="text-sm text-white/90">{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ============================================================
          GALLERY
      ============================================================ */}
      <ScrollReveal threshold={0.05}>
        <section className="relative py-24 md:py-32 border-b border-white/10">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-end justify-between mb-16">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mb-3">
                    05 — Gallery
                  </div>
                  <h2 className="text-4xl md:text-6xl font-heading font-semibold tracking-tight text-white">
                    Кадры со сцены.
                  </h2>
                </div>
                <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                  2024
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
                <div className="md:col-span-8 relative aspect-[16/10] overflow-hidden border border-white/10 group">
                  <Image
                    src={GALLERY[0]}
                    alt="ALX-9 — 01"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                    / 01
                  </div>
                </div>
                <div className="md:col-span-4 relative aspect-[3/4] md:aspect-auto overflow-hidden border border-white/10 group">
                  <Image
                    src={GALLERY[1]}
                    alt="ALX-9 — 02"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                    / 02
                  </div>
                </div>
                <div className="md:col-span-4 relative aspect-[3/4] md:aspect-auto overflow-hidden border border-white/10 group">
                  <Image
                    src={GALLERY[2]}
                    alt="ALX-9 — 03"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                    / 03
                  </div>
                </div>
                <div className="md:col-span-8 relative aspect-[16/10] overflow-hidden border border-white/10 group">
                  <Image
                    src={GALLERY[3]}
                    alt="ALX-9 — 04"
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">
                    / 04
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ============================================================
          IMPACT + QUOTE
      ============================================================ */}
      <ScrollReveal threshold={0.05}>
        <section className="relative py-24 md:py-32 border-b border-white/10">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              {/* Metric */}
              <div className="lg:col-span-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mb-3">
                  06 — Impact
                </div>
                <div className="flex items-baseline gap-4">
                  <span
                    className="text-[6rem] md:text-[8rem] font-heading font-black leading-none tracking-tight"
                    style={{ color: ACCENT }}
                  >
                    +60%
                  </span>
                </div>
                <p className="text-body-2 text-white/60 leading-relaxed mt-4 max-w-md">
                  узнаваемость бренда после ребрендинга. Ребрендинг помог
                  проекту сильно продвинуться в медиа благодаря качественной
                  анимации от наших 3D-художников.
                </p>

                <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
                  {IMPACT.slice(1).map((m) => (
                    <div key={m.label}>
                      <div className="font-mono text-3xl font-black text-white mb-1">
                        {m.value}
                      </div>
                      <div className="text-xs text-white/50 leading-snug">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="lg:col-span-7 lg:pl-12 lg:border-l lg:border-white/15 flex flex-col justify-center">
                <div
                  className="font-mono text-[10px] uppercase tracking-[0.35em] mb-8"
                  style={{ color: ACCENT }}
                >
                  Client words
                </div>
                <blockquote className="text-2xl md:text-4xl font-heading font-medium tracking-tight text-white leading-[1.2]">
                  <span className="text-white/30">“</span>
                  Сотрудничество с агентством дало нам главное преимущество —
                  качественный дизайн и грамотный маркетинг всего мероприятия.
                  Это была масштабная работа!
                  <span className="text-white/30">”</span>
                </blockquote>
                <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
                  — ALX / 2024
                </div>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ============================================================
          CTA
      ============================================================ */}
      <ScrollReveal threshold={0.05}>
        <section className="relative py-32 md:py-48 overflow-hidden">
          {/* Accent radial */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, rgba(199,255,60,0.08) 0%, transparent 65%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${ACCENT} 1px, transparent 1px), linear-gradient(to bottom, ${ACCENT} 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />

          <Container variant="full-width" className="relative z-10">
            <div className="max-w-[1200px] mx-auto text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 mb-6">
                End of case
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black tracking-[-0.03em] text-white mb-10 leading-[0.95]">
                Смотреть полный
                <br />
                <span style={{ color: ACCENT }}>кейс на Dprofile</span>
              </h2>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  asChild
                  size="xlarge"
                  className="!bg-[#C7FF3C] !text-[#050507] hover:!bg-[#d4ff5c] font-mono uppercase tracking-wider"
                >
                  <Link href={href} target="_blank" rel="noopener noreferrer">
                    ALX-9 на Dprofile
                    <ArrowUpRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="xlarge"
                  variant="outlined"
                  className="!border-white/20 !text-white hover:!bg-white/5 font-mono uppercase tracking-wider"
                >
                  <Link href="/projects">Все проекты</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>
    </main>
  );
}
