"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/utils/constants/routes";
import { TerminalStyledInline } from "@/components/layout/terminal-styled-inline";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-14 md:py-24 min-h-[70vh] flex items-center">
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none grid-bg " />
      <div className="z-10 absolute h-full w-full bottom-0 left-0 bg-gradient-to-t from-(--bg) to-(--bg)/0 to-20%" />

      <Container className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-display-1 font-italic leading-[1.05] tracking-tight text-(--on-bg-high) mb-6">
          Цифровые продукты <br />
          <span className="text-(--on-bg-medium)">полного цикла</span>
        </h1>
        <p className="text-body-1 md:text-body-0 text-(--on-bg-medium) max-w-2xl mx-auto mb-10 leading-relaxed">
          Разработка, дизайн, 3D-анимация и айдентика. Создаём высоконагруженные решения, которые работают на результат.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <Button
            size="large"
            shape="round"
            className="w-full sm:w-fit"
            asChild
          >
            <Link href={ROUTES.order.href}>
              Начать проект
            </Link>
          </Button>
          <Button
            variant="glass"
            size="large"
            shape="round"
            className="w-full sm:w-fit"
            asChild
          >
            <Link href="/projects">
              Смотреть кейсы
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
