import { CloudIcon, DeployedCodeIcon, DesignServicesIcon, DiamondIcon, KeyboardArrowRightIcon, PublicIcon, SunIcon } from "@/components/icons";
import IllustrationCard from "@/components/layout/illustration-card/illustration-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/utils/constants/routes";
import Link from "next/link";
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-radial-[at_50%_40%] from-transparent via-transparent to-(--bg) z-10" />
      <IllustrationCard
        icon={<SunIcon />}
        className="hidden md:block top-[8%] left-[8%] md:top-[12%] md:left-[15%] -rotate-12 animate-reveal"
        style={{ transitionDelay: '100ms' }}
      />
      <IllustrationCard
        icon={<CloudIcon />}
        className="top-[45%] -left-10 md:left-8 -rotate-10 md:rotate-6 animate-reveal"
        style={{ transitionDelay: '300ms' }}
      />
      <IllustrationCard
        icon={<DeployedCodeIcon />}
        className="bottom-[8%] bottom-[15%] right-[8%] md:left-[20%] rotate-17 md:-rotate-15 animate-reveal"
        style={{ transitionDelay: '500ms' }}
      />
      <IllustrationCard
        icon={<DesignServicesIcon />}
        className="top-[12%] right-[10%] md:top-[10%] md:right-[25%] rotate-12 animate-reveal"
        style={{ transitionDelay: '200ms' }}
      />
      <IllustrationCard
        icon={<DiamondIcon />}
        className="hidden md:block top-[35%] -right-10 md:right-12 -rotate-12 animate-reveal"
        style={{ transitionDelay: '400ms' }}
      />
      <IllustrationCard
        icon={<PublicIcon />}
        className="hidden md:block md:bottom-[20%] md:right-[16%] rotate-61 animate-reveal"
        style={{ transitionDelay: '600ms' }}
      />
    </div>
  );
}
export default function HeroSection() {
  return (
    <section className="relative min-h-[75svh] md:min-h-[850px] 2xl:min-h-[1000px] flex items-center justify-center overflow-hidden bg-(--bg) -top-[46px] md:-top-[70px] mb-[-46px] md:mb-[-70px]">
      <HeroBackground />
      <Container className="relative z-20 pt-16 md:pt-0">
        <div className="mx-auto max-w-[800px] 2xl:max-w-[1200px] text-center flex flex-col items-center px-4 md:px-0">
          <div className="flex flex-col gap-2 mb-6 md:mb-8 2xl:mb-12">
            <h1 className="text-display-1 text-5xl sm:text-7xl leading-none md:text-8xl lg:text-[6.5rem] 2xl:text-[9.5rem] tracking-tighter text-(--on-bg-high) animate-reveal [animation-delay:400ms] fill-mode-both uppercase">Разработка</h1>
            <h1 className="text-display-1 text-5xl sm:text-7xl leading-none md:text-8xl lg:text-[6.5rem] 2xl:text-[9.5rem] tracking-tighter text-(--on-bg-high) animate-reveal [animation-delay:350ms] fill-mode-both uppercase">Будущего</h1>
          </div>
          <p className="mx-auto text-body-3 md:text-body-1 2xl:text-[1.85rem] text-(--on-bg-medium) mb-10 md:mb-12 2xl:mb-20 animate-reveal [animation-delay:600ms] fill-mode-both leading-relaxed font-medium 2xl:max-w-[1000px]">
            Проектируем и разрабатываем высоконагруженные цифровые продукты, делаем продающий дизайн, залипательные 3D и видео
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-reveal [animation-delay:800ms] fill-mode-both">
            <Button className="w-full sm:w-fit h-14 md:h-16! 2xl:h-22! px-8 md:px-10! 2xl:px-16! rounded-2xl! 2xl:rounded-3xl! shadow-[0_0_30px_rgba(var(--brand-9-rgb),0.2)] 2xl:text-2xl" size="large" shape="square" asChild>
              <Link href="https://forms.yandex.ru/cloud/6a23793395add518b6d0f197">
                Обсудить проект
                <KeyboardArrowRightIcon className="size-5 md:size-6! 2xl:size-10!" />
              </Link>
            </Button>
            <Button className="w-full sm:w-fit h-14 md:h-16! 2xl:h-22! px-8 md:px-10! 2xl:px-16! rounded-2xl! 2xl:rounded-3xl! 2xl:text-2xl" variant="outlined" size="large" shape="square" asChild>
              <Link href={ROUTES.projects.href}>
                Смотреть работы
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
