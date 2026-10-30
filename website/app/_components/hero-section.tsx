"use client";

import LogoIcon from "@/components/layout/logo/logo-icon";
import LogoIconEmpty from "@/components/layout/logo/logo-icon-empty";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";

export default function HeroSection() {
  return (
    <section className="relative bg-(--bg) text-(--on-bg-high) min-h-[40dvh] flex flex-col justify-between overflow-hidden selection:bg-(--primary) selection:text-(--on-primary)">

      {/* Structural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-12 z-0">
        <div className="w-px h-full bg-(--outline) opacity-40" />
        <div className="w-px h-full bg-(--outline) opacity-40 hidden md:block" />
        <div className="w-px h-full bg-(--outline) opacity-40 hidden md:block" />
        <div className="w-px h-full bg-(--outline) opacity-40" />
      </div>

      <Container className="relative z-10 flex flex-col justify-between h-full flex-1 pt-32 pb-16 md:pt-40 md:pb-20">
        {/* Massive Logo Icon (Vercel style) */}
        <div className="w-full flex-1 flex items-center justify-center my-12 md:my-0 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center w-full"
          >
            <LogoIconEmpty className="size-30 opacity-40" />
          </motion.div>
        </div>

        {/* Bottom Statement */}
        <div className="w-full flex justify-center md:justify-start pt-8 border-t border-(--outline)">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <p className="text-(--on-bg-high) text-heading-3">
              Для тех, кому дороги. <span className="text-(--on-bg-medium)">
                Cервисы будущего, использование ИИ приватно и эффективно и сервисы, радующие пользователей каждый день.
              </span>
            </p>
          </motion.div>
        </div>
      </Container>
    </section >
  );
}
