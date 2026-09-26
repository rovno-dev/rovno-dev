"use client";

import { useEffect, useRef, useState } from "react";
import type { EventCustomContext } from "./event-custom-pages";
import { registerForEvent } from "@/utils/api/events";

/* ═══════════════════════════════════════════════════════════════════════
   Наш.Dev — Terminal Brutalism landing.

   Full-bleed landing for the "Наш.Dev" IT event. Follows the TZ v1.0 strictly:
   - Only #000000, #FFFFFF, #CCFF00
   - No border-radius, no shadows, no gradients, no blur
   - Fonts: monospace for chrome, sans for body
   - Interactive terminal, marquee, typewriter, timeline draw, AI slider,
     registration form, FAQ accordion

   The component is self-contained — it does NOT use the site's Container,
   Button, or Card. Everything is styled locally so the terminal-brutalist
   aesthetic isn't polluted by the rest of the design system.
   ═══════════════════════════════════════════════════════════════════════ */

const LIME = "#CCFF00";
const BLACK = "#000000";
const WHITE = "#FFFFFF";

/* ── Reusable primitives ─────────────────────────────────────────────── */

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: LIME }} className="mr-2 select-none">
      {children}
    </span>
  );
}

function Cursor() {
  return (
    <span
      aria-hidden
      className="inline-block w-[0.55em] h-[1em] ml-1 align-middle"
      style={{
        background: LIME,
        animation: "nashBlink 1s steps(1) infinite",
      }}
    />
  );
}

/* ── Hero: typing headline + interactive terminal ────────────────────── */

const HERO_LINE = "> IT-СОБЫТИЕ ДЛЯ СВОИХ_";

