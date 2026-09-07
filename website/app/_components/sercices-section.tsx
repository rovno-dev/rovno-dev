/// <reference types="@google/model-viewer" />

"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CodeIcon, DiamondIcon, SignatureIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { PROJECTS, type Project } from "@/app/_data/projects";
import { useLanguage } from "@/providers/language-provider";
import { Badge } from "@/components/ui/badge";

// 1. Assign GLB model file paths to your service titles
const serviceToProjectSlugs: Record<string, string[]> = {
  "Разработка": ["vanguard", "sadovod", "courtElegance", "concord"],
  "3D & Motion": ["alx", "bread", "concord"],
  "Продвижение": ["vanguard", "sadovod", "concord"],
  "Брендинг": ["alx", "bread"],
};

// Create a mapping for your 3D assets matching the service key
const serviceToModelPaths: Record<string, string> = {
  "Разработка": "/3d/code.glb",       // Place your .glb files in your public folder
  "3D & Motion": "/3d/gem.glb",
  "Брендинг": "/3d/signature.glb",
};

function getLatestProjectForService(serviceTitle: string): Project {
  const slugs = serviceToProjectSlugs[serviceTitle] || [];
  const candidates = slugs
    .map((slug) => PROJECTS[slug])
    .filter(Boolean)
    .sort((a, b) => {
      const yearA = parseInt(a.period || "0", 10);
      const yearB = parseInt(b.period || "0", 10);
      return yearB - yearA;
    });
  return candidates[0] || PROJECTS.vanguard;
}

export default function ServicesSection() {
  const { t, lang } = useLanguage();
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  // 2. Safely import <model-viewer> only on the client side
  useEffect(() => {
    import("@google/model-viewer")
      .then(() => setModelViewerLoaded(true))
      .catch((err) => console.error("Failed to load <model-viewer>", err));
  }, []);

  const services = [
    {
      title: t("services.development"),
      description: t("services.dev_description"),
      icon: CodeIcon,
      color: "#3b82f6",
      services: [t("services.dev_sub1"), t("services.dev_sub2"), t("services.dev_sub3"), t("services.dev_sub4"), t("services.dev_sub5")],
      price: { from: "75 000", avg: "250 000" },
    },
    {
      title: t("services.motion"),
      description: t("services.motion_description"),
      icon: DiamondIcon,
      color: "#f59e0b",
      services: [t("services.motion_sub1"), t("services.motion_sub2"), t("services.motion_sub3"), t("services.motion_sub4"), t("services.motion_sub5")],
      price: { from: "45 000", avg: "100 000" },
    },
    {
      title: t("services.branding"),
      description: t("services.branding_description"),
      icon: SignatureIcon,
      color: "#a855f7",
      services: [t("services.branding_sub1"), t("services.branding_sub2"), t("services.branding_sub3"), t("services.branding_sub4")],
      price: { from: "75 000", avg: "150 000" },
    },
  ];

  // Carousel state
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const hasInteracted = useRef(false);

  const ModelViewerElement = 'model-viewer' as any;

  // Update selected index
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay logic - scroll next every 6 seconds
  useEffect(() => {
    if (hasInteracted.current) return;
    const startAutoplay = () => {
      autoPlayTimer.current = setInterval(() => {
        if (emblaApi) {
          emblaApi.scrollNext();
        }
      }, 6000);
    };
    startAutoplay();
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [emblaApi]);

  // Stop autoplay on interaction
  const handleInteraction = () => {
    hasInteracted.current = true;
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
  };

  const currentService = services[selectedIndex];
  const currentProject = getLatestProjectForService(currentService.title);
  const Icon = currentService.icon;

  // 3. Extract the right model based on the active slide layout
  const currentModelPath = serviceToModelPaths[currentService.title] || "/3d/code.glb";

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden text-on-bg-high">
      <div className="relative z-10 flex flex-col justify-between min-h-full">
        <Container className="h-full">
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* LEFT COLUMN: Texts & Navigation */}
            <div className="h-full flex flex-col justify-between">
              <div>
                <p className="text-xl md:text-2xl text-white/70 max-w-2xl mb-4">
                  {lang === 'ru' ? 'Мы делаем...' : 'We do...'}
                </p>
                <h1 className="text-display-1 text-[2rem] sm:text-[2.75rem] lg:text-[4rem] mb-6">
                  {currentService.title}
                </h1>
                <div className="mb-6 flex flex-wrap gap-2 marquee-badges">
                  {currentService.services.map((s) => (
                    <Badge
                      variant={"outlined-static"}
                      key={s}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-white/60 mb-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-white/40">{t("services.from")}</span>
                    <span className="text-3xl font-semibold text-white">{currentService.price.from} ₽</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-white/40">{t("services.avg_label")}</span>
                    <span className="text-3xl font-semibold text-white">{currentService.price.avg} ₽</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full">
                {services.map((service, index) => {
                  const ServiceIcon = service.icon;
                  const isActive = index === selectedIndex;
                  return (
                    <Button
                      variant={'outlined'}
                      className="flex-col h-[64px] w-full flex-1 p-2!"
                      key={service.title}
                      onClick={() => {
                        emblaApi?.scrollTo(index);
                        handleInteraction();
                      }}
                      onPointerDown={handleInteraction}
                    >
                      <div className="h-full flex gap-2 items-center justify-center text-xs sm:text-sm">
                         { modelViewerLoaded ? (
                          <ModelViewerElement
                            key={currentModelPath}
                            src={currentModelPath}
                            alt={`3D representative for ${currentService.title}`}
                            auto-rotate
                            camera-controls
                            interaction-prompt="none"
                            rotation-per-second="15deg"
                            style={{ width: '100%', height: '100%', minHeight: '400px', '--poster-color': 'transparent' } as React.CSSProperties}
                          >
                          </ModelViewerElement>
                        ) : (
                          <ServiceIcon className="h-full! aspect-square! w-auto!" />
                        )}
                        {service.title}
                      </div>
                      {/* Add progress bar here */}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Replaced Image with Interactive 3D Model Viewer */}
            <div className="flex items-center justify-center min-h-[300px] sm:min-h-[450px] relative w-full h-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
              {modelViewerLoaded ? (
                <ModelViewerElement
                  key={currentModelPath}
                  src={currentModelPath}
                  alt={`3D representative for ${currentService.title}`}
                  auto-rotate
                  camera-controls
                  interaction-prompt="none"
                  rotation-per-second="15deg"
                  style={{ width: '100%', height: '100%', minHeight: '400px', '--poster-color': 'transparent' } as React.CSSProperties}
                >
                </ModelViewerElement>
              ) : (
                <div className="text-white/40 text-sm animate-pulse">Loading 3D Workspace...</div>
              )}
            </div>

          </div>
        </Container >
      </div >
    </section >
  );
}
