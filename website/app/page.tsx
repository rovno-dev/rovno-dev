/* LLM context: Enhancing HeroSection with architectural background lines and glassmorphic illustration cards to match high-end aesthetics. 
   Using predefined glass variables and backdrop blurs while maintaining existing structure and content. */

"use client";

import BestWorksSection from "./_components/best-projects-section";
import HeroSection from "./_components/hero-section";
import ServicesSection from "./_components/services-section";
import SocialsSection from "./_components/socials-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BestWorksSection />
      <ServicesSection />
      <SocialsSection />
    </>
  );
}