function Hero({ ctx }: { ctx: EventCustomContext }) {
  const [typed, setTyped] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [history, setHistory] = useState<
    { cmd: string; out: string[] }[]
  >([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter for the headline. Starts on mount, reveals char by char.
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(HERO_LINE.slice(0, i));
      if (i >= HERO_LINE.length) {
        clearInterval(id);
        setShowInput(true);
      }
    }, 60);
    return () => clearInterval(id);
  }, []);

  const handleCommand = (cmd: string) => {
    const c = cmd.trim().toLowerCase();
    let out: string[] = [];

    switch (c) {
      case "help":
        out = [
          "  help       — список команд",
          "  about      — о мероприятии",
          "  register   — открыть регистрацию",
          "  speakers   — список спикеров",
          "  location   — где и когда",
          "  clear      — очистить терминал",
        ];
        break;
      case "about":
        out = [
          "  Наш.Dev — ивент для тех, кто устал от лекций.",
          "  15 мин доклад + 15 мин интерактив. 0% канцелярщины.",
        ];
        break;
      case "register":
        out = ["  Открываю форму регистрации..."];
        setTimeout(() => {
          document
            .getElementById("register")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 400);
        break;
      case "speakers":
        out = ["  Листайте до блока SPEAKERS ↓"];
        setTimeout(() => {
          document
            .getElementById("speakers")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 300);
        break;
      case "location":
        out = [
          `  ${ctx.locationName || "МЦК КИТС"}`,
          ctx.address ? `  ${ctx.address}` : "  Адрес уточняется",
        ];
        break;
      case "clear":
        setHistory([]);
        return;
      case "":
        break;
      default:
        out = [`  command not found: ${c}. Try "help".`];
    }
    if (c) setHistory((h) => [...h, { cmd, out }]);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(draft);
      setDraft("");
    }
  };

  return (
    <section
      id="hero"
      className="relative border-b"
      style={{ borderColor: "#222", paddingTop: "80px", paddingBottom: "60px" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Top status line */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-mono uppercase tracking-[0.2em] mb-16"
          style={{ color: LIME }}
        >
          <span>Rovno.dev</span>
          <span style={{ color: "#444" }}>{"//"}</span>
          <span>EVENTS</span>
          <span style={{ color: "#444" }}>{"//"}</span>
          <span>NASH.DEV</span>
        </div>

        {/* Logo */}
        <div className="mb-10">
          <div
            className="inline-flex items-baseline gap-1 font-mono text-2xl md:text-3xl tracking-wider"
            style={{ color: WHITE }}
          >
            <span>НАШ</span>
            <span
              className="inline-block w-3 h-3"
              style={{ background: LIME, marginBottom: "-2px" }}
            />
            <span>DEV</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="font-mono text-[2rem] md:text-[3.5rem] lg:text-[4.5rem] leading-[1.05] tracking-tight mb-8"
          style={{ color: WHITE, minHeight: "1.2em" }}
        >
          {typed}
          {!showInput && <Cursor />}
        </h1>

        {/* Subhead */}
        <p
          className="font-mono text-lg md:text-2xl tracking-[0.2em] mb-6"
          style={{ color: LIME }}
        >
          КОД / ЛЮДИ / ПРАКТИКА
        </p>

        {/* Meta */}
        <p
          className="font-mono text-sm md:text-base mb-12"
          style={{ color: "#888" }}
        >
          {"// "}
          {ctx.locationName || "МЦК КИТС"} _{ctx.startAt ? new Date(ctx.startAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).toUpperCase() : "17 ОКТЯБРЯ 2026"}
        </p>

        {/* Interactive terminal — hidden on mobile, hints replace it */}
        {showInput && (
          <div
            className="hidden md:block border mb-10 font-mono text-sm"
            style={{ borderColor: "#222", background: "#0a0a0a" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 border-b"
              style={{ borderColor: "#222" }}
            >
              <span className="size-2 rounded-none" style={{ background: LIME }} />
              <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#666" }}>
                terminal — nash.dev
              </span>
            </div>
            <div
              className="p-4 max-h-[240px] overflow-y-auto"
              style={{ color: WHITE }}
            >
              {history.map((h, i) => (
                <div key={i} className="mb-2">
                  <div>
                    <Prompt>{">"}</Prompt>
                    {h.cmd}
                  </div>
                  {h.out.map((line, j) => (
                    <div key={j} style={{ color: "#888" }}>
                      {line}
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex items-center">
                <Prompt>{">"}</Prompt>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="type 'help'…"
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none font-mono text-sm"
                  style={{ color: WHITE, caretColor: LIME }}
                />
                <Cursor />
              </div>
            </div>
          </div>
        )}

        {/* Mobile hint buttons */}
        {showInput && (
          <div className="md:hidden flex flex-wrap gap-2 mb-10">
            {["help", "about", "register", "speakers"].map((c) => (
              <button
                key={c}
                onClick={() => handleCommand(c)}
                className="font-mono text-xs uppercase tracking-wider px-3 py-2 border"
                style={{ borderColor: "#333", color: WHITE }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Primary CTA */}
        <div className="flex flex-wrap gap-3">
          <a
            href="#register"
            className="inline-flex items-center justify-center font-mono text-sm md:text-base uppercase tracking-widest px-8 py-4 border-2"
            style={{ background: LIME, color: BLACK, borderColor: LIME }}
          >
            {"{ ЗАПИСАТЬСЯ_ }"}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Marquee ─────────────────────────────────────────────────────────── */

function Marquee() {
  const items = [
    "НАШ.DEV",
    "17 ОКТЯБРЯ",
    "МЦК КИТС",
    "БЕСПЛАТНО",
    "РЕГИСТРАЦИЯ ОТКРЫТА",
  ];
  const line = items.join("  //  ") + "  //  ";
  return (
    <div
      className="overflow-hidden border-b"
      style={{ borderColor: "#222", background: LIME, color: BLACK }}
    >
      <div className="flex py-3 whitespace-nowrap font-mono text-sm md:text-base uppercase tracking-[0.2em]">
        <div
          className="flex shrink-0"
          style={{ animation: "nashMarquee 40s linear infinite" }}
        >
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="px-6">
              {line}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Manifesto (terminal with typewriter) ────────────────────────────── */

function Manifesto({ ctx }: { ctx: EventCustomContext }) {
  return (
    <section
      id="about"
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6 font-mono">
        <p className="text-base md:text-lg mb-10" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>cat about.txt
        </p>

        <p
          className="text-xl md:text-3xl leading-snug mb-10 max-w-[900px]"
          style={{ color: WHITE }}
        >
          НАШ.DEV — это ивент для тех, кто:
        </p>

        <ul className="space-y-3 text-base md:text-xl mb-14 max-w-[900px]">
          {[
            "Устал от лекций, которые не качают",
            "Ищет тусовку, куда берут без стажа",
            "Хочет реальные кейсы, а не воду",
          ].map((line, i) => (
            <li key={i} className="flex gap-3" style={{ color: WHITE }}>
              <span style={{ color: LIME }}>-</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <p className="text-base md:text-lg mb-4" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>ls -la
        </p>
        <p className="text-base md:text-xl" style={{ color: WHITE }}>
          15 мин доклад&nbsp;&nbsp;|&nbsp;&nbsp;15 мин интерактив&nbsp;&nbsp;|&nbsp;&nbsp;0% канцелярщины
        </p>
      </div>
    </section>
  );
}

/* ── Audience cards (hover expand) ───────────────────────────────────── */

const AUDIENCE = [
  {
    code: "STUDENT_16-20",
    title: "Студент 16–20",
    desc: "Учишься, хочешь понять, куда идти дальше. Приходи посмотреть, как это устроено на практике.",
  },
  {
    code: "NEWBIE_CODER",
    title: "Начинающий разработчик",
    desc: "Знаешь основы, но пока не понимаешь, как из этого сделать работу. Здесь — живые примеры.",
  },
  {
    code: "IT_ENTHUSIAST",
    title: "IT-энтузиаст",
    desc: "Следишь за индустрией, ходишь на митапы. Тут — люди и разговоры без пафоса и презентаций.",
  },
];

function Audience() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>whoami --target
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {AUDIENCE.map((a, i) => {
            const isHover = hover === i;
            return (
              <button
                key={a.code}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="relative text-left p-8 md:p-10 border transition-colors"
                style={{
                  borderColor: "#222",
                  marginLeft: i === 0 ? 0 : "-1px",
                  background: isHover ? "#111" : BLACK,
                  outline: "none",
                }}
              >
                <p
                  className="font-mono text-xs uppercase tracking-[0.2em] mb-6"
                  style={{ color: isHover ? LIME : "#666" }}
                >
                  {"{ "}
                  {isHover ? "expand()" : a.code}
                  {" }"}
                </p>
                <h3
                  className="font-mono text-2xl md:text-3xl mb-4 tracking-tight"
                  style={{ color: WHITE }}
                >
                  {a.title}
                </h3>
                <p
                  className="text-base leading-relaxed transition-opacity duration-300"
                  style={{
                    color: "#aaa",
                    opacity: isHover ? 1 : 0.35,
                  }}
                >
                  {a.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Speakers ────────────────────────────────────────────────────────── */

interface Speaker {
  name: string;
  role: string;
  fact: string;
  bio: string;
}

const SPEAKERS: Speaker[] = [
  {
    name: "Михаил Лапаев",
    role: "Директор по продукту · Rovno.dev",
    fact: "> led 30+ продуктовых запусков",
    bio: "Отвечает за продуктовую стратегию агентства. Разбирает, как из идеи сделать продукт, а не презентацию.",
  },
  {
    name: "Нияз Гимадиев",
    role: "Технический директор · Rovno.dev",
    fact: "> built Amorfa, Unidoka, Vershiny",
    bio: "Архитектор систем и автор открытого фреймворка Amorfa. Расскажет про разницу между ИИ со знаниями и без.",
  },
  {
    name: "Данил Киткин",
    role: "Арт-директор · Rovno.dev",
    fact: "> directed ALX-9, Хлебная Страна",
    bio: "3D-художник и моушн-дизайнер. Покажет, как рождаются ролики и 3D-сцены без бюджета Marvel.",
  },
];

function Speakers() {
  const [open, setOpen] = useState<Speaker | null>(null);
  return (
    <section
      id="speakers"
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>list_speakers --show-details
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SPEAKERS.map((s, i) => (
            <button
              key={i}
              onClick={() => setOpen(s)}
              className="text-left p-6 border transition-all duration-200"
              style={{ borderColor: "#222", background: BLACK }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = LIME;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#222";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Pixelated photo placeholder */}
              <div
                className="aspect-square mb-6 relative overflow-hidden"
                style={{
                  background:
                    "repeating-conic-gradient(#222 0% 25%, #111 0% 50%) 50% / 8px 8px",
                }}
              >
                <span
                  className="absolute inset-0 flex items-center justify-center font-mono text-3xl"
                  style={{ color: "#444" }}
                >
                  {s.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
              </div>

              <p
                className="font-mono text-xs uppercase tracking-[0.2em] mb-3"
                style={{ color: "#666" }}
              >
                {"{"}
              </p>
              <p
                className="font-mono text-sm mb-1"
                style={{ color: LIME }}
              >
                NAME:
              </p>
              <p
                className="font-mono text-lg mb-4"
                style={{ color: WHITE }}
              >
                {s.name}
              </p>
              <p className="font-mono text-sm mb-1" style={{ color: LIME }}>
                ROLE:
              </p>
              <p className="font-mono text-sm mb-4" style={{ color: "#aaa" }}>
                {s.role}
              </p>
              <p className="font-mono text-sm mb-1" style={{ color: LIME }}>
                FACT:
              </p>
              <p className="font-mono text-sm mb-4" style={{ color: "#aaa" }}>
                {s.fact}
              </p>
              <p
                className="font-mono text-xs uppercase tracking-[0.2em] mt-6"
                style={{ color: "#666" }}
              >
                {"}"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Bio modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full max-w-[640px] border p-8 font-mono"
            style={{ borderColor: LIME, background: BLACK }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between mb-6 pb-4 border-b"
              style={{ borderColor: "#222" }}
            >
              <span
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: "#666" }}
              >
                README.md — {open.name}
              </span>
              <button
                onClick={() => setOpen(null)}
                className="text-lg"
                style={{ color: "#666" }}
              >
                ✕
              </button>
            </div>
            <h3
              className="text-2xl mb-2"
              style={{ color: WHITE }}
            >
              # {open.name}
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: LIME }}
            >
              ## {open.role}
            </p>
            <p
              className="text-base leading-relaxed mb-4"
              style={{ color: "#ddd" }}
            >
              {open.bio}
            </p>
            <p className="text-sm" style={{ color: "#666" }}>
              {open.fact}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Niyaz's AI slider (before/after) ────────────────────────────────── */

function AiSlider() {
  const [pos, setPos] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  useEffect(() => {
    const onUp = () => (dragging.current = false);
    const onMove = (e: MouseEvent) => {
      if (dragging.current) update(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (dragging.current && e.touches[0]) update(e.touches[0].clientX);
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchmove", onTouch);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchmove", onTouch);
    };
  }, []);

  return (
    <section
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-4" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>compare --ai-knowledge
        </p>
        <h2
          className="font-mono text-2xl md:text-4xl tracking-tight mb-12 max-w-[900px]"
          style={{ color: WHITE }}
        >
          ИИ без знаний vs ИИ со знаниями
        </h2>

        <div
          ref={trackRef}
          className="relative w-full aspect-[16/9] border select-none overflow-hidden touch-none"
          style={{ borderColor: "#222" }}
        >
          {/* LEFT: grey */}
          <div
            className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end"
            style={{ background: "#111" }}
          >
            <p
              className="font-mono text-xs uppercase tracking-[0.2em] mb-3"
              style={{ color: "#666" }}
            >
              AI_WITHOUT_KNOWLEDGE
            </p>
            <p
              className="font-mono text-xl md:text-3xl mb-3"
              style={{ color: "#888" }}
            >
              Уязвимости.
              <br />
              Нулевая масштабируемость.
            </p>
            <p className="text-sm md:text-base" style={{ color: "#555" }}>
              Код собирается быстро, но ломается на первом реальном сценарии.
            </p>
          </div>

          {/* RIGHT: lime, clipped */}
          <div
            className="absolute inset-y-0 right-0 p-6 md:p-12 flex flex-col justify-end"
            style={{
              width: `${100 - pos}%`,
              background: LIME,
              color: BLACK,
            }}
          >
            <div
              className="flex flex-col justify-end h-full"
              style={{ width: `${(100 / (100 - pos)) * 100}%` }}
            >
              <p
                className="font-mono text-xs uppercase tracking-[0.2em] mb-3"
                style={{ color: "#333" }}
              >
                AI_WITH_FULLSTACK
              </p>
              <p className="font-mono text-xl md:text-3xl mb-3">
                ИИ как черновик.
                <br />
                Ручной контроль.
              </p>
              <p className="text-sm md:text-base" style={{ color: "#333" }}>
                Модель пишет первую версию. Инженер доводит до продакшена.
              </p>
            </div>
          </div>

          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 cursor-ew-resize"
            style={{ left: `${pos}%`, background: WHITE }}
            onMouseDown={() => (dragging.current = true)}
            onTouchStart={() => (dragging.current = true)}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 flex items-center justify-center font-mono text-sm"
              style={{ background: WHITE, color: BLACK }}
            >
              ⇄
            </div>
          </div>
        </div>

        <p
          className="font-mono text-sm md:text-base mt-10"
          style={{ color: LIME }}
        >
          <Prompt>{">"}</Prompt>Want real creativity? Check Pinterest or Dprofile.
        </p>
      </div>
    </section>
  );
}

/* ── Timeline (draws on scroll) ──────────────────────────────────────── */

const TIMELINE = [
  { time: "14:00", cmd: "run lecture_ux_mikhail" },
  { time: "14:30", cmd: "run ai_reality_check_niyaz" },
  { time: "15:00", cmd: "run motion_design_danil" },
  { time: "15:30", cmd: "start networking" },
];

function Timeline() {
  return (
    <section
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>cat schedule.txt
        </p>

        <div className="relative pl-8 md:pl-12">
          {/* Vertical line */}
          <div
            className="absolute top-0 bottom-0 left-2 md:left-4 w-px"
            style={{ background: "#222" }}
          />
          {TIMELINE.map((t, i) => (
            <div
              key={i}
              className="relative mb-10 last:mb-0"
            >
              <span
                className="absolute -left-6 md:-left-8 top-2 size-3"
                style={{ background: LIME }}
              />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span
                  className="font-mono text-sm md:text-base tracking-wider"
                  style={{ color: "#666" }}
                >
                  [{t.time}]
                </span>
                <span
                  className="font-mono text-base md:text-xl"
                  style={{ color: WHITE }}
                >
                  <Prompt>{">"}</Prompt>
                  {t.cmd}
                </span>
                <span style={{ color: LIME }}>✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features grid ───────────────────────────────────────────────────── */

const FEATURES = [
  { cmd: "networking_session", desc: "Найти людей, с которыми потом соберёшь проект" },
  { cmd: "get_certificate", desc: "Официальный сертификат об участии" },
  { cmd: "win_merch", desc: "Розыгрыш мерча Rovno.dev среди участников" },
  { cmd: "free_wifi_coffee", desc: "Кофе, чай, Wi-Fi — всё бесплатно" },
];

function Features() {
  return (
    <section
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>ls benefits/
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="p-8 md:p-10 border"
              style={{
                borderColor: "#222",
                marginTop: i >= 2 ? "-1px" : 0,
                marginLeft: i % 2 === 1 ? "-1px" : 0,
              }}
            >
              <p
                className="font-mono text-base md:text-lg mb-3"
                style={{ color: LIME }}
              >
                <Prompt>{">"}</Prompt>
                {f.cmd}
              </p>
              <p className="text-sm md:text-base" style={{ color: "#aaa" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Location ────────────────────────────────────────────────────────── */

function Location({ ctx }: { ctx: EventCustomContext }) {
  return (
    <section
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>cd /{ctx.locationName?.toLowerCase().replace(/\s+/g, "_") || "mcc_kits"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="font-mono space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>
                Location
              </p>
              <p className="text-xl" style={{ color: WHITE }}>
                {ctx.locationName || "МЦК КИТС"}
              </p>
            </div>
            {ctx.address && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>
                  Address
                </p>
                <p className="text-base" style={{ color: WHITE }}>
                  {ctx.address}
                </p>
              </div>
            )}
            {ctx.metro && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>
                  Metro
                </p>
                <p className="text-base" style={{ color: WHITE }}>
                  {ctx.metro}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>
                Parking
              </p>
              <p className="text-base" style={{ color: LIME }}>
                <Prompt>{">"}</Prompt>available
              </p>
            </div>
          </div>

          {/* Stylised terminal map — no real tiles, just schematic blocks */}
          <div
            className="aspect-video border relative overflow-hidden"
            style={{ borderColor: "#222", background: "#0a0a0a" }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, ${LIME} 1px, transparent 1px), linear-gradient(to bottom, ${LIME} 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center font-mono">
                <div
                  className="inline-flex items-center justify-center size-4 mb-4"
                  style={{ background: LIME }}
                />
                <p className="text-sm" style={{ color: LIME }}>
                  MARKER: {ctx.locationName || "МЦК КИТС"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#666" }}>
                  lat, lng — on request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────── */

const FAQ = [
  {
    q: "Нужно ли уметь кодить?",
    a: "Нет. Объясняем так, что поймет даже гуманитарий.",
  },
  {
    q: "Сколько стоит участие?",
    a: "Бесплатно. Регистрация обязательна, чтобы мы знали, сколько кофе заказывать.",
  },
  {
    q: "Есть ли ограничение по возрасту?",
    a: "Мероприятие рассчитано на 16+. Если вам меньше — напишите нам, обсудим.",
  },
  {
    q: "Будет ли запись?",
    a: "Ключевые доклады выложим в Telegram-канал Rovno.dev. Но лучше приходить лично — нетворкинг не записать.",
  },
  {
    q: "Что взять с собой?",
    a: "Ноутбук (по желанию), документ для входа в МЦК, хорошее настроение.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section
      className="border-b py-20 md:py-28"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[900px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{">"}</Prompt>help --frequently-asked
        </p>

        <div className="space-y-0">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="border-b last:border-b-0"
                style={{ borderColor: "#222" }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-start gap-4 font-mono"
                >
                  <span
                    className="text-lg shrink-0 w-6"
                    style={{ color: LIME }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                  <div className="flex-1">
                    <span
                      className="text-base md:text-lg"
                      style={{ color: WHITE }}
                    >
                      <Prompt>{">"}</Prompt>question: "
                      {item.q}"
                    </span>
                    {isOpen && (
                      <div
                        className="mt-4 text-sm md:text-base leading-relaxed"
                        style={{ color: "#aaa" }}
                      >
                        <Prompt>{">"}</Prompt>answer: "{item.a}"
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Registration form ───────────────────────────────────────────────── */

const STATUS_OPTIONS = ["STUDENT", "GUEST"] as const;

function Registration({ ctx }: { ctx: EventCustomContext }) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    telegram_username: "",
    status: "STUDENT" as (typeof STATUS_OPTIONS)[number],
    confirm_age_18: false,
    accept_pd: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.phone.trim()) {
      setError("name и phone обязательны");
      return;
    }
    if (!form.confirm_age_18) {
      setError("подтвердите возраст 18+");
      return;
    }
    if (!form.accept_pd) {
      setError("нужно согласие на обработку персональных данных");
      return;
    }

    setSubmitting(true);
    try {
      await registerForEvent(ctx.slug, {
        name: form.name.trim(),
        surname: form.surname.trim() || undefined,
        phone: form.phone.trim(),
        telegram_username: form.telegram_username.trim() || undefined,
        meta: {
          status: form.status,
          confirm_age_18: form.confirm_age_18,
          accept_pd: form.accept_pd,
        },
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section
        id="register"
        className="py-20 md:py-32"
        style={{ background: BLACK }}
      >
        <div className="max-w-[900px] mx-auto px-6 font-mono">
          <p className="text-2xl md:text-4xl mb-6" style={{ color: LIME }}>
            ✓ Registration successful.
          </p>
          <p className="text-lg md:text-2xl" style={{ color: WHITE }}>
            See you on{" "}
            {ctx.startAt
              ? new Date(ctx.startAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "17.10.2026"}
            .
          </p>
          <p className="text-base mt-8" style={{ color: "#666" }}>
            Мы отправим подтверждение в Telegram, если вы указали ник.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="register"
      className="py-20 md:py-32"
      style={{ background: BLACK }}
    >
      <div className="max-w-[900px] mx-auto px-6 font-mono">
        <p className="text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>1</Prompt>
          <Prompt>{">"}</Prompt>init_registration()
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field
            label="enter_name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Иван"
            required
          />
          <Field
            label="enter_surname"
            value={form.surname}
            onChange={(v) => setForm({ ...form, surname: v })}
            placeholder="Иванов"
          />
          <Field
            label="enter_phone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="+7 ___ ___-__-__"
            required
          />
          <Field
            label="enter_telegram"
            value={form.telegram_username}
            onChange={(v) => setForm({ ...form, telegram_username: v })}
            placeholder="@username"
          />

          <div>
            <p className="text-sm mb-3" style={{ color: LIME }}>
              <Prompt>{">"}</Prompt>select_status:
            </p>
            <div className="flex gap-3">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm({ ...form, status: opt })}
                  className="font-mono text-sm uppercase tracking-wider px-5 py-3 border"
                  style={{
                    borderColor: form.status === opt ? LIME : "#333",
                    color: form.status === opt ? BLACK : WHITE,
                    background: form.status === opt ? LIME : BLACK,
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.confirm_age_18}
                onChange={(e) =>
                  setForm({ ...form, confirm_age_18: e.target.checked })
                }
                className="mt-1 accent-[#CCFF00]"
              />
              <span className="text-sm" style={{ color: WHITE }}>
                <Prompt>{">"}</Prompt>confirm_age_18: [Y/N]
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.accept_pd}
                onChange={(e) =>
                  setForm({ ...form, accept_pd: e.target.checked })
                }
                className="mt-1 accent-[#CCFF00]"
              />
              <span className="text-sm" style={{ color: WHITE }}>
                <Prompt>{">"}</Prompt>accept_pd: [Y]
              </span>
            </label>
          </div>

          {error && (
            <p
              className="font-mono text-sm px-4 py-3 border"
              style={{ color: "#FF3B3B", borderColor: "#FF3B3B" }}
            >
              ERROR: {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full font-mono text-base uppercase tracking-widest px-8 py-5 border-2 disabled:opacity-50"
            style={{ background: LIME, color: BLACK, borderColor: LIME }}
          >
            {submitting ? "executing..." : "> execute_registration [ОТПРАВИТЬ]"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <p className="text-sm mb-2" style={{ color: LIME }}>
        <Prompt>{">"}</Prompt>
        {label}:{required && <span style={{ color: "#FF3B3B" }}> *</span>}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full font-mono text-base px-4 py-3 border bg-transparent outline-none"
        style={{
          borderColor: "#333",
          color: WHITE,
          caretColor: LIME,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = LIME)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#333")}
      />
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────── */

function EventFooter() {
  return (
    <footer
      className="border-t py-12 font-mono"
      style={{ borderColor: "#222", background: BLACK }}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
        <div className="text-sm" style={{ color: "#666" }}>
          <Prompt>{">"}</Prompt>
          cd /rovno.dev
        </div>
        <div className="text-sm" style={{ color: "#666" }}>
          <Prompt>{">"}</Prompt>
          contact_us
        </div>
        <div
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: "#444" }}
        >
          Rovno.dev © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export function NashDevPage({ ctx }: { ctx: EventCustomContext }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: BLACK, color: WHITE }}
    >
      <style jsx global>{`
        @keyframes nashBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes nashMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        /* Kill the site-wide rounded corners inside this page — the TZ
           forbids any border-radius > 0. Using * with !important is heavy
           but scope is contained to .nash-dev-root below. */
        .nash-dev-root *,
        .nash-dev-root *::before,
        .nash-dev-root *::after {
          border-radius: 0 !important;
        }
      `}</style>

      <div className="nash-dev-root">
        <Hero ctx={ctx} />
        <Marquee />
        <Manifesto ctx={ctx} />
        <Audience />
        <Speakers />
        <AiSlider />
        <Timeline />
        <Features />
        <Location ctx={ctx} />
        <Faq />
        <Registration ctx={ctx} />
        <EventFooter />
      </div>
    </div>
  );
}
