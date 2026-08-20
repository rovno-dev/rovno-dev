"use client";

import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import BestWorksSection from "./_components/best-projects-section";
import HeroSection from "./_components/hero-section";
import ServicesSection from "./_components/services-section";
import SocialsSection from "./_components/socials-section";
import CtaSection from "./_components/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />

      <ScrollReveal threshold={0.05}>
        <ServicesSection />
      </ScrollReveal>

      <ScrollReveal delay={100} threshold={0.05}>
        <BestWorksSection />
      </ScrollReveal>

      <ScrollReveal delay={150} threshold={0.05}>
        <SocialsSection />
      </ScrollReveal>

      <ScrollReveal delay={200} threshold={0.05}>
        <CtaSection />
      </ScrollReveal>
    </>
  );
}
