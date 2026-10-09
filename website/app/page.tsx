import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import BestWorksSection from "./_components/best-projects-section";
import ServicesSection from "./_components/sercices-section";
import NumbersSection from "./_components/numbers-section";
import SocialsSection from "./_components/socials-section";
import CtaSection from "./_components/cta-section";
import HeroSection from "./_components/hero-section";
import { fetchPublishedProjectsServer } from "@/utils/api/projects";

// Featured projects change rarely; a minute of ISR is plenty and keeps
// the home route static-fast for repeat visitors.
export const revalidate = 60;

export default async function Home() {
  // Fail-soft: an unreachable backend yields an empty list, and the
  // featured section renders its empty state instead of a broken grid.
  const projects = await fetchPublishedProjectsServer();

  return (
    <>
      <HeroSection />
      <ScrollReveal threshold={0.05}>
        <ServicesSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <NumbersSection />
      </ScrollReveal>
      <ScrollReveal delay={100} threshold={0.05}>
        <BestWorksSection projects={projects} />
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
