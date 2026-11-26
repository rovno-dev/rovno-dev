"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRightIcon, PlayIcon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/container";
import { VKLogotypeMonoIcon } from "@/components/icons";
import { YoutubeLogoMono } from "@/components/icons/logotypes/youtube-logo-mono";
import { useLanguage } from "@/providers/language-provider";
import type {
  LatestVideo,
  RecommendedVideosPayload,
} from "@/utils/latest-video";

const YOUTUBE_LOAD_TIMEOUT_MS = 8_000;

export default function RecommendedVideoSection({
  data,
}: {
  data: RecommendedVideosPayload;
}) {
  const { lang, t } = useLanguage();

  const pair = data.videos[lang];
  const channels = data.channels[lang];
  const youtube = pair.youtube;
  const vk = pair.vk;

  const [forceVk, setForceVk] = useState(false);
  const [youtubeLoaded, setYoutubeLoaded] = useState(false);

  useEffect(() => {
    setForceVk(false);
    setYoutubeLoaded(false);
  }, [lang]);

  // If the YouTube iframe never finishes loading (blocked/throttled in some
  // regions), switch to the VK video after a short grace period.
  useEffect(() => {
    if (!youtube || !vk || youtubeLoaded || forceVk) return;
    const timer = window.setTimeout(
      () => setForceVk(true),
      YOUTUBE_LOAD_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [youtube, vk, youtubeLoaded, forceVk]);

  const activeVideo: LatestVideo | null =
    !forceVk && youtube ? youtube : vk ?? youtube;

  const hasChannels = Boolean(channels.youtube || channels.vk);

  const fallbackProvider =
    channels.vk && !channels.youtube ? "vk" : "youtube";
  const provider = activeVideo?.provider ?? fallbackProvider;
  const providerName = provider === "vk" ? "VK Video" : "YouTube";
  const channelUrl =
    provider === "vk"
      ? channels.vk ?? channels.youtube
      : channels.youtube ?? channels.vk;

  const ProviderIcon = useMemo(
    () => (provider === "vk" ? VKLogotypeMonoIcon : YoutubeLogoMono),
    [provider],
  );

  if (!hasChannels) return null;

  return (
    <section className="py-20 md:py-28 text-(--on-bg-high)">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 md:mb-10">
          <div>
            <h2 className="text-display-2 md:text-display-1 tracking-tight">
              {t("home.recommended_video.title")}
            </h2>
            <p className="mt-2 text-body-3 text-(--on-bg-medium)">
              {t("home.recommended_video.subtitle")}
            </p>
          </div>

          {channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-body-4 text-(--on-bg-medium) transition-colors hover:text-(--on-bg-high)"
            >
              <ProviderIcon className="size-4" />
              {providerName}
              <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
        </div>

        {activeVideo ? (
          <div>
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-(--outline) bg-black">
              <iframe
                key={`${activeVideo.provider}-${activeVideo.videoId}`}
                src={activeVideo.embedUrl}
                title={
                  activeVideo.title ||
                  t("home.recommended_video.title")
                }
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
                onLoad={
                  activeVideo.provider === "youtube"
                    ? () => setYoutubeLoaded(true)
                    : undefined
                }
                onError={
                  activeVideo.provider === "youtube" && vk
                    ? () => setForceVk(true)
                    : undefined
                }
              />
            </div>

            {activeVideo.title && (
              <p className="mt-3 text-body-4 text-(--on-bg-medium)">
                {activeVideo.title}
              </p>
            )}
          </div>
        ) : (
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-3xl border border-(--outline) bg-(--card) transition-colors hover:border-(--on-bg-disabled)"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--outline) 1px, transparent 1px), linear-gradient(to bottom, var(--outline) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                maskImage:
                  "linear-gradient(to bottom, black, transparent 90%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-4 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-full border border-(--outline) bg-(--bg) text-(--on-bg-high) transition-transform duration-300 group-hover:scale-105">
                <PlayIcon className="size-6" weight="fill" />
              </span>
              <span className="text-display-4 tracking-tight">
                {t("home.recommended_video.open_channel")}
              </span>
              <span className="inline-flex items-center gap-2 text-body-4 text-(--on-bg-low)">
                <ProviderIcon className="size-4" />
                {providerName}
                <ArrowUpRightIcon className="size-4" />
              </span>
            </div>
          </a>
        )}
      </Container>
    </section>
  );
}
