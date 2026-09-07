"use client";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import {
  TelegramLogotypeMonoIcon,
  VKLogotypeMonoIcon,
  GithubLogotypeMonoIcon,
  DprofileLogotypeMonoIcon,
} from "@/components/icons";
import { ArrowUpRight } from "lucide-react";

// Helper to create a simple square icon with a letter
function LetterIcon({ letter, bg = "bg-current" }: { letter: string; bg?: string }) {
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${bg}`}>
      {letter}
    </div>
  );
}

// Brand icons for platforms without custom icons
function TiktokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>
    </svg>
  );
}

function BehanceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 8.5c1.2 0 2.1.3 2.7.9.6.6.9 1.4.9 2.4 0 1.1-.5 2-1.5 2.6 1.3.4 2.2 1.4 2.2 2.9 0 2.4-1.8 3.7-4.4 3.7H2V8.5h5.5zm-.4 4.9c.8 0 1.4-.2 1.8-.6.4-.4.6-.9.6-1.6 0-.6-.2-1.1-.6-1.5-.4-.4-1-.5-1.8-.5H5.1v4.2H7.1zm.3 5.2c.8 0 1.4-.2 1.9-.6.5-.4.7-1 .7-1.8 0-.7-.2-1.3-.7-1.7-.4-.4-1.1-.6-1.9-.6H5.1v4.7H7.4zM15.7 10.9c1.5 0 2.6.4 3.4 1.2.8.8 1.2 1.9 1.2 3.3v1h-6.9c.1.9.4 1.6 1 2.1.6.5 1.3.7 2.2.7.6 0 1.2-.1 1.7-.4.5-.2.9-.6 1.1-1h2.2c-.3 1.1-.9 2-1.9 2.6-.9.6-2 .9-3.3.9-1.1 0-2-.2-2.9-.6-.8-.4-1.5-1-1.9-1.8-.4-.8-.7-1.7-.7-2.7s.2-1.9.7-2.7c.5-.8 1.1-1.4 1.9-1.8.8-.5 1.7-.8 2.9-.8zm2.4 4c-.1-.8-.4-1.4-.9-1.8-.5-.4-1.2-.6-2.1-.6-.8 0-1.5.2-2 .7-.5.5-.8 1.1-.9 1.7h5.9zM15.3 6.5h5.5v1.3h-5.5V6.5z"/>
    </svg>
  );
}

function VCIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5L22.5 20H1.5L12 1.5z" />
    </svg>
  );
}

function HabrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L22 12L12 22L2 12L12 2z" />
    </svg>
  );
}

// Media types data
const mediaTypes = [
  {
    name: "Shorts",
    icons: [
      { label: "VK Video", icon: <VKLogotypeMonoIcon className="w-4 h-4" />, link: "https://vk.com/video" },
      { label: "TikTok", icon: <TiktokIcon />, link: "https://tiktok.com" },
      { label: "YT Shorts", icon: <YoutubeIcon />, link: "https://youtube.com/shorts" },
    ],
  },
  {
    name: "Videos",
    icons: [
      { label: "YouTube", icon: <YoutubeIcon />, link: "https://youtube.com" },
      { label: "VK Video", icon: <VKLogotypeMonoIcon className="w-4 h-4" />, link: "https://vk.com/video" },
    ],
  },
  {
    name: "Design",
    icons: [
      { label: "Dprofile", icon: <DprofileLogotypeMonoIcon className="w-4 h-4" />, link: "https://dprofile.ru" },
      { label: "Behance", icon: <BehanceIcon />, link: "https://behance.net" },
    ],
  },
  {
    name: "Pro notes",
    icons: [
      { label: "Telegram", icon: <TelegramLogotypeMonoIcon className="w-4 h-4" />, link: "https://t.me/rovno_dev" },
      { label: "VK", icon: <VKLogotypeMonoIcon className="w-4 h-4" />, link: "https://vk.com/rovno_dev" },
    ],
  },
  {
    name: "Articles",
    icons: [
      { label: "VC", icon: <VCIcon />, link: "https://vc.ru" },
      { label: "Habr", icon: <HabrIcon />, link: "https://habr.com" },
    ],
  },
  {
    name: "Dev",
    icons: [
      { label: "GitHub", icon: <GithubLogotypeMonoIcon className="w-4 h-4" />, link: "https://github.com/rovno-dev" },
    ],
  },
];

export default function SocialsSection() {
  const { t } = useLanguage();

  return (
    <Container className="py-12 md:py-20">
      <div className="space-y-8">
        <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) text-center animate-reveal">
          {t("home.socials_title")}
        </h2>

        {/* Mobile: horizontal scroll badges */}
        <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-2">
            {mediaTypes.map((type) => (
              <div
                key={type.name}
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border border-(--outline) bg-(--card) min-w-[140px]"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-(--on-bg-medium)">
                  {type.name}
                </span>
                <div className="flex items-center gap-2">
                  {type.icons.map((icon) => (
                    <Link
                      key={icon.label}
                      href={icon.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-(--bg-disabled) text-(--on-bg-medium) hover:text-(--primary) hover:bg-(--primary-card) transition-all"
                      aria-label={icon.label}
                    >
                      {icon.icon}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: content + list */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-center">
          {/* Content square */}
          <div className="relative overflow-hidden rounded-3xl border border-(--outline) bg-gradient-to-br from-(--primary-card) to-(--card) p-8 text-center shadow-sm">
            <div className="absolute inset-0 bg-grid-white opacity-20" />
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary) text-(--on-primary) mb-4">
                <ArrowUpRight className="w-8 h-8" />
              </div>
              <h3 className="text-display-4 font-heading font-semibold text-(--on-bg-high) mb-2">
                Follow us
              </h3>
              <p className="text-body-3 text-(--on-bg-medium) mb-6">
                We post fresh content daily
              </p>
              <Link
                href={mediaTypes[0].icons[0].link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-(--primary) text-(--on-primary) text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Open socials
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Media types list */}
          <div className="flex flex-col divide-y divide-(--outline) border-y border-(--outline)">
            {mediaTypes.map((type) => (
              <div key={type.name} className="flex items-center justify-between py-4 group">
                <span className="text-body-3 font-semibold text-(--on-bg-high) group-hover:text-(--primary) transition-colors">
                  {type.name}
                </span>
                <div className="flex items-center gap-2">
                  {type.icons.map((icon) => (
                    <Link
                      key={icon.label}
                      href={icon.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-xl bg-(--bg-disabled) text-(--on-bg-medium) group-hover:text-(--primary) group-hover:bg-(--primary-card) transition-all"
                      aria-label={icon.label}
                    >
                      {icon.icon}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
