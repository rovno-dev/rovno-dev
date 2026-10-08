"use client";

import { useEffect, useRef, useState } from "react";
import type { EventCustomContext } from "./event-custom-pages";
import { registerForEvent } from "@/utils/api/events";
import Image from "next/image";
import { NashDevLogo } from "@/components/icons/logotypes/nash-dev-logo";
import { useLanguage } from "@/providers/language-provider";
import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   Наш.Dev — Terminal Brutalism landing.
   ═══════════════════════════════════════════════════════════════════════ */

const LIME = "#CCFF00";
const BLACK = "#000000";
const WHITE = "#FFFFFF";

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
      style={{ background: LIME, animation: "nashBlink 1s steps(1) infinite" }}
    />
  );
}

/* ── Hero ────────────────────────────────────────────────────────────── */

const HERO_LINE = "> КОНФЕРЕНЦИЯ ДЛЯ СОЗДАТЕЛЕЙ БУДУЩЕГО_";

function Hero({ ctx }: { ctx: EventCustomContext }) {
  const [typed, setTyped] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [history, setHistory] = useState<{ cmd: string; out: string[] }[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
          document.getElementById("register")?.scrollIntoView({ behavior: "smooth" });
        }, 400);
        break;
      case "speakers":
        out = ["  Листайте до блока SPEAKERS ↓"];
        setTimeout(() => {
          document.getElementById("speakers")?.scrollIntoView({ behavior: "smooth" });
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
      className="relative border-b pt-24 sm:pt-32 md:pt-36"
      style={{ borderColor: "#222", paddingBottom: "60px" }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-mono uppercase tracking-[0.2em] mb-8"
          style={{ color: LIME }}
        >
          <span>events</span>
          <span style={{ color: "#444" }}>{"//"}</span>
        </div>

        <NashDevLogo className="h-auto w-full sm:h-18 sm:w-auto mb-10" />

        <h1
          className="font-mono text-[2rem] md:text-[3.5rem] lg:text-[4.5rem] leading-[1.05] tracking-tight mb-8"
          style={{ color: WHITE, minHeight: "1.2em" }}
        >
          {typed}
          {!showInput && <Cursor />}
        </h1>

        <p className="font-mono text-sm md:text-base mb-12" style={{ color: "#888" }}>
          {"// "}
          {ctx.locationName || "МЦК КИТС"} _{ctx.startAt ? new Date(ctx.startAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).toUpperCase() : "23 ОКТЯБРЯ 2026 13:00-15:00"}
        </p>

        {showInput && (
          <div
            className="hidden md:block border mb-10 font-mono text-sm"
            style={{ borderColor: "#222", background: "#0a0a0a" }}
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "#222" }}>
              <span className="size-2 rounded-none" style={{ background: LIME }} />
              <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#666" }}>
                terminal — nash.dev
              </span>
            </div>
            <div className="p-4 max-h-[240px] overflow-y-auto" style={{ color: WHITE }}>
              {history.map((h, i) => (
                <div key={i} className="mb-2">
                  <div>
                    <Prompt>{"$"}</Prompt>
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
                <Prompt>{"$"}</Prompt>
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
  const items = ["НАШ.DEV", "23 ОКТЯБРЯ", "МЦК КИТС", "БЕСПЛАТНО", "РЕГИСТРАЦИЯ ОТКРЫТА"];
  const line = items.join("  //  ") + "  //  ";
  return (
    <div className="overflow-hidden border-b" style={{ borderColor: "#222", background: LIME, color: BLACK }}>
      <div className="flex py-3 whitespace-nowrap font-mono text-sm md:text-base uppercase tracking-[0.2em]">
        <div className="flex shrink-0" style={{ animation: "nashMarquee 40s linear infinite" }}>
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="px-6">{line}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Manifesto ───────────────────────────────────────────────────────── */

function Manifesto({ ctx }: { ctx: EventCustomContext }) {
  return (
    <section id="about" className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6 font-mono">
        <p className="text-base md:text-lg mb-10" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>О событии
        </p>
        <p className="text-xl md:text-3xl leading-snug mb-10 max-w-[900px]" style={{ color: WHITE }}>
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
          <Prompt>{"$"}</Prompt>ls -la
        </p>
        <p className="text-base md:text-xl" style={{ color: WHITE }}>
          ~15 мин доклад&nbsp;&nbsp;|&nbsp;&nbsp;интерактив&nbsp;&nbsp;|&nbsp;&nbsp;0% банальщины и скукоты
        </p>
      </div>
    </section>
  );
}

/* ── Audience (styled like speakers) ─────────────────────────────────── */

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
  {
    code: "CAREER_SWITCHER",
    title: "Меняет профессию",
    desc: "Работал в другой сфере, хочешь перейти в IT. Здесь — люди, которые уже это сделали.",
  },
];

function Audience() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Кто может участвовать?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "#222" }}>
          {AUDIENCE.map((a) => (
            <div
              key={a.code}
              className="p-6 md:p-8"
              style={{ background: BLACK }}
            >
              {/* Code label — same framing as speakers */}
              <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "#666" }}>
                {"{ "}
                {a.code}
                {" }"}
              </p>
              <h3
                className="font-mono text-xl md:text-2xl mb-3 tracking-tight"
                style={{ color: WHITE }}
              >
                {a.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: "#aaa" }}>
                {a.desc}
              </p>
            </div>
          ))}
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
  avatar_url: string;
}

