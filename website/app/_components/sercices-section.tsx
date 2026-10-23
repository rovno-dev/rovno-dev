/// <reference types="@google/model-viewer" />

"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CodeIcon, DiamondIcon, SignatureIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { PROJECTS, type Project } from "@/app/_data/projects";
import { useLanguage } from "@/providers/language-provider";
import { Badge } from "@/components/ui/badge";

// 1. Assign GLB model file paths to your service titles
const serviceToProjectSlugs: Record<string, string[]> = {
  "development": ["vanguard", "sadovod", "courtElegance", "concord"],
  "motion": ["alx", "bread", "concord"],
  "branding": ["alx", "bread"],
};

// Create a mapping for your 3D assets matching the service key
const serviceToModelPaths: Record<string, string> = {
  "development": "/3d/code_icon.glb",
  "motion": "/3d/3d_icon.glb",
  "branding": "/3d/design_icon.glb",
};

function getLatestProjectForService(serviceId: string): Project {
  const slugs = serviceToProjectSlugs[serviceId] || [];
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
  // Wait for the CDN-loaded <model-viewer> custom element to register.
  //
  // Why CDN and not `import("@google/model-viewer")`:
  //   The npm package ships a pre-source build that still contains
  //   `process.env.NODE_ENV` checks. When it is pulled in via a dynamic
  //   import inside useEffect, Turbopack does not rewrite those checks
  //   for dynamic node_modules chunks, so at runtime the value is
  //   undefined -> Lit falls back to its dev build and logs "Lit is in
  //   dev mode" in production. The CDN-served .min.js build has
  //   `"production"` baked in by model-viewer's own Rollup step, so the
  //   production Lit code path is what actually runs.
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
    return () => {
      cancelled = true;
    };
  }, []);

  const services = [
    {
      id: "development",
      title: t("services.web-development.short"),
      description: t("services.web-development.desc"),
      icon: CodeIcon,
      color: "#3b82f6",
      services: [t("services.dev_sub1"), t("services.dev_sub2"), t("services.dev_sub3"), t("services.dev_sub4"), t("services.dev_sub5")],
      price: { from: "75 000", avg: "250 000" },
    },
    {
      id: "motion",
      title: t("services.3d-motion.short"),
      description: t("services.3d-motion.desc"),
      icon: DiamondIcon,
      color: "#f59e0b",
      services: [t("services.motion_sub1"), t("services.motion_sub2"), t("services.motion_sub3"), t("services.motion_sub4"), t("services.motion_sub5")],
      price: { from: "45 000", avg: "100 000" },
    },
    {
      id: "branding",
      title: t("services.branding.short"),
      description: t("services.branding.desc"),
      icon: SignatureIcon,
      color: "#a855f7",
      services: [t("services.branding_sub1"), t("services.branding_sub2"), t("services.branding_sub3"), t("services.branding_sub4")],
      price: { from: "75 000", avg: "150 000" },
    },
  ];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimeout = useRef<NodeJS.Timeout | null>(null);

  const ModelViewerElement = 'model-viewer' as any;

  // Autoplay logic - rotate services every 6 seconds
  useEffect(() => {
    if (!autoPlayTimer.current) {
      autoPlayTimer.current = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % services.length);
      }, 6000);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
      if (autoPlayTimeout.current) clearTimeout(autoPlayTimeout.current);
      autoPlayTimer.current = null;
      autoPlayTimeout.current = null;
    };
  }, []);

  // Stop autoplay on interaction, resume after 5 seconds of inactivity
  const handleInteraction = () => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    if (autoPlayTimeout.current) clearTimeout(autoPlayTimeout.current);
    autoPlayTimeout.current = setTimeout(() => {
      autoPlayTimer.current = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % services.length);
      }, 6000);
    }, 5000);
  };

  const currentService = services[selectedIndex];
  const currentProject = getLatestProjectForService(currentService.id);
  const Icon = currentService.icon;

  // 3. Extract the right model based on the active slide layout
  const currentModelPath = serviceToModelPaths[currentService.id] || "/3d/code_icon.glb";

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden text-on-bg-high">
      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js"
        strategy="afterInteractive"
        onError={() =>
          console.error("[model-viewer] CDN script failed to load")
        }
      />
      <div className="relative z-10 flex flex-col justify-between min-h-full">
        <Container className="h-full">
          <div className="h-full grid grid-cols-1 sm:grid-cols-2 gap-10">
            {/* LEFT COLUMN: Texts & Navigation */}
            <div className="h-full flex flex-col justify-between">
              <div>
                <p className="text-xl md:text-2xl text-(--on-bg-low) max-w-2xl mb-4">
                  {lang === 'ru' ? 'Мы делаем...' : 'We do...'}
                </p>
                <h1 key={currentService.title} className="text-display-1 text-[2rem] sm:text-[2.75rem] lg:text-[4rem] mb-6 animate-slide-in">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 mb-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-(--on-bg-medium)">{t("services.from")}</span>
                    <span className="text-2xl font-semibold">{currentService.price.from} ₽</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-(--on-bg-medium)">{t("services.avg_label")}</span>
                    <span className="text-2xl font-semibold">{currentService.price.avg} ₽</span>
                  </div>
                </div>
              </div>

              <div className="no-scrollbar overflow-x-scroll flex gap-2 w-full">
                {services.map((service, index) => {
                  const ServiceIcon = service.icon;
                  const isActive = index === selectedIndex;
                  return (
                    <Button
                      variant={'outlined'}
                      className="h-[64px] w-[200px]! p-2! relative overflow-hidden"
                      key={service.title}
                      onClick={() => {
                        setSelectedIndex(index);
                        handleInteraction();
                      }}
                      onPointerDown={handleInteraction}
                    >
                      <div className={`absolute inset-y-0 left-0 bg-(--primary)/20 transition-all duration-100 ${isActive ? "animate-service-progress" : ""}`} style={{ width: '0%', animationDuration: '6000ms' }} />
                      <div className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
                        <div className="w-12 h-12 relative overflow-hidden pointer-events-none" onPointerDown={(e) => e.stopPropagation()}>
                          {modelViewerLoaded ? (
                            <ModelViewerElement
                              key={serviceToModelPaths[service.id] || "/3d/code_icon.glb"}
                              src={serviceToModelPaths[service.id] || "/3d/code_icon.glb"}
                              interaction-prompt="none"
                              style={{ width: '100%', height: '100%', '--poster-color': 'transparent' } as React.CSSProperties}
                            />
                          ) : (
                            <ServiceIcon className="w-4 h-4" />
                          )}
                        </div>
                        <span>{service.title}</span>
                      </div>
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
                  rotation-per-second="20deg"
                  style={{
                    background: 'var(--dark-4)',
                    backgroundSize: '40px 40px',
                    backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    '--poster-color': 'transparent',
                  } as React.CSSProperties}
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
