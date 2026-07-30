"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DprofileLogotypeMonoIcon } from "@/components/icons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { MediaLightbox } from "@/components/ui/media-lightbox";
import { Project } from "./_data";
import { CLIENTS } from "@/app/clients/_data";

interface ProjectPageProps {
  project: Project;
}

function CarouselIndicators() {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    setSelectedIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setSelectedIndex(api.selectedScrollSnap());
    });
  }, [api]);

  if (!api || scrollSnaps.length <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      {scrollSnaps.map((_, idx) => (
        <button
          key={idx}
          onClick={() => api.scrollTo(idx)}
          className={`h-2 rounded-full transition-all ${selectedIndex === idx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
        />
      ))}
    </div>
  );
}

export default function ProjectPage({ project }: ProjectPageProps) {
  const client = CLIENTS[project.clientId];
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const desktopParallax = Math.min(Math.max((scrollY * 0.05), -20), 20);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-(--bg)">
        {/* Desktop layout (grid, image on right) */}
        <div className="hidden lg:block py-16 lg:py-24 bg-gradient-to-b from-background/80 to-background">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left – text */}
              <div className="flex flex-col gap-5 animate-reveal">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="glass-static" size="chip-small">
                    {project.category || "Проект"}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold leading-[1.1] tracking-tight text-(--on-bg-high)">
                    {project.title}
                  </h1>
                  <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) max-w-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 md:gap-10 pt-1">
                  {client && (
                    <div>
                      <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">КЛИЕНТ</p>
                      <p className="text-body-3 text-(--on-bg-high) font-medium">{client.name}</p>
                    </div>
                  )}
                  {/* {project.platform && (
                    <div>
                      <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">ПЛАТФОРМА</p>
                      <p className="text-body-3 text-(--on-bg-high) font-medium">{project.platform}</p>
                    </div>
                  )} */}
                  {project.period && (
                    <div>
                      <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">ПЕРИОД</p>
                      <p className="text-body-3 text-(--on-bg-high) font-medium">{project.period}</p>
                    </div>
                  )}
                </div>

                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, idx) => (
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

                <Button size="large" shape="round" className="w-full sm:w-fit mt-2 md:mt-4" asChild>
                  <Link href={project.href || "#"} target="_blank" rel="noopener noreferrer">
                    <span>Смотреть кейс</span>
                    <DprofileLogotypeMonoIcon className="size-6!" />
                  </Link>
                </Button>
              </div>

              {/* Right – image with subtle parallax */}
              <div className="relative group animate-reveal delay-200 fill-mode-both">
                <div
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-(--outline) bg-(--card) shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-500 group-hover:scale-[1.01]"
                  style={{
                    transform: `translateY(${desktopParallax}px)`,
                    transition: 'transform 0.1s ease-out',
                  }}
                >
                  <Image
                    src={project.cover}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Mobile layout – sticky parallax header (VK Music style) */}
        <div className="lg:hidden">
          {/* Sticky image header */}
          <div className="sticky top-0 z-0 h-[55vh] w-full overflow-hidden bg-(--card)">
            <div
              className="absolute inset-0 will-change-transform"
              style={{
                transform: `translateY(${Math.min(Math.max(scrollY * 0.15, -30), 30)}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <Image
                src={project.cover}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-(--bg)" />
          </div>

          {/* Content that scrolls over the image */}
          <div className="relative z-10 bg-(--bg) rounded-t-3xl -mt-8 pt-6 px-4 pb-12">
            <div className="flex flex-col gap-4 animate-reveal">
              <div className="flex flex-wrap gap-2">
                <Badge variant="glass-static" size="chip-small">
                  {project.category || "Проект"}
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-heading font-semibold leading-[1.1] tracking-tight text-(--on-bg-high)">
                  {project.title}
                </h1>
                <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                {client && (
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">КЛИЕНТ</p>
                    <p className="text-body-3 text-(--on-bg-high) font-medium">{client.name}</p>
                  </div>
                )}
                {project.platform && (
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">ПЛАТФОРМА</p>
                    <p className="text-body-3 text-(--on-bg-high) font-medium">{project.platform}</p>
                  </div>
                )}
                {project.period && (
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-0.5">ПЕРИОД</p>
                    <p className="text-body-3 text-(--on-bg-high) font-medium">{project.period}</p>
                  </div>
                )}
              </div>

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
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

              <Button size="large" shape="round" className="w-full mt-2" asChild>
                <Link href={project.href || "#"} target="_blank" rel="noopener noreferrer">
                  <span>Смотреть кейс</span>
                  <DprofileLogotypeMonoIcon className="size-6!" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Results Section */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="py-8 md:py-12 bg-(--bg)">
          <Container>
            <h2 className="text-display-2 text-(--on-bg-high) mb-10 animate-reveal">
              Результаты внедрения
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 animate-reveal fill-mode-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-2">
                    {metric.label}
                  </p>
                  <p className="text-display-1 text-(--on-bg-high) mb-2">
                    {metric.value}
                  </p>
                  <p className="text-body-3 text-(--on-bg-medium)">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Media Carousel Section */}
      {project.media && project.media.length > 0 && (
        <section className="py-8 md:py-12 bg-(--bg)">
          <Container>
            <div className="w-full mx-auto">
              <Carousel className="relative">
                <CarouselContent>
                  {project.media.map((item, idx) => (
                    <CarouselItem key={idx}>
                      <div className="relative aspect-video rounded-3xl overflow-hidden border border-(--outline) bg-(--card) flex items-center justify-center">
                        {item.type === 'image' ? (
                          <MediaLightbox src={item.src} alt={`${project.title} - media ${idx + 1}`}>
                            <div className="cursor-pointer w-full h-full flex items-center justify-center">
                              <Image
                                src={item.src}
                                alt={`${project.title} - media ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </MediaLightbox>
                        ) : (
                          <iframe
                            src={item.src + "?muted=1"}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                            allowFullScreen
                            title={`${project.title} - video ${idx + 1}`}
                          />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {project.media.length > 1 && (
                  <>
                    <CarouselPrevious className="left-4 z-10" />
                    <CarouselNext className="right-4 z-10" />
                  </>
                )}
                <CarouselIndicators />
              </Carousel>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
