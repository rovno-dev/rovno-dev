"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { MapPin } from "@phosphor-icons/react";
import { resolveExpertSocialIcon } from "@/components/icons/expert-icon-map";
import TatarstanIcon from "@/components/icons/experts-icons/Tatarstan-icon";
import { designMesh, rgba, isLightColor } from "@/hooks/use-color-mesh";

function getHueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function ExpertHero({
  slug, displayName, role, location, heroImage, socials,
}: {
  slug: string;
  displayName: string;
  role: string;
  location: string | null;
  heroImage: string;
  socials: any[];
}) {
  const hue = getHueFromName(displayName);
  const mesh = designMesh(hue);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    setMouse({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    });
  };
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const isLight = isLightColor(mesh.base);
  const textColor = isLight ? "text-[var(--dark-8)]" : "text-white";
  const subTextColor = isLight ? "text-[var(--dark-8)]/80" : "text-white/80";
  const shadowClass = isLight ? "drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]" : "drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]";

  const headingY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative isolate overflow-hidden border-b border-(--outline) pt-header"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, black 5%, black 100%)`,
          maskImage: `linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, black 5%, black 100%)`,
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: `color-mix(in srgb, var(--bg) 20%, ${rgba(mesh.base, 1)} 80%)` }} />
        <motion.div animate={{ x: mouse.x * -30, y: mouse.y * -30 }} transition={{ type: "spring", stiffness: 40, damping: 20 }} className="mesh-blob-1 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 60% 55% at 20% 82%, ${rgba(mesh.highlight, 1)} 0%, ${rgba(mesh.highlight, 0)} 65%)` }} />
        <motion.div animate={{ x: mouse.x * 40, y: mouse.y * 40 }} transition={{ type: "spring", stiffness: 40, damping: 20 }} className="mesh-blob-2 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 50% 45% at 80% 18%, ${rgba(mesh.bright, 0.85)} 0%, ${rgba(mesh.bright, 0)} 60%)` }} />
        <motion.div animate={{ x: mouse.x * -50, y: mouse.y * -50 }} transition={{ type: "spring", stiffness: 40, damping: 20 }} className="mesh-blob-3 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 75% 65% at 82% 88%, ${rgba(mesh.shadow, 0.95)} 0%, ${rgba(mesh.shadow, 0)} 70%)` }} />
        <motion.div animate={{ x: mouse.x * 20, y: mouse.y * 20 }} transition={{ type: "spring", stiffness: 40, damping: 20 }} className="mesh-blob-4 absolute inset-[-18%]" style={{ background: `radial-gradient(ellipse 50% 55% at 15% 15%, ${rgba(mesh.deep, 0.75)} 0%, ${rgba(mesh.deep, 0)} 62%)` }} />
        <div
          className="hero-ascii-drift pointer-events-none absolute inset-0 bg-(--on-bg-high)/20"
          style={{
            maskImage: `url("data:image/svg+xml,%3Csvg width='44' height='44' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='4' y='16' fill='black' font-family='monospace' font-size='14'%3E[%3C/text%3E%3Ctext x='26' y='16' fill='black' font-family='monospace' font-size='14'%3E]%3C/text%3E%3Ctext x='4' y='38' fill='black' font-family='monospace' font-size='14'%3E]%3C/text%3E%3Ctext x='26' y='38' fill='black' font-family='monospace' font-size='14'%3E[%3C/text%3E%3C/svg%3E")`,
            maskSize: "44px 44px",
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg width='44' height='44' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='4' y='16' fill='black' font-family='monospace' font-size='14'%3E[%3C/text%3E%3Ctext x='26' y='16' fill='black' font-family='monospace' font-size='14'%3E]%3C/text%3E%3Ctext x='4' y='38' fill='black' font-family='monospace' font-size='14'%3E]%3C/text%3E%3Ctext x='26' y='38' fill='black' font-family='monospace' font-size='14'%3E[%3C/text%3E%3C/svg%3E")`,
            WebkitMaskSize: "44px 44px",
          }}
        />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.42, mixBlendMode: "overlay" }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <filter id="hero-grain-fine"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect x="-20%" y="-20%" width="140%" height="140%" filter="url(#hero-grain-fine)" className="hero-grain-drift" />
        </svg>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.16, mixBlendMode: "soft-light" }} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <filter id="hero-grain-coarse"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect x="-20%" y="-20%" width="140%" height="140%" filter="url(#hero-grain-coarse)" />
        </svg>
        <div className="hero-light-sweep pointer-events-none absolute" style={{ inset: "-30%", background: "radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 30%, transparent 60%)", mixBlendMode: "soft-light", opacity: 0.5 }} />
      </div>

      {/* Dark overlay to guarantee text contrast on light meshes */}


      {socials.length > 0 && (
        <div className="absolute top-20 right-6 z-30 flex flex-col gap-2">
          {socials.map((social: any, key: number) => (
            <Button key={key} variant="glass" size="icon-medium" shape="round" asChild className="[&_path]:fill-(--on-bg-high)! bg-(--card)/40 border-(--outline)/50 backdrop-blur-md hover:bg-(--card)/80 shadow-sm" style={{ animationDelay: `${300 + key * 80}ms` }}>
              <Link href={social.href} target="_blank">{resolveExpertSocialIcon(social.kind)}</Link>
            </Button>
          ))}
        </div>
      )}

      <Container variant="full-width" className="relative z-10">
        <motion.div style={{ y: headingY, opacity: headingOpacity }} className="mx-auto max-w-[1400px] pt-6 pb-10 md:pt-8 md:pb-12 flex flex-col items-center text-center">

          {heroImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px] aspect-square overflow-hidden mb-6 shadow-2xl"
            >
              <Image
                src={heroImage}
                alt={displayName}
                fill
                className="object-cover"
                priority
              // sizes="(max-width: 768px) 256px, 400px"
              />
            </motion.div>
          )}

          {/* Compact name row */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading  tracking-[-0.045em] leading-[1.05] text-balance ${textColor} ${shadowClass}`}
            >
              {displayName}
            </motion.h1>
            {slug === "niyazgim" && <TatarstanIcon className="size-7 md:size-9 shrink-0 drop-shadow-md" />}
          </div>

          <div className="flex gap-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className={`text-base md:text-lg lg:text-xl  max-w-[640px] leading-relaxed text-balance ${subTextColor} ${shadowClass}`}
            >
              <p className="flex items-center gap-2">
                {role}
                <span>
                  •
                </span>
                {location && (
                  <span className="flex gap-1 items-center">
                    <MapPin className="size-3.5" /> {location}
                  </span>
                )}
              </p>
            </motion.div>

          </div>
        </motion.div>
      </Container>
    </section>
  );
}