const SPEAKERS: Speaker[] = [
  {
    name: "Михаил Лапаев",
    role: "CMO · Rovno.dev",
    fact: "$ curl 'https://projects/done'",
    bio: "Отвечает за продуктовую стратегию агентства. Разбирает, как из идеи сделать продукт, а не презентацию.",
    avatar_url: "/images/events/nash-dev-2026/speaker-mikhail.png",
  },
  {
    name: "Нияз Гимадиев",
    role: "CTO · Rovno.dev, Founder Unidoka",
    fact: "$ bash ./Amorfa, ./unidoka.com, ./Vershiny",
    bio: "Архитектор систем и автор открытого фреймворка Amorfa. Расскажет про разницу между ИИ со знаниями и без.",
    avatar_url: "/images/events/nash-dev-2026/speaker-niyaz.png",
  },
  {
    name: "Данил Киткин",
    role: "Арт-директор · Rovno.dev",
    fact: "$ cat ./design.md ./3d.md ./motion.md",
    bio: "3D-художник и моушн-дизайнер. Покажет, как рождаются ролики и 3D-сцены без бюджета Marvel.",
    avatar_url: "/images/events/nash-dev-2026/speaker-danil.png",
  },
  {
    name: "Жанара Семенова",
    role: "Менеджер проектов в науке и образовании · Yandex Cloud | Преподаватель · ИТИС КФУ",
    fact: "$ docker compose --profile no-stress up",
    bio: "Развивает науку по всей России и СНГ. Готовит людей для светлого будущего. Всегда с улыбкой.",
    avatar_url: "/images/events/nash-dev-2026/speaker-janara.png",
  },
  {
    name: "Амир Бадрутдинов",
    role: "Активист | Журналист | Спортсмен",
    fact: "$ sudo echo << age = 17 > /usr/user.conf",
    bio: "Самый молодой спикер. В 17 лет делает так, чтобы мир реагировал на его действия, а не он на действия этого мира.",
    avatar_url: "/images/events/nash-dev-2026/speaker-amir.png",
  },
  {
    name: "Анастасия Пугачева",
    role: "CEO · Vizionix | Dancer | UX/UI Designer",
    fact: "$ make --startup --get-grant",
    bio: "Основатель стартапа Visionix. Двигается хорошо не только в бизнесе, но и на танцевальных конкурсах.",
    avatar_url: "/images/events/nash-dev-2026/speaker-anastasia.png",
  },
];

