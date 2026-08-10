"use client";

import { ScrollReveal } from "@/components/layout/scroll-reveal";
import BestWorksSection from "./_components/best-projects-section";
import HeroSection from "./_components/hero-section";
import ServicesSection from "./_components/services-section";
import SocialsSection from "./_components/socials-section";

export default function Home() {
  return (
    <>
      <HeroSection />

      <ScrollReveal threshold={0.15}>
        <BestWorksSection />
      </ScrollReveal>

      <ScrollReveal delay={100} threshold={0.2}>
        <ServicesSection />
      </ScrollReveal>

      <ScrollReveal delay={150} threshold={0.2}>
        <SocialsSection />
      </ScrollReveal>
    </>
  );
}
