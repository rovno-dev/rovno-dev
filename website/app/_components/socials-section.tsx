"use client";
import { useState } from "react";
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
import { SocialContentPreview, SocialContentPreviewProps } from "@/components/social-content-preview";
import { BehanceLogoMono } from "@/components/icons/logotypes/behance-logo-mono";
import { YoutubeLogoMono } from "@/components/icons/logotypes/youtube-logo-mono";
import { TiktokLogoMono } from "@/components/icons/logotypes/tiktok-logo-mono";
import { Button } from "@/components/ui/button";

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
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

function BehanceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 8.5c1.2 0 2.1.3 2.7.9.6.6.9 1.4.9 2.4 0 1.1-.5 2-1.5 2.6 1.3.4 2.2 1.4 2.2 2.9 0 2.4-1.8 3.7-4.4 3.7H2V8.5h5.5zm-.4 4.9c.8 0 1.4-.2 1.8-.6.4-.4.6-.9.6-1.6 0-.6-.2-1.1-.6-1.5-.4-.4-1-.5-1.8-.5H5.1v4.2H7.1zm.3 5.2c.8 0 1.4-.2 1.9-.6.5-.4.7-1 .7-1.8 0-.7-.2-1.3-.7-1.7-.4-.4-1.1-.6-1.9-.6H5.1v4.7H7.4zM15.7 10.9c1.5 0 2.6.4 3.4 1.2.8.8 1.2 1.9 1.2 3.3v1h-6.9c.1.9.4 1.6 1 2.1.6.5 1.3.7 2.2.7.6 0 1.2-.1 1.7-.4.5-.2.9-.6 1.1-1h2.2c-.3 1.1-.9 2-1.9 2.6-.9.6-2 .9-3.3.9-1.1 0-2-.2-2.9-.6-.8-.4-1.5-1-1.9-1.8-.4-.8-.7-1.7-.7-2.7s.2-1.9.7-2.7c.5-.8 1.1-1.4 1.9-1.8.8-.5 1.7-.8 2.9-.8zm2.4 4c-.1-.8-.4-1.4-.9-1.8-.5-.4-1.2-.6-2.1-.6-.8 0-1.5.2-2 .7-.5.5-.8 1.1-.9 1.7h5.9zM15.3 6.5h5.5v1.3h-5.5V6.5z" />
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
      { label: "VK Video", icon: <VKLogotypeMonoIcon />, link: "https://vkvideo.ru/rovno_dev" },
      { label: "TikTok", icon: <TiktokLogoMono />, link: "https://tiktok.com/rovno_dev" },
      { label: "YT Shorts", icon: <YoutubeLogoMono />, link: "https://youtube.com/rovno_dev" },
    ],
  },
  {
    name: "Videos",
    icons: [
      { label: "YouTube", icon: <YoutubeLogoMono />, link: "https://youtube.com/rovno_dev" },
      { label: "VK Video", icon: <VKLogotypeMonoIcon />, link: "https://vkvideo.ru/rovno_dev" },
    ],
  },
  {
    name: "Design",
    icons: [
      { label: "Dprofile", icon: <DprofileLogotypeMonoIcon />, link: "https://dprofile.ru/rovno_dev" },
      { label: "Behance", icon: <BehanceLogoMono />, link: "https://behance.net/rovno_dev" },
    ],
  },
  {
    name: "Pro notes",
    icons: [
      { label: "Telegram", icon: <TelegramLogotypeMonoIcon />, link: "https://t.me/rovno_dev" },
      { label: "VK", icon: <VKLogotypeMonoIcon />, link: "https://vk.com/rovno_dev" },
    ],
  },
  {
    name: "Articles",
    icons: [
      { label: "VC", icon: <VCIcon />, link: "https://vc.ru/rovno_dev" },
      { label: "Habr", icon: <HabrIcon />, link: "https://habr.com/rovno_dev" },
    ],
  },
  {
    name: "Dev",
    icons: [
      { label: "GitHub", icon: <GithubLogotypeMonoIcon />, link: "https://github.com/rovno-dev" },
    ],
  },
];

