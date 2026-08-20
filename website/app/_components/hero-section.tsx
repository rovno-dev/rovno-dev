"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/utils/constants/routes";
import { TerminalStyledInline } from "@/components/layout/fancy/terminal-styled-inline";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-14 md:py-24 min-h-[calc(100dvh-46px)] md:min-h-[calc(100dvh-88px)]  flex items-center">
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none grid-bg " />
      <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto aspect-video object-cover scale-[1.3] md:scale-100">
        <iframe src="https://kinescope.io/embed/wJ6WmWZCkVYZr6yEDvYmLo?autoplay=1&amp;muted=1&amp;loop=1" className="absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-700 opacity-100" allow="autoplay; encrypted-media; fullscreen; accelerometer; gyroscope; picture-in-picture" allowFullScreen title="ALX-9 Promo Video">
        </iframe>
      </div>
      {/* bg-gradient-to-t from-(--bg) to-(--bg)/0 to-20 */}
      <div className="z-10 absolute h-full w-full bottom-0 left-0 bg-[#00000070]" />

      <Container className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-display-2 sm:text-display-1 md:text-[3.5rem] lg:text-[5rem] font-italic leading-[1.05] tracking-tight text-(--white) mb-6">
          Цифровые продукты <br />
          <span className="text-(--dark-1)">любой сложности</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <Button
            size="xlarge"
            shape="round"
            className="w-full sm:w-fit"
            variant={'filled'}
            asChild
          >
            <Link href={ROUTES.order.href}>
              Начать проект
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
