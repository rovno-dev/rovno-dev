/// <reference types="@google/model-viewer" />
"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { CodeIcon, DiamondIcon, SignatureIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const serviceToModelPaths: Record<string, string> = {
  "development": "/3d/code_icon.glb",
  "motion": "/3d/3d_icon.glb",
  "branding": "/3d/design_icon.glb",
};

// Pushed background cards up slightly and outwards
const cardVariants = {
  center: { x: 0, y: 0, rotateZ: 0, scale: 1, zIndex: 30, opacity: 1 },
  left: { x: -110, y: -10, rotateZ: -6, scale: 0.9, zIndex: 20, opacity: 0.6 },
  right: { x: 110, y: -10, rotateZ: 6, scale: 0.9, zIndex: 20, opacity: 0.6 },
};

function ServiceCard({
  service, isActive, position, onClick, Icon, modelPath, modelViewerLoaded, ModelViewerElement, t, lang, handleSwipe
}: any) {
  return (
    <motion.div
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(e, info) => {
        // Threshold to register a swipe
        const swipeThreshold = 80;
        if (info.offset.x > swipeThreshold) {
          handleSwipe("right");
        } else if (info.offset.x < -swipeThreshold) {
          handleSwipe("left");
        }
      }}
      animate={position}
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
      onClick={onClick}
      className={cn(
        "absolute w-full max-w-[900px] h-auto min-h-[500px] md:h-[500px] rounded-[32px] cursor-grab active:cursor-grabbing select-none overflow-hidden flex flex-col",
        "bg-[#0a0a0a] border border-white/10 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9)]",
        // Allow vertical scrolling on mobile while dragging horizontally
        "touch-pan-y"
      )}
      style={{ transformOrigin: "bottom center" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative z-10 flex flex-col md:flex-row h-full w-full">
        
        {/* Top / Left Side: Text Content */}
        <div className="flex flex-col p-6 sm:p-8 md:p-12 w-full md:w-1/2 flex-1 md:flex-none pointer-events-none">
          <p className="text-xl md:text-2xl text-(--on-bg-low) mb-6 font-medium">
            {lang === 'ru' ? 'Мы делаем...' : 'We do...'}
          </p>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <Icon className="w-6 h-6 md:w-7 md:h-7 text-(--primary)" />
            </div>
            <h1 className="text-display-1 text-[2rem] sm:text-[2.5rem] md:text-[2.5rem] lg:text-[3rem] leading-tight tracking-tight">
              {service.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {service.services.map((s: string) => (
              <Badge variant="outlined-static" key={s} className="bg-white/5 border-white/10 text-white/80">
                {s}
              </Badge>
            ))}
          </div>

          <div className="flex flex-row items-center gap-8 md:gap-12 mt-auto pb-4">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-(--on-bg-medium) mb-1">{t("services.from")}</span>
              <span className="text-xl md:text-2xl font-semibold">{service.price.from} ₽</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-(--on-bg-medium) mb-1">{t("services.avg_label")}</span>
              <span className="text-xl md:text-2xl font-semibold">{service.price.avg} ₽</span>
            </div>
          </div>
        </div>

        {/* Bottom / Right Side: 3D Viewer */}
        <div className="relative w-full h-40 md:h-full md:w-1/2 rounded-b-[32px] md:rounded-r-[32px] md:rounded-bl-none overflow-hidden bg-[#111] pointer-events-none shrink-0">
          {modelViewerLoaded ? (
            <ModelViewerElement
              key={modelPath}
              src={modelPath}
              alt={`3D representative for ${service.title}`}
              auto-rotate
              camera-controls
              interaction-prompt="none"
              rotation-per-second="20deg"
              style={{
                width: '100%',
                height: '100%',
                '--poster-color': 'transparent',
              } as React.CSSProperties}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 animate-pulse text-xs">
              Loading 3D...
            </div>
          )}
          
          <div className="hidden md:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
          <div className="block md:hidden absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const { t, lang } = useLanguage();
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const ModelViewerElement = 'model-viewer' as any;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customElements.get("model-viewer")) {
      setModelViewerLoaded(true);
      return;
    }
    let cancelled = false;
    customElements.whenDefined("model-viewer").then(() => {
      if (!cancelled) setModelViewerLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  const services = [
    {
      id: "development",
      title: t("services.web-development.short"),
      description: t("services.web-development.desc"),
      icon: CodeIcon,
      services: [t("services.dev_sub1"), t("services.dev_sub2"), t("services.dev_sub3"), t("services.dev_sub4"), t("services.dev_sub5")],
      price: { from: "75 000", avg: "250 000" },
    },
    {
      id: "motion",
      title: t("services.3d-motion.short"),
      description: t("services.3d-motion.desc"),
      icon: DiamondIcon,
      services: [t("services.motion_sub1"), t("services.motion_sub2"), t("services.motion_sub3"), t("services.motion_sub4"), t("services.motion_sub5")],
      price: { from: "45 000", avg: "100 000" },
    },
    {
      id: "branding",
      title: t("services.branding.short"),
      description: t("services.branding.desc"),
      icon: SignatureIcon,
      services: [t("services.branding_sub1"), t("services.branding_sub2"), t("services.branding_sub3"), t("services.branding_sub4")],
      price: { from: "75 000", avg: "150 000" },
    },
  ];

  const handleSwipe = (direction: "left" | "right") => {
    setSelectedIndex((prev) => {
      if (direction === "right") return (prev + 1) % services.length;
      return (prev - 1 + services.length) % services.length;
    });
  };

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden text-on-bg-high min-h-[700px] flex items-center justify-center">
      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js"
        strategy="afterInteractive"
        onError={() => console.error("[model-viewer] CDN script failed to load")}
      />
      
      <Container className="relative z-10 w-full flex justify-center px-4 md:px-0">
        <div className="relative w-full max-w-[900px] h-[600px] flex items-center justify-center">
          {services.map((service, index) => {
            let offset = index - selectedIndex;
            if (offset < -1) offset += services.length;
            if (offset > 1) offset -= services.length;

            const isActive = offset === 0;
            const position = offset === 0 ? "center" : offset < 0 ? "left" : "right";
            
            const Icon = service.icon;
            const modelPath = serviceToModelPaths[service.id] || "/3d/code_icon.glb";

            return (
              <ServiceCard
                key={service.title}
                service={service}
                isActive={isActive}
                position={position}
                onClick={() => { if (!isActive) setSelectedIndex(index); }}
                Icon={Icon}
                modelPath={modelPath}
                modelViewerLoaded={modelViewerLoaded}
                ModelViewerElement={ModelViewerElement}
                t={t}
                lang={lang}
                handleSwipe={handleSwipe}
              />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
