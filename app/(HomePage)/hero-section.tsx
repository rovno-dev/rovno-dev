import { CloudIcon, DeployedCodeIcon, DesignServicesIcon, DiamondIcon, KeyboardArrowRightIcon, PublicIcon, SunIcon } from "@/components/icons";
import IllustrationCard from "@/components/layout/illustration-card/illustration-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/utils/constants/routes";
import Link from "next/link";


export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--outline)_1px,transparent_1px),linear-gradient(to_bottom,var(--outline)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.12]" /> */}

      {/* <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-50" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100 250C200 250 400 150 720 150C1040 150 1240 250 1540 250" stroke="var(--primary)" strokeWidth="0.5" opacity="0.3" />
        <path d="M-100 550C200 550 400 650 720 650C1040 650 1240 550 1540 550" stroke="var(--primary)" strokeWidth="0.5" opacity="0.3" />
        <path d="M350 -100C350 200 450 400 450 800" stroke="var(--outline)" strokeWidth="1" />
        <path d="M1090 -100C1090 200 990 400 990 800" stroke="var(--outline)" strokeWidth="1" />
      </svg> */}

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
        className="bottom-[8%]  bottom-[15%] right-[8%] md:left-[20%] rotate-17 md:-rotate-15 animate-reveal"
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
  const badges = [
    'Разработка',
    'Дизайн',
    '3D',
    'ИИ-автоматизация'
  ];
  return (
    <section className="relative min-h-[70svh] md:min-h-[800px] flex items-center justify-center overflow-hidden bg-(--bg) -top-[46px] md:-top-[70px] mb-[-46px] md:mb-[-70px]">
      <HeroBackground />

      <Container className="relative z-20 pt-16 md:pt-0">
        <div className="mx-auto max-w-[800px] text-center flex flex-col items-center px-4 md:px-0">
          {/* <div className="mb-4 md:mb-8 justify-center animate-reveal [animation-delay:200ms] flex gap-2 flex-wrap">
            {badges.map((el, key) =>
              <Badge
                key={key}
                size="chip-xlarge"
                variant="glass-static"
              >
                {el}
              </Badge>
            )}
          </div> */}

          <div className="flex flex-col gap-2 mb-6 md:mb-8">
            <h1 className="text-display-1 text-5xl sm:text-7xl leading-none md:text-8xl lg:text-[6.5rem] tracking-tighter text-(--on-bg-high) animate-reveal [animation-delay:400ms] fill-mode-both uppercase flex flex-col">Разработка</h1>
            <h1 className="text-display-1 text-5xl sm:text-7xl leading-none md:text-8xl lg:text-[6.5rem] tracking-tighter text-(--on-bg-high) animate-reveal [animation-delay:350ms] fill-mode-both uppercase flex flex-col">Будущего</h1>
          </div>

          <p className="mx-auto text-body-3 md:text-body-1 text-(--on-bg-medium) mb-10 md:mb-12 animate-reveal [animation-delay:600ms] fill-mode-both leading-relaxed font-medium">
            Проектируем и разрабатываем высоконагруженные цифровые продукты, делаем продающий дизайн, залипательные 3D и видео
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-reveal [animation-delay:800ms] fill-mode-both">
            <Button className="w-full sm:w-fit h-14 md:h-16! px-8 md:px-10! rounded-2xl! shadow-[0_0_20px_rgba(var(--brand-9-rgb),0.3)]" size="large" shape="square" asChild>
              <Link href="https://forms.yandex.ru/cloud/6a23793395add518b6d0f197">
                Обсудить проект
                <KeyboardArrowRightIcon className="size-5 md:size-6!" />
              </Link>
            </Button>
            <Button className="w-full sm:w-fit h-14 md:h-16! px-8 md:px-10! rounded-2xl!" variant="outlined" size="large" shape="square" asChild>
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