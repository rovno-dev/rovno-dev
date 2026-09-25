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
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { SocialContentPreview, SocialContentPreviewProps } from "@/components/social-content-preview";
import { BehanceLogoMono } from "@/components/icons/logotypes/behance-logo-mono";
import { YoutubeLogoMono } from "@/components/icons/logotypes/youtube-logo-mono";
import { TiktokLogoMono } from "@/components/icons/logotypes/tiktok-logo-mono";
import { Button } from "@/components/ui/button";
import { HabrLogotypeMonoIcon } from "@/components/icons/logotypes/habr-logo-mono";
import { VCRULogotypeMonoIcon } from "@/components/icons/logotypes/vc-ru-logo-mono";
import { MediumLogotypeMonoIcon } from "@/components/icons/logotypes/medium-logo-mono";
// Media types data – icons only; display labels come from i18n
const mediaTypes = [
  {
    id: "shorts",
    icons: [
      { label: "VK Video", icon: <VKLogotypeMonoIcon />, link: "https://vkvideo.ru/rovno_dev" },
      { label: "TikTok", icon: <TiktokLogoMono />, link: "https://tiktok.com/rovno_dev" },
      { label: "YT Shorts", icon: <YoutubeLogoMono />, link: "https://youtube.com/rovno_dev" },
    ],
  },
  {
    id: "videos",
    icons: [
      { label: "YouTube", icon: <YoutubeLogoMono />, link: "https://youtube.com/rovno_dev" },
      { label: "VK Video", icon: <VKLogotypeMonoIcon />, link: "https://vkvideo.ru/rovno_dev" },
    ],
  },
  {
    id: "design",
    icons: [
      { label: "Dprofile", icon: <DprofileLogotypeMonoIcon />, link: "https://dprofile.ru/rovno_dev" },
      { label: "Behance", icon: <BehanceLogoMono />, link: "https://behance.net/rovno_dev" },
    ],
  },
  {
    id: "pro_notes",
    icons: [
      { label: "Telegram", icon: <TelegramLogotypeMonoIcon />, link: "https://t.me/rovno_dev" },
      { label: "VK", icon: <VKLogotypeMonoIcon />, link: "https://vk.com/rovno_dev" },
    ],
  },
  {
    id: "articles",
    icons: [
      { label: "VC", icon: <VCRULogotypeMonoIcon />, link: "https://vc.ru/rovno_dev" },
      { label: "Habr", icon: <HabrLogotypeMonoIcon />, link: "https://habr.com/rovno_dev" },
      { label: "Medium", icon: <MediumLogotypeMonoIcon />, link: "https:/ / habr.com / rovno_dev" },
    ],
  },
  {
    id: "dev",
    icons: [
      { label: "GitHub", icon: <GithubLogotypeMonoIcon />, link: "https://github.com/rovno-dev" },
    ],
  },
];
export default function SocialsSection() {
  const { t } = useLanguage();
  const [selectedMediaType, setSelectedMediaType] = useState<string>(mediaTypes[0].id);
  // Preview content per media type – labels/descriptions resolved via i18n
  const previewMap: Record<string, SocialContentPreviewProps> = {
    shorts: {
      type: "short-video",
      title: t("home.socials.preview.shorts.title"),
      description: t("home.socials.preview.shorts.description"),
      thumbnail: "/static-images/projects/alx/alx-cover.png",
      link: "https://youtube.com/rovno_dev",
    },
    videos: {
      type: "video",
      title: t("home.socials.preview.videos.title"),
      description: t("home.socials.preview.videos.description"),
      thumbnail: "/static-images/projects/bread/bread-cover.png",
      link: "https://youtube.com/rovno_dev",
    },
    design: {
      type: "article",
      title: t("home.socials.preview.design.title"),
      description: t("home.socials.preview.design.description"),
      thumbnail: "/static-images/projects/alx/alx-cover.png",
      link: "https://dprofile.ru/rovno_dev",
    },
    pro_notes: {
      type: "post",
      title: t("home.socials.preview.pro_notes.title"),
      description: t("home.socials.preview.pro_notes.description"),
      thumbnail: "/images/article.jpeg",
      link: "https://t.me/rovno_dev",
    },
    articles: {
      type: "article",
      title: t("home.socials.preview.articles.title"),
      description: t("home.socials.preview.articles.description"),
      thumbnail: "/images/infra-blue.png",
      link: "https://vc.ru/rovno_dev",
    },
    dev: {
      type: "repo",
      title: t("home.socials.preview.dev.title"),
      description: t("home.socials.preview.dev.description"),
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
          <SocialContentPreview key={selectedMediaType} className="animate-media-swap" {...activePreview} />
          <div className=" px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-3 pb-2">
              {mediaTypes.map((type) => (
                <Button
                  variant={'text'}
                  key={type.id}
                  onClick={() => setSelectedMediaType(type.id)}
                  className={`transition-colors ${selectedMediaType === type.id
                    ? "border-(--primary) bg-(--primary-card)"
                    : "border-(--outline) bg-(--card)"
                    }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wide text-(--on-bg-medium)">
                    {t(`home.socials.type.${type.id}`)}
                  </span>
                  <div className="flex items-center gap-2 pointer-events-none">
                    {type.icons.map((icon) => (
                      <div
                        key={icon.label}
                        aria-label={icon.label}
                        className="*:fill-(--on-bg-low)!"
                      >
                        {icon.icon}
                      </div>
                    ))}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
        {/* Desktop: preview + media types list */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-[500px_1fr] lg:grid-cols-[750px_1fr] xl:grid-cols-[1000px_1fr] 2xl:grid-cols-[1200px_1fr] items-center h-[60vh] 2xl:h-[80vh]">
          <div className="w-full h-[60vh] 2xl:h-[80vh] flex justify-center items-center aspect-video">
            <SocialContentPreview key={selectedMediaType} className="animate-media-swap" {...activePreview} />
          </div>
          {/* Media types list */}
          <div className="flex flex-col divide-y h-full divide-(--outline) border-y border-(--outline)">
            {mediaTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedMediaType(type.id)}
                className={`h-full flex items-center justify-between p-4 group transition-colors cursor-pointer ${selectedMediaType === type.id
                  ? "bg-(--primary-card)"
                  : "hover:bg-(--state-hover)"
                  }`}
              >
                <span className="text-body-3 font-semibold text-(--on-bg-low) group-hover:text-(--on-bg-high) transition-colors">
                  {t(`home.socials.type.${type.id}`)}
                </span>
                <div className="flex items-center gap-1 pointer-events-none">
                  {type.icons.map((icon) => (
                    <div
                      key={icon.label}
                      aria-label={icon.label}
                      className="p-1 [&>svg]:size-8 [&>svg>path]:fill-(--on-bg-low)! [&>svg>path]:group-hover:fill-(--on-bg-high)!"
                    >
                      {icon.icon}
                    </div>
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
