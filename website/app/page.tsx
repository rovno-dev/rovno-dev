import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import BestWorksSection from "./_components/best-projects-section";
import ServicesSection from "./_components/services-section";
import NumbersSection from "./_components/numbers-section";
import VideoShowcaseSection from "./_components/video-showcase-section";
import { fetchPublishedProjectsServer } from "@/utils/api/projects";
import HeroSection from "./_components/hero-section";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Цифровое агентство полного цикла",
  description:
    "Дизайн, LLM, сайты, приложения, логотипы и айдентика, 3D. Агентство полного цикла Rovno.dev.",
  path: "/",
  ogImage: buildOgImageUrl(
    "Rovno.dev",
    "Цифровое агентство полного цикла",
  ),
});

export const revalidate = 60;

export default async function Home() {
  // Both fetches fail soft to empty/zero - the page renders either way.
  const projects = await fetchPublishedProjectsServer();

  return (
    <>
      <HeroSection />
      <ScrollReveal threshold={0.05}>
        <ServicesSection />
      </ScrollReveal>
      <ScrollReveal threshold={0.05}>
        <BestWorksSection projects={projects} />
      </ScrollReveal>
      <ScrollReveal delay={100} threshold={0.05}>
        <NumbersSection />
      </ScrollReveal>
      <ScrollReveal delay={150} threshold={0.05}>
        <VideoShowcaseSection />
      </ScrollReveal>
    </>
  );
}
