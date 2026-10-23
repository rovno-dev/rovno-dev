"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { EventCustomContext } from "./event-custom-pages";
import Image from "next/image";
import { NashDevLogo } from "@/components/icons/logotypes/nash-dev-logo";
import { useLanguage } from "@/providers/language-provider";
import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";

const LIME = "#CCFF00";
const BLACK = "#000000";
const WHITE = "#FFFFFF";

// ── Media links ───────────────────────────────────────────────────
// TODO: replace the empty VK/OID/ID and YouTube ID after publishing.
// The VideoEmbed component auto-falls back to YouTube after 4s if VK
// doesn't load or is missing credentials.
const VK_VIDEO_OID = "";
const VK_VIDEO_ID = "";
const YOUTUBE_VIDEO_ID = "";
const VK_VIDEO_LINK = "https://vkvideo.ru/";
const YOUTUBE_LINK = "https://youtube.com/";
const VK_GALLERY_LINK = "https://vk.com/albums";
const PRESENTATION_LINK = "https://nd-2026.slides.rovno.dev";

const REELS = [
  { src: "/videos/socials/short-videos-1.webm", title: "Выпуск 01" },
  { src: "/videos/socials/short-videos-2.webm", title: "Выпуск 02" },
  { src: "/videos/socials/short-videos-3.webm", title: "Выпуск 03" },
  { src: "/videos/socials/short-videos-2.webm", title: "Выпуск 04" },
  { src: "/videos/socials/short-videos-1.webm", title: "Выпуск 05" },
];

const GALLERY = [
  "/images/events/nash-dev-2026/speaker-mikhail.png",
  "/images/events/nash-dev-2026/speaker-niyaz.png",
  "/images/events/nash-dev-2026/speaker-danil.png",
  "/images/events/nash-dev-2026/speaker-amir.png",
  "/images/events/nash-dev-2026/speaker-anastasia.png",
  "/images/events/nash-dev-2026/speaker-secret.png",
];

// ── Shared UI primitives ─────────────────────────────────────────
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

// ── Hero (post-event) ────────────────────────────────────────────
const HERO_LINE = "> СОБЫТИЕ ЗАВЕРШЕНО_";