export default function SocialsSection() {
  const { t } = useLanguage();
  const [selectedMediaType, setSelectedMediaType] = useState<string>(mediaTypes[0].name);

  // Example preview data (could be dynamic)
  // Map media type name to preview content
  const previewMap: Record<string, SocialContentPreviewProps> = {
    "Shorts": {
      type: "short-video",
      title: "Latest reel: 3D animation process",
      description: "Watch how we built the latest case study in 30 seconds.",
      thumbnail: "/_static/projects/alx/alx-cover.png",
      link: "https://youtube.com/rovno_dev",
    },
    "Videos": {
      type: "video",
      title: "Our full portfolio showcase",
      description: "A compilation of our best video projects.",
      thumbnail: "/_static/projects/bread/bread-cover.png",
      link: "https://youtube.com/rovno_dev",
    },
    "Design": {
      type: "article",
      title: "Design case: ALX-9 identity",
      description: "How we created the brand identity for the AI exhibition.",
      thumbnail: "/_static/projects/alx/alx-cover.png",
      link: "https://dprofile.ru/rovno_dev",
    },
    "Pro notes": {
      type: "post",
      title: "Pro notes: 5 tips for faster development",
      description: "Our team shares practical advice.",
      thumbnail: "/images/projects/sadovod.png",
      link: "https://t.me/rovno_dev",
    },
    "Articles": {
      type: "article",
      title: "Why we chose Next.js for our new platform",
      description: "A deep dive into our tech stack decisions.",
      thumbnail: "/images/projects/alx.png",
      link: "https://vc.ru/rovno_dev",
    },
    "Dev": {
      type: "repo",
      title: "Open source: Amorfa UI",
      description: "Explore our design system on GitHub.",
      thumbnail: "/images/projects/sadovod.png",
      link: "https://github.com/rovno-dev",
    },
  };

  const activePreview = previewMap[selectedMediaType];

  return (
    <Container variant="full-screen" className="py-12 md:py-20">
      <div className="space-y-8">
        <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) text-center animate-reveal">
          {t("home.socials_title")}
        </h2>

        {/* Mobile: preview at top + horizontal scroll badges */}
        <div className="sm:hidden space-y-6">
          <SocialContentPreview {...activePreview} />
          <div className=" px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 pb-2">
              {mediaTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => setSelectedMediaType(type.name)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-colors min-w-[140px] ${selectedMediaType === type.name
                    ? "border-(--primary) bg-(--primary-card)"
                    : "border-(--outline) bg-(--card)"
                    }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-(--on-bg-medium)">
                    {type.name}
                  </span>
                  <div className="flex items-center gap-2 pointer-events-none">
                    {type.icons.map((icon) => (
                      <Button
                        key={icon.label}
                        aria-label={icon.label}
                        variant={'text'}
                        size={'chip-medium'}
                      >
                        {icon.icon}
                      </Button>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: preview + media types list */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-[500px_1fr] lg:grid-cols-[750px_1fr] xl:grid-cols-[1000px_1fr] 2xl:grid-cols-[1200px_1fr] items-center h-[60vh] 2xl:h-[80vh]">
          <div className="w-full h-[60vh] 2xl:h-[80vh] flex justify-center items-center aspect-video">
            <SocialContentPreview {...activePreview} />
          </div>

          {/* Media types list */}
          <div className="flex flex-col divide-y h-full divide-(--outline) border-y border-(--outline)">
            {mediaTypes.map((type) => (
              <button
                key={type.name}
                onClick={() => setSelectedMediaType(type.name)}
                className={`h-full flex items-center justify-between p-4 group transition-colors cursor-pointer ${selectedMediaType === type.name
                  ? "bg-(--primary-card)"
                  : "hover:bg-(--state-hover)"
                  }`}
              >
                <span className="text-body-3 font-semibold text-(--on-bg-low) group-hover:text-(--on-bg-high) transition-colors">
                  {type.name}
                </span>
                <div className="flex items-center gap-4 pointer-events-none">
                  {type.icons.map((icon) => (
                    <Button
                      key={icon.label}
                      aria-label={icon.label}
                      variant={'text'}
                      className="p-0 [&>svg]:size-8 [&>svg>path]:fill-(--on-bg-low)! [&>svg>path]:group-hover:fill-(--on-bg-high)!"
                      size={'chip-medium'}
                    >
                      {icon.icon}
                    </Button>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