function Speakers() {
  const [open, setOpen] = useState<Speaker | null>(null);
  return (
    <section id="speakers" className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Спикеры
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              {/* Square frame owns the layout — every card's image is the
                  same height regardless of the source file's natural
                  dimensions, and stays fluid on resize. `fill` + a sized
                  parent is the correct next/image pattern here: width/
                  height props alone only set intrinsic dimensions and
                  let the rendered box drift with the source aspect. */}
              <div
                className="relative aspect-square w-full mb-6 overflow-hidden"
                style={{
                  background:
                    "repeating-conic-gradient(#222 0% 25%, #111 0% 50%) 50% / 8px 8px",
                }}
              >
                <Image
                  src={s.avatar_url}
                  alt={s.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "#666" }}>
                {"{"}
              </p>
              <p className="font-mono text-sm mb-1" style={{ color: LIME }}>name:</p>
              <p className="font-mono text-lg mb-4" style={{ color: WHITE }}>"{s.name}"</p>
              <p className="font-mono text-sm mb-1" style={{ color: LIME }}>role:</p>
              <p className="font-mono text-sm mb-4" style={{ color: "#aaa" }}>"{s.role}"</p>
              <p className="font-mono text-sm mb-1" style={{ color: LIME }}>short_fact:</p>
              <p className="font-mono text-sm mb-4" style={{ color: "#aaa" }}>"{s.fact}"</p>
              <p className="font-mono text-xs uppercase tracking-[0.2em] mt-6" style={{ color: "#666" }}>
                {"}"}
              </p>
            </button>
          ))}
        </div>
      </div>

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
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "#222" }}>
              <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "#666" }}>
                README.md — {open.name}
              </span>
              <button onClick={() => setOpen(null)} className="text-lg" style={{ color: "#666" }}>
                ✕
              </button>
            </div>
            <h3 className="text-2xl mb-2" style={{ color: WHITE }}># {open.name}</h3>
            <p className="text-sm mb-6" style={{ color: LIME }}>## {open.role}</p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#ddd" }}>{open.bio}</p>
            <p className="text-sm" style={{ color: "#666" }}>{open.fact}</p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── AI slider (clip-path split) ─────────────────────────────────────── */

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
    const onMove = (e: MouseEvent) => dragging.current && update(e.clientX);
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
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-4" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Один инструмент. Два принципиально разных результата.
        </p>
        <div
          ref={trackRef}
          className="relative w-full aspect-[16/9] border select-none overflow-hidden touch-none"
          style={{ borderColor: "#222" }}
        >
          {/* LEFT (muted) — baseline. Full frame, so it is what shows through
              when the split sits at 0%. */}
          <div
            className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end overflow-hidden"
            style={{ background: "#111" }}
          >
            {/* Ambient iconography — reads as a warning schematic sitting
                behind the copy. Kept under 0.2 opacity so it never competes
                with the text. */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none select-none"
              style={{ color: "#444" }}
            >
              {/* Warning triangle, top-right */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="absolute top-6 right-6 size-24 md:size-40"
                style={{ opacity: 0.16 }}
              >
                <path d="M12 3 2 20h20L12 3Z" />
                <path d="M12 9v5" />
                <circle cx="12" cy="17" r="0.7" fill="currentColor" />
              </svg>
              {/* Broken chain, bottom-right */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute bottom-10 right-6 size-20 md:size-28"
                style={{ opacity: 0.12 }}
              >
                <path d="M9 15 6 18a3 3 0 0 1-4-4l3-3" />
                <path d="M15 9l3-3a3 3 0 0 1 4 4l-3 3" />
                <path d="M3 3l18 18" />
              </svg>
              {/* Monospace fragment, top-left */}
              <span
                className="absolute top-8 left-8 font-mono text-[3rem] md:text-[5rem] leading-none"
                style={{ opacity: 0.10 }}
              >
                /ERR
              </span>
              {/* Faint schematic lines */}
              <svg
                viewBox="0 0 200 200"
                className="absolute -bottom-10 -left-10 w-[240px] h-[240px] md:w-[360px] md:h-[360px]"
                style={{ opacity: 0.08 }}
              >
                {[40, 70, 100, 130, 160].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="200"
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeDasharray="2 6"
                  />
                ))}
              </svg>
            </div>
            <div className="relative">
              <p
                className="font-mono text-[11px] md:text-xs uppercase tracking-[0.24em] mb-3"
                style={{ color: "#666" }}
              >
                AI_WITHOUT_ARCHITECTURE
              </p>
              <p
                className="font-mono text-xl md:text-3xl mb-3 leading-snug"
                style={{ color: "#8a8a8a" }}
              >
                Технический долг.
                <br />
                Нулевая поддерживаемость.
              </p>
              <p
                className="text-sm md:text-base max-w-[420px] leading-relaxed"
                style={{ color: "#555" }}
              >
                Код компилируется, но не выдерживает нагрузку реальных сценариев.
              </p>
            </div>
          </div>
          {/* RIGHT (lime) — full-size, clipped to reveal only the right portion */}
          <div
            className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end overflow-hidden"
            style={{
              background: LIME,
              color: BLACK,
              clipPath: `inset(0 0 0 ${pos}%)`,
            }}
          >
            {/* Ambient iconography — validated / shipped signals. */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none select-none"
              style={{ color: "#2b2b00" }}
            >
              {/* Shield with check, top-right */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                className="absolute top-6 right-6 size-24 md:size-40"
                style={{ opacity: 0.18 }}
              >
                <path d="M12 2 4 5v7c0 5 3.6 9 8 10 4.4-1 8-5 8-10V5l-8-3Z" />
                <path d="m8.5 12 2.4 2.4 4.6-4.6" />
              </svg>
              {/* Terminal OK, bottom-right */}
              <span
                className="absolute bottom-10 right-6 font-mono text-[2.5rem] md:text-[4.5rem] leading-none"
                style={{ opacity: 0.14 }}
              >
                $ _OK
              </span>
              {/* Compliance checklist, top-left */}
              <div
                className="absolute top-8 left-8 flex flex-col gap-1.5 font-mono text-xs md:text-sm"
                style={{ opacity: 0.34 }}
              >
                <span>{"\u2713"} production-ready</span>
                <span>{"\u2713"} horizontal scaling</span>
                <span>{"\u2713"} maintainable surface</span>
              </div>
            </div>
            {/* Content pinned to the right so it doesn't reflow on drag. */}
            <div className="ml-auto text-right max-w-[520px] relative">
              <p
                className="font-mono text-[11px] md:text-xs uppercase tracking-[0.24em] mb-3"
                style={{ color: "#2b2b00" }}
              >
                AI_PLUS_ENGINEERING
              </p>
              <p className="font-mono text-xl md:text-3xl mb-3 leading-snug">
                Черновик модели.
                <br />
                Промышленное качество.
              </p>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: "#2b2b00" }}
              >
                Модель ускоряет старт. Инженер обеспечивает надёжность и масштаб.
              </p>
            </div>
          </div>
          {/* Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-10"
            style={{ left: `${pos}%`, background: WHITE, transform: "translateX(-2px)" }}
            onMouseDown={() => (dragging.current = true)}
            onTouchStart={() => (dragging.current = true)}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 flex items-center justify-center font-mono text-sm select-none"
              style={{ background: WHITE, color: BLACK }}
            >
              {"\u21C4"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Timeline (dots aligned to the line) ─────────────────────────────── */

const TIMELINE = [
  { time: "13:10", cmd: "./Презентация-Юнидоки --speakers 'Niyaz Gimadiev'" },
  { time: "13:25", cmd: "./Менеджмент_rovno_dev --speakers 'Mikhail Lapaev' 'Danil Kitkin'" },
  { time: "13:40", cmd: "./Поддержка_проектов_от_Yandex-Cloud --speakers Janara Semenova" },
  { time: "14:10", cmd: "./Перерыв --period '10min'" },
  { time: "14:20", cmd: "./Как-начать-своё-дело --speakers 'Анастасия Пугачёва'" },
  { time: "14:35", cmd: "./Что такое активность, и что это дает? --speakers 'Амир Батрутдинов'" },
  { time: "14:50", cmd: "./Розыгрыш-Яндекс-Станции" },
  { time: "15:00", cmd: "make networking" },
];

function Timeline() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Таймлайн
        </p>

        {/* Both the vertical rail and the dots live in the same coordinate
            space so the dots sit centred on the line. Line at x=6px
            (left-1.5), dot 12×12 anchored at x=0 → dot centre at 6px. */}
        <div className="relative">
          <div
            className="absolute top-2 bottom-2 w-px"
            style={{ left: "6px", background: "#222" }}
          />
          {TIMELINE.map((t, i) => (
            <div key={i} className="relative pl-8 mb-10 last:mb-0">
              <span
                className="absolute top-2 size-3"
                style={{ left: 0, background: LIME }}
              />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-mono text-[0.65rem] md:text-[0.85rem] tracking-wider" style={{ color: "#666" }}>
                  [{t.time}]
                </span>
                <span className="font-mono text-base md:text-md" style={{ color: WHITE }}>
                  <Prompt>{"$"}</Prompt>
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

/* ── Features ────────────────────────────────────────────────────────── */

const FEATURES = [
  { cmd: "networking", desc: "Найти людей, с которыми потом соберёшь проект." },
  { cmd: "get_certificate", desc: "Официальный сертификат об участии (по запросу)." },
  { cmd: "win_kolonka", desc: "Розыгрыш Яндекс Станции за лучший вопрос." },
  { cmd: "contact_speakers", desc: "Общение со спикерами после выступления." },
];

function Features() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Преимущества
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "#222" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="p-8 md:p-10" style={{ background: BLACK }}>
              <p className="font-mono text-base md:text-lg mb-3" style={{ color: LIME }}>
                <Prompt>{"$"}</Prompt>
                {f.cmd}
              </p>
              <p className="text-sm md:text-base" style={{ color: "#aaa" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Location ────────────────────────────────────────────────────────── */
// Yandex Map embed for the venue. If the iframe never fires `onLoad`
// (blocked by a corporate proxy, DNS failure, embed endpoint down), we
// swap to Google Maps after a short grace period. We can't rely on
// `onError` for cross-origin iframes — it fires for network errors but
// not for blocked frames — so the timeout is the real trigger.
const YANDEX_MAP_SRC =
  "https://yandex.ru/map-widget/v1/?um=constructor%3Ac65a3696f6811e8fdf9a467d8657d05efab313aee6808b886bebb2138cf28370&source=constructor";
const GOOGLE_MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2242.5166000790605!2d49.17465141284107!3d55.80163137299019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x415eb281ef8e4d65%3A0x5b12cc06fe4a5dfe!2z0JrQsNC30LDQvdGB0LrQuNC5INGC0LXRhdC90LjQutGD0Lwg0LjQvdGE0L7RgNC80LDRhtC40L7QvdC90YvRhSDRgtC10YXQvdC-0LvQvtCz0LjQuSDQuCDRgdCy0Y_Qt9C4!5e0!3m2!1sen!2sru!4v1791396027142!5m2!1sen!2sru";
const MAP_FALLBACK_MS = 4000;
// Venue coordinates extracted from the Google Maps embed. Shared by
// both “build a route” deep links below so a venue move is a
// one-line edit here.
const VENUE_LAT = 55.801339;
const VENUE_LON = 49.177800;
function MapEmbed() {
  // `provider` flips to "google" the moment the Yandex frame is judged
  // dead. `loaded` guards against a late onLoad from a Yandex frame that
  // was already replaced — once we've fallen back, we ignore it.
  const [provider, setProvider] = useState<"yandex" | "google">("yandex");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (provider !== "yandex" || loaded) return;
    const t = setTimeout(() => {
      // Double-check: if onLoad already fired we would have bailed, but a
      // race between the timer and the load event is possible on slow
      // connections. Reading the ref-free `loaded` state here is fine —
      // the closure captures the value at effect-run time, and the effect
      // re-runs whenever `loaded` changes.
      setProvider("google");
    }, MAP_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [provider, loaded]);
  const src = provider === "yandex" ? YANDEX_MAP_SRC : GOOGLE_MAP_SRC;
  return (
    <iframe
      key={provider}
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      title="Карта — место проведения"
      onLoad={() => setLoaded(true)}
      onError={() => setProvider("google")}
      className="rounded-xl!"
    />
  );
}
function Location({ ctx }: { ctx: EventCustomContext }) {
  const { t, lang } = useLanguage();
  // Yandex takes a full locale (ru_RU / en_US); Google takes a bare
  // two-letter code. Both route deep-links point at the same coordinates
  // the map embed uses, so the two never drift out of sync.
  const yandexLang = lang === "ru" ? "ru_RU" : "en_US";
  const yandexRouteUrl = `https://yandex.ru/maps/?rtext=~${VENUE_LAT},${VENUE_LON}&rtt=auto&lang=${yandexLang}`;
  const googleRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${VENUE_LAT},${VENUE_LON}&hl=${lang}`;
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Локация {ctx.locationName?.toLowerCase().replace(/\s+/g, "_") || "{mcc_kits}"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="font-mono space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>Адрес</p>
              <p className="text-xl" style={{ color: WHITE }}>Казань, ул. Бари Галеева, 3а</p>
            </div>
            {ctx.locationName && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>Место</p>
                <p className="text-base" style={{ color: WHITE }}>{ctx.locationName}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#666" }}>Остановка</p>
              <p className="text-base" style={{ color: WHITE }}>Советская Площадь</p>
            </div>
            {/* Route buttons — two providers, one row. Terminal-style
                outlined pills that light up in LIME on hover, matching the
                rest of the page's interactive language. Both open in a new
                tab so the reader doesn't lose their place on the landing. */}
            <div className="pt-4 mt-2 border-t space-y-3" style={{ borderColor: "#222" }}>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: "#666" }}>
                <Prompt>{"$"}</Prompt>{t("events.route_hint")}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={yandexRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] px-4 py-2.5 border transition-colors"
                  style={{ borderColor: "#333", color: WHITE }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = LIME;
                    e.currentTarget.style.color = LIME;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#333";
                    e.currentTarget.style.color = WHITE;
                  }}
                >
                  {t("events.route_yandex")}
                  <ArrowUpRight size={14} weight="bold" />
                </a>
                <a
                  href={googleRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] px-4 py-2.5 border transition-colors"
                  style={{ borderColor: "#333", color: WHITE }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = LIME;
                    e.currentTarget.style.color = LIME;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#333";
                    e.currentTarget.style.color = WHITE;
                  }}
                >
                  {t("events.route_google")}
                  <ArrowUpRight size={14} weight="bold" />
                </a>
              </div>
            </div>
          </div>
          <div className="aspect-4/3 border relative overflow-hidden rounded-xl!" style={{ borderColor: "#222", background: "#0a0a0a" }}>
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, ${LIME} 1px, transparent 1px), linear-gradient(to bottom, ${LIME} 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapEmbed />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────── */

const FAQ = [
  { q: "Нужны ли знания для понимания докладов?", a: "Нет. Объясняем так, что поймет даже тот, кто зашёл случайно." },
  { q: "Сколько стоит участие?", a: "Бесплатно. Регистрация обязательна, чтобы мы точно тебя пропустили." },
  { q: "Есть ли ограничение по возрасту?", a: "Мероприятие рассчитано на 16+. Если вам меньше — напишите нам, обсудим (rovno.dev@gmail.com)." },
  { q: "Будет ли запись?", a: "Ключевые доклады выложим в ВК Видео и Youtube Вершин. Но лучше приходить лично — нетворкинг не записать." },
  { q: "Что взять с собой?", a: "Документ подтверждающий личность, хорошее настроение." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[900px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Вопрос-ответ
        </p>

        <div>
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b last:border-b-0" style={{ borderColor: "#222" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-start gap-4 font-mono"
                >
                  <span className="text-lg shrink-0 w-6" style={{ color: LIME }}>
                    {isOpen ? "−" : "+"}
                  </span>
                  <div className="flex-1">
                    <span className="text-base md:text-lg" style={{ color: WHITE }}>
                      <Prompt>{"$"}</Prompt>question: "{item.q}"
                    </span>
                    {isOpen && (
                      <div className="mt-4 text-sm md:text-base leading-relaxed" style={{ color: "#aaa" }}>
                        <Prompt>{"$"}</Prompt>answer: "{item.a}"
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

/* ── Registration ────────────────────────────────────────────────────── */

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
      setError("подтвердите возраст 16+");
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
      <section id="register" className="py-20 md:py-32" style={{ background: BLACK }}>
        <div className="max-w-[900px] mx-auto px-6 font-mono">
          <p className="text-2xl md:text-4xl mb-6" style={{ color: LIME }}>
            ✓ Registration successful.
          </p>
          <p className="text-lg md:text-2xl" style={{ color: WHITE }}>
            See you on{" "}
            {ctx.startAt
              ? new Date(ctx.startAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
              : "23.10.2026"}
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
    <section id="register" className="py-20 md:py-32" style={{ background: BLACK }}>
      <div className="max-w-[900px] mx-auto px-6 font-mono">
        <p className="text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>init_registration()
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="enter_name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Иван" required />
          <Field label="enter_surname" value={form.surname} onChange={(v) => setForm({ ...form, surname: v })} placeholder="Иванов" />
          <Field label="enter_phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+7 ___ ___-__-__" required />
          <Field label="enter_telegram" value={form.telegram_username} onChange={(v) => setForm({ ...form, telegram_username: v })} placeholder="@username" />

          <div>
            <p className="text-sm mb-3" style={{ color: LIME }}>
              <Prompt>{"$"}</Prompt>Кто ты?:
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

          {/* Age confirmation — plain terminal-style toggle. */}
          <label className="flex items-start gap-3 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={form.confirm_age_18}
              onChange={(e) => setForm({ ...form, confirm_age_18: e.target.checked })}
              className="mt-1 accent-[#CCFF00] size-4"
            />
            <span className="text-sm leading-relaxed" style={{ color: WHITE }}>
              <Prompt>{"$"}</Prompt>confirm_age_16: подтверждаю, что мне 16 лет или больше
            </span>
          </label>

          {/* Legal consent — mirrors the site-wide order form so the consent
              language is identical across every form on the domain. Links
              open in a new tab; the user can read the policy without losing
              the form state. */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.accept_pd}
              onChange={(e) => setForm({ ...form, accept_pd: e.target.checked })}
              className="mt-1 accent-[#CCFF00] size-4"
            />
            <span className="text-sm leading-relaxed" style={{ color: WHITE }}>
              <Prompt>{"$"}</Prompt>accept_pd: даю{" "}
              <a
                href="/docs/consent"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: LIME }}
              >
                согласие на обработку персональных данных
              </a>{" "}
              и подтверждаю ознакомление с{" "}
              <a
                href="/docs/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: LIME }}
              >
                Политикой конфиденциальности
              </a>{" "}
              и{" "}
              <a
                href="/docs/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: LIME }}
              >
                Пользовательским соглашением
              </a>
              .
            </span>
          </label>

          {error && (
            <p className="font-mono text-sm px-4 py-3 border" style={{ color: "#FF3B3B", borderColor: "#FF3B3B" }}>
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
        <Prompt>{"$"}</Prompt>
        {label}:{required && <span style={{ color: "#FF3B3B" }}> *</span>}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full font-mono text-base px-4 py-3 border bg-transparent outline-none"
        style={{ borderColor: "#333", color: WHITE, caretColor: LIME }}
        onFocus={(e) => (e.currentTarget.style.borderColor = LIME)}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#333")}
      />
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────── */

function EventFooter() {
  return (
    <footer className="border-t py-12 font-mono" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
        <div className="text-sm" style={{ color: "#666" }}>
          <Prompt>{"$"}</Prompt>cd /rovno.dev
        </div>
        <div className="text-sm" style={{ color: "#666" }}>
          <Prompt>{"$"}</Prompt>make event --type "cool"
        </div>
        <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "#444" }}>
          Rovno.dev x <span><Link href='https://unidoka.com'>Юнидока</Link></span> x <span><Link href='https://unidoka.com/vershiny'>Вершины</Link></span> © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}

/* ── Root ────────────────────────────────────────────────────────────── */

export function NashDevPage({ ctx }: { ctx: EventCustomContext }) {
  return (
    <div className="min-h-screen" style={{ background: BLACK, color: WHITE }}>
      <style jsx global>{`
        @keyframes nashBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes nashMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
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