function Hero({ ctx }: { ctx: EventCustomContext }) {
  const [typed, setTyped] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [history, setHistory] = useState<{ cmd: string; out: string[] }[]>([]);
  const [draft, setDraft] = useState("");

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
          "  help       - список команд",
          "  about      - о мероприятии",
          "  video      - запись",
          "  photos     - фотографии",
          "  slides     - презентация",
          "  speakers   - список спикеров",
          "  location   - где и когда",
          "  clear      - очистить терминал",
        ];
        break;
      case "about":
        out = [
          "  Наш.Dev - ивент для тех, кто устал от лекций.",
          "  15 мин доклад + 15 мин интерактив. 0% канцелярщины.",
        ];
        break;
      case "video":
        out = ["  Открываю запись..."];
        setTimeout(() => {
          document.getElementById("video")?.scrollIntoView({ behavior: "smooth" });
        }, 400);
        break;
      case "photos":
        out = ["  Открываю галерею..."];
        setTimeout(() => {
          document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
        }, 400);
        break;
      case "slides":
        out = ["  Открываю презентацию..."];
        setTimeout(() => {
          window.open(PRESENTATION_LINK, "_blank", "noopener,noreferrer");
        }, 300);
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
          {ctx.locationName || "МЦК КИТС"}_{" "}
          {ctx.startAt
            ? new Date(ctx.startAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).toUpperCase()
            : "23 ОКТЯБРЯ 2026"}
        </p>

        {showInput && (
          <div
            className="hidden md:block border mb-10 font-mono text-sm"
            style={{ borderColor: "#222", background: "#0a0a0a" }}
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "#222" }}>
              <span className="size-2 rounded-none" style={{ background: LIME }} />
              <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "#666" }}>
                terminal - nash.dev
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
            {["video", "photos", "slides", "speakers"].map((c) => (
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
            href="#video"
            className="inline-flex items-center justify-center font-mono text-sm md:text-base uppercase tracking-widest px-8 py-4 border-2"
            style={{ background: LIME, color: BLACK, borderColor: LIME }}
          >
            {"{ СМОТРЕТЬ ЗАПИСЬ_ }"}
          </a>
          <a
            href="#gallery"
            className="inline-flex items-center justify-center font-mono text-sm md:text-base uppercase tracking-widest px-8 py-4 border-2"
            style={{ borderColor: "#333", color: WHITE }}
          >
            ФОТО
          </a>
          <a
            href={PRESENTATION_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-mono text-sm md:text-base uppercase tracking-widest px-8 py-4 border-2"
            style={{ borderColor: "#333", color: WHITE }}
          >
            ПРЕЗЕНТАЦИЯ
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Marquee ──────────────────────────────────────────────────────
function Marquee() {
  const items = ["НАШ.DEV", "23 ОКТЯБРЯ 2026", "МЦК КИТС", "СОСТОЯЛОСЬ", "ЗАПИСЬ ДОСТУПНА"];
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

// ── Video recording (VK → YouTube fallback) ──────────────────────
function VideoEmbed() {
  const [provider, setProvider] = useState<"vk" | "youtube">("vk");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (provider !== "vk" || loaded) return;
    const t = setTimeout(() => setProvider("youtube"), 4000);
    return () => clearTimeout(t);
  }, [provider, loaded]);

  const vkReady = Boolean(VK_VIDEO_OID && VK_VIDEO_ID);
  const src =
    provider === "vk" && vkReady
      ? `https://vk.com/video_ext.php?oid=${VK_VIDEO_OID}&id=${VK_VIDEO_ID}&hd=2`
      : `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID || "dQw4w9WgXcQ"}?rel=0`;

  return (
    <div className="relative aspect-video border border-[#222] bg-[#0a0a0a] overflow-hidden">
      <iframe
        key={provider}
        src={src}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        title="Наш.Dev 2026 — запись"
        onLoad={() => setLoaded(true)}
        onError={() => setProvider("youtube")}
      />
    </div>
  );
}

function VideoSection() {
  return (
    <section id="video" className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Открыть запись
        </p>
        <VideoEmbed />
        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href={YOUTUBE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] px-4 py-2.5 border transition-colors"
            style={{ borderColor: "#333", color: WHITE }}
          >
            YouTube
            <ArrowUpRight size={14} weight="bold" />
          </a>
          <a
            href={VK_VIDEO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] px-4 py-2.5 border transition-colors"
            style={{ borderColor: "#333", color: WHITE }}
          >
            VK Video
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Gallery (preview + VK album link) ────────────────────────────
function GallerySection() {
  return (
    <section id="gallery" className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Фото с события
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square border border-[#222] overflow-hidden group"
            >
              <Image
                src={src}
                alt={`Фото ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a
            href={VK_GALLERY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] px-5 py-3 border transition-colors"
            style={{ borderColor: LIME, color: LIME }}
          >
            Все фото на VK
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Presentation (iframe) ───────────────────────────────────────
function PresentationSection() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Презентация
        </p>
        <div className="relative w-full h-[80vh] min-h-[500px] border border-[#222] bg-[#0a0a0a] overflow-hidden">
          <iframe
            src={PRESENTATION_LINK}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Наш.Дев 2026 — презентация"
          />
        </div>
        <div className="mt-6">
          <a
            href={PRESENTATION_LINK}
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
            Открыть в новой вкладке
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Reels carousel (5 vertical videos) ──────────────────────────
function ReelsSection() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-8" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Reels с события
        </p>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-admin">
          {REELS.map((r, i) => (
            <div
              key={i}
              className="shrink-0 w-[220px] md:w-[260px] aspect-[9/16] border relative overflow-hidden"
              style={{ borderColor: "#222", background: "#0a0a0a" }}
            >
              <video
                src={r.src}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: LIME }}>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-mono text-sm mt-1" style={{ color: WHITE }}>
                  {r.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Manifesto ────────────────────────────────────────────────────
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

// ── Audience ────────────────────────────────────────────────────
const AUDIENCE = [
  { code: "STUDENT_16-20", title: "Студент 16–20", desc: "Учишься, хочешь понять, куда идти дальше. Приходи посмотреть, как это устроено на практике." },
  { code: "NEWBIE_CODER", title: "Начинающий разработчик", desc: "Знаешь основы, но пока не понимаешь, как из этого сделать работу. Здесь — живые примеры." },
  { code: "IT_ENTHUSIAST", title: "IT-энтузиаст", desc: "Следишь за индустрией, ходишь на митапы. Тут — люди и разговоры без пафоса и презентаций." },
  { code: "CAREER_SWITCHER", title: "Меняет профессию", desc: "Работал в другой сфере, хочешь перейти в IT. Здесь — люди, которые уже это сделали." },
];

function Audience() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Кто пришёл?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "#222" }}>
          {AUDIENCE.map((a) => (
            <div key={a.code} className="p-6 md:p-8" style={{ background: BLACK }}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: "#666" }}>
                {"{ "}{a.code}{" }"}
              </p>
              <h3 className="font-mono text-xl md:text-2xl mb-3 tracking-tight" style={{ color: WHITE }}>
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

// ── Speakers ────────────────────────────────────────────────────
interface Speaker {
  name: string;
  role: string;
  fact: string;
  bio: string;
  avatar_url: string;
  link?: string;
}

const SPEAKERS: Speaker[] = [
  {
    name: "Михаил Лапаев",
    role: "CMO · Rovno.dev",
    fact: "Сделал большую часть работы по организации мероприятия",
    bio: "Отвечает за продуктовую стратегию агентства. Разбирает, как из идеи сделать продукт, а не презентацию.",
    avatar_url: "/images/events/nash-dev-2026/speaker-mikhail.png",
    link: "https://rovno_dev/RovnoMikhail",
  },
  {
    name: "Нияз Гимадиев",
    role: "CTO · Rovno.dev, Founder Unidoka",
    fact: "Сделал этот сайт за 5 минут, а с текстовкой возился 1 час",
    bio: "Архитектор систем и автор открытого фреймворка Amorfa. Расскажет про разницу между ИИ со знаниями и без.",
    avatar_url: "/images/events/nash-dev-2026/speaker-niyaz.png",
    link: "https://rovno.dev/niyazgim",
  },
  {
    name: "Данил Киткин",
    role: "Арт-директор · Rovno.dev",
    fact: "Именно он сделал весь 3D дизайн для мероприятия",
    bio: "3D-художник и моушн-дизайнер. Покажет, как рождаются ролики и 3D-сцены без космических бюджетов.",
    avatar_url: "/images/events/nash-dev-2026/speaker-danil.png",
    link: "https://rovno_dev/RovnoDanil",
  },
  {
    name: "Секретный спикер",
    role: "undefined",
    fact: "undefined",
    bio: "undefined",
    avatar_url: "/images/events/nash-dev-2026/speaker-secret.png",
  },
  {
    name: "Амир Бадрутдинов",
    role: "Активист | Журналист | Спортсмен",
    fact: "Самый молодой спикер",
    bio: "В 17 лет делает так, чтобы мир реагировал на его действия, а не он на действия этого мира.",
    avatar_url: "/images/events/nash-dev-2026/speaker-amir.png",
    link: "https://t.me/BADRAmir24",
  },
  {
    name: "Анастасия Пугачева",
    role: "CEO · ООО 'ВИЗИОНИКС' | Бизнес-аналитик | Веб-дизайнер",
    fact: "До того как стать CEO она 6 лет работала веб-дизайнером",
    bio: "6+ лет в веб-дизайне, преподаватель школы веб-дизайна Стилетика, 30+ проектов, 2+ года в бизнес-аналитике. Ей есть что рассказать.",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {SPEAKERS.map((s, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => setOpen(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(s);
                }
              }}
              className="group cursor-pointer text-left p-6 border transition-all duration-200 flex flex-col h-full w-full outline-none focus-visible:border-[#CCFF00]"
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
              <div
                className="relative aspect-square w-full mb-6 overflow-hidden shrink-0"
                style={{ background: "repeating-conic-gradient(#222 0% 25%, #111 0% 50%) 50% / 8px 8px" }}
              >
                {s.avatar_url && (
                  <Image
                    src={s.avatar_url}
                    alt={s.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <p className="font-mono text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "#666" }}>{"{"}</p>
                <p className="font-mono text-sm mb-1" style={{ color: LIME }}>name:</p>
                <p className="font-mono text-lg mb-4" style={{ color: WHITE }}>"{s.name}"</p>
                <p className="font-mono text-sm mb-1" style={{ color: LIME }}>role:</p>
                <p className="font-mono text-sm mb-4" style={{ color: "#aaa" }}>"{s.role}"</p>
                <p className="font-mono text-sm mb-1" style={{ color: LIME }}>short_fact:</p>
                <p className="font-mono text-sm mb-4" style={{ color: "#aaa" }}>"{s.fact}"</p>
                {s.link && (
                  <>
                    <p className="font-mono text-sm mb-1" style={{ color: LIME }}>link:</p>
                    <p className="font-mono text-sm mb-4">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 underline underline-offset-2 transition-opacity hover:opacity-70 break-all"
                        style={{ color: WHITE }}
                      >
                        "{s.link.replace(/^https?:\/\//, "")}"
                        <ArrowUpRight size={12} weight="bold" />
                      </a>
                    </p>
                  </>
                )}
                <p className="font-mono text-xs uppercase tracking-[0.2em] mt-auto pt-6" style={{ color: "#666" }}>{"}"}</p>
              </div>
            </div>
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
              <button onClick={() => setOpen(null)} className="text-lg" style={{ color: "#666" }}>✕</button>
            </div>
            <h3 className="text-2xl mb-2" style={{ color: WHITE }}># {open.name}</h3>
            <p className="text-sm mb-6" style={{ color: LIME }}>## {open.role}</p>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#ddd" }}>{open.bio}</p>
            <p className="text-sm mb-6" style={{ color: "#666" }}>{open.fact}</p>
            {open.link && (
              <a
                href={open.link}
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
                contact
                <ArrowUpRight size={14} weight="bold" />
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── Timeline ────────────────────────────────────────────────────
const TIMELINE = [
  { time: "13:10", cmd: "./Презентация-Юнидоки --speakers 'Niyaz Gimadiev'" },
  { time: "13:25", cmd: "./Менеджмент_rovno_dev --speakers 'Mikhail Lapaev' 'Danil Kitkin'" },
  { time: "13:40", cmd: "./Секретный-доклад --speakers $SECRETS.speaker.name" },
  { time: "14:10", cmd: "./Перерыв --period '10min'" },
  { time: "14:20", cmd: "./Ускорение-рабочих-процессов-через-ИИ --speakers 'Анастасия Пугачева'" },
  { time: "14:35", cmd: "./Что такое активность, и что это дает? --speakers 'Амир Батрутдинов'" },
  { time: "14:50", cmd: "./Розыгрыш-Яндекс-Станции" },
  { time: "15:00", cmd: "make networking" },
];

function Timeline() {
  return (
    <section className="border-b py-20 md:py-28" style={{ borderColor: "#222", background: BLACK }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="font-mono text-base md:text-lg mb-12" style={{ color: LIME }}>
          <Prompt>{"$"}</Prompt>Как прошло
        </p>
        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-2 bottom-2 w-px origin-top"
            style={{ left: "6px", background: "#222" }}
          />
          {TIMELINE.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative pl-8 mb-10 last:mb-0"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.2, type: "spring" }}
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
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.15 + 0.5 }}
                  style={{ color: LIME }}
                >
                  ✓
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Location ────────────────────────────────────────────────────
const YANDEX_MAP_SRC =
  "https://yandex.ru/map-widget/v1/?um=constructor%3Ac65a3696f6811e8fdf9a467d8657d05efab313aee6808b886bebb2138cf28370&source=constructor";
const GOOGLE_MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2242.5166000790605!2d49.17465141284107!3d55.80163137299019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x415eb281ef8e4d65%3A0x5b12cc06fe4a5dfe!2z0JrQsNC30LDQvdGB0LrQuNC5INGC0LXRhdC90LjQutGD0Lwg0LjQvdGE0L7RgNC80LDRhtC40L7QvdC90YvRhSDRgtC10YXQvdC-0LvQvtCz0LjQuSDQuCDRgdCy0Y_Qt9C4!5e0!3m2!1sen!2sru!4v1791396027142!5m2!1sen!2sru";
const MAP_FALLBACK_MS = 4000;
const VENUE_LAT = 55.801339;
const VENUE_LON = 49.177800;

function MapEmbed() {
  const [provider, setProvider] = useState<"yandex" | "google">("yandex");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (provider !== "yandex" || loaded) return;
    const t = setTimeout(() => setProvider("google"), MAP_FALLBACK_MS);
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

// ── Footer ──────────────────────────────────────────────────────
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
          Rovno.dev x <span><Link href="https://unidoka.com">Юнидока</Link></span> x <span><Link href="https://unidoka.com/vershiny">Вершины</Link></span> © {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────
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
        <VideoSection />
        <GallerySection />
        <PresentationSection />
        <ReelsSection />
        <Manifesto ctx={ctx} />
        <Audience />
        <Speakers />
        <Timeline />
        <Location ctx={ctx} />
        <EventFooter />
      </div>
    </div>
  );
}
