"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DprofileLogotypeMonoIcon } from "../../../../components/icons";

interface ProjectHeroProps {
  title: string;
  description: string;
  cover: {
    videoSrc?: string;
    imageSrc: string;
  };
  category?: string;
  clientName?: string;
  period?: string;
  techStack?: string[];
  href?: string;
}

export function ProjectHero({
  title,
  description,
  cover,
  category,
  clientName,
  period,
  techStack,
  href,
}: ProjectHeroProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Fallback if iframe onLoad doesn't fire
    const timer = setTimeout(() => setVideoLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[70vh] lg:min-h-[90vh] flex items-center py-12 md:py-16 overflow-hidden border-b border-(--outline)">
      {/* 1. Full-bleed background container */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden w-full h-full">
        {/* Preloader overlay */}
        <div
          className={`absolute inset-0 bg-(--bg) z-10 transition-opacity duration-700 flex items-center justify-center ${videoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-(--primary) border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-heading text-(--on-bg-low) animate-pulse">Загрузка видео...</p>
          </div>
        </div>

        {/* Video iframe – scales responsively */}
        {cover.videoSrc && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto aspect-video object-cover scale-[1.3] md:scale-100">
            <iframe
              src={`${cover.videoSrc}?autoplay=1&muted=1&loop=1`}
              className={`absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-700 ${videoLoaded ? "opacity-100" : "opacity-0"
                }`}
              allow="autoplay; encrypted-media; fullscreen; accelerometer; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoLoaded(true)}
              title={title}
            />
          </div>
        )}

        {/* Fallback image (shown if video fails or before loaded) */}
        {!cover.videoSrc && (
          <Image
            src={cover.imageSrc}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Dark tint overlay */}
        <div className="absolute inset-0 bg-black/50 md:bg-black/40 pointer-events-none" />

        {/* Soft glow accents */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_30%_20%,rgba(51,109,255,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_70%_80%,rgba(51,109,255,0.06),transparent_70%)] pointer-events-none" />
      </div>

      {/* 2. Content layout */}
      <Container className="relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
          <div className="lg:col-span-5 space-y-6 w-full max-w-full overflow-hidden">
            {/* Category badge */}
            {category && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--outline)/50 bg-(--card)/40 backdrop-blur-sm text-xs font-medium text-(--on-bg-low)">
                <Badge variant="glass-static" size="chip-small" className="font-heading">
                  {category}
                </Badge>
                <span className="font-sans text-white">Проект</span>
              </div>
            )}

            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tight text-white">
              <span className="text-(--primary)">{title}</span>
            </h1>

            <p className="text-base md:text-xl font-sans text-gray-200 leading-relaxed max-w-lg break-words">
              {description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {href && (
                <Button asChild variant="filled" size="large" className="font-heading shadow-lg shadow-(--primary)/30 w-full sm:w-auto justify-center">
                  <Link href={href} target="_blank" rel="noopener noreferrer">
                    Смотреть кейс
                    <DprofileLogotypeMonoIcon className="size-6!" />
                  </Link>
                </Button>
              )}
              {!href && (
                <Button asChild variant="filled" size="large" className="font-heading shadow-lg shadow-(--primary)/30 w-full sm:w-auto justify-center">
                  <Link href="#project">Подробнее</Link>
                </Button>
              )}
            </div>

            {/* Client & period */}
            <div className="flex flex-wrap gap-6 md:gap-10 pt-1">
              {clientName && (
                <div>
                  <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">КЛИЕНТ</p>
                  <p className="text-body-3 text-(--on-bg-high) font-medium">{clientName}</p>
                </div>
              )}
              {period && (
                <div>
                  <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">ПЕРИОД</p>
                  <p className="text-body-3 text-(--on-bg-high) font-medium">{period}</p>
                </div>
              )}
            </div>

            {/* Tech stack */}
            {techStack && techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, idx) => (
                  <Badge
                    key={idx}
                    variant="tonal-card-static"
                    size="chip-medium"
                    className="animate-reveal fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Empty right column for symmetry (optional) */}
          <div className="hidden lg:block lg:col-span-7" />
        </div>
      </Container>
    </section>
  );
}
