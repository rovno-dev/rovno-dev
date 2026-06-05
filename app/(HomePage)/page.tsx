/* LLM context: Implementing the main page (/) based on Figma "Главная страница - Desktop (Noir Evolution)".
   Uses existing components: Container, Button, Badge, Card, AspectRatio, Input, Textarea, KeyboardArrowRightIcon, etc.
   Follows the same code style and comments pattern as other files. */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KeyboardArrowRightIcon, DesignServicesIcon, DiamondIcon, PublicIcon, StylusNoteIcon } from "@/components/icons";
import { DeployedCodeIcon } from "@/components/icons/unideka-icons/deployed-code-icon";
import { cn } from "@/lib/utils";

/* ---------- Hero Section ---------- */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-(--bg) pt-20 pb-16 md:pb-24">
      {/* Ambient background blurs (matching Figma) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full bg-(--primary)/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-(--primary)/5 blur-3xl" />
      </div>

      <Container>
        <div className="relative z-10 mx-auto max-w-[672px] text-center">
          {/* DIGITAL EXCELLENCE badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-(--outline) bg-(--card-glass) px-6 py-2 text-sm font-medium text-(--on-bg-medium) backdrop-blur-glass">
            DIGITAL EXCELLENCE
          </div>

          <h1 className="text-display-1 md:text-[4rem] font-heading font-bold leading-[1.1] text-(--on-bg-high) mb-6">
            ИНЖИНИРИНГ <br /> БУДУЩЕГО
          </h1>

          <p className="mx-auto max-w-[606px] text-body-1 text-(--on-bg-medium) mb-10">
            Проектируем и разрабатываем высоконагруженные цифровые продукты.
            От айдентики до сложных сервисов — полный цикл создания.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="large" shape="round" asChild>
              <Link href="https://forms.yandex.com/cloud/6936a4b1d0468820623c548e">
                Обсудить проект
                <KeyboardArrowRightIcon className="size-5" />
              </Link>
            </Button>
            <Button variant="outlined" size="large" shape="round" asChild>
              <Link href="https://dprofile.ru/rovno_dev">
                Смотреть работы
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative illustration cards (simplified) */}
        <div className="relative mt-16 flex justify-center gap-4 opacity-30 pointer-events-none select-none">
          <div className="size-24 rounded-2xl bg-(--primary-card) border border-(--outline)" />
          <div className="size-24 rounded-2xl bg-(--primary-card) border border-(--outline) translate-y-8" />
          <div className="size-24 rounded-2xl bg-(--primary-card) border border-(--outline)" />
        </div>
      </Container>
    </section>
  );
}

/* ---------- Selected Works Section ---------- */
const featuredProjects = [
  {
    title: "Vanguard",
    tags: ["Fintech", "Платформа"],
    image: "/images/projects/vanguard.png",
    href: "https://dprofile.ru/case/116595/vanguard-internet-magazin-elektroniki",
  },
  {
    title: "Aurora Flux",
    tags: ["Айдентика"],
    image: "/images/projects/alx.png",
    href: "https://dprofile.ru/case/124174/cuzoi-alx-9-ii-vystavka",
  },
  {
    title: "E-commerce Aura",
    tags: ["E-commerce"],
    image: "/images/projects/sadovod.png",
    href: "https://dprofile.ru/case/162985/sadovod-internet-magazin",
  },
];

function SelectedWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-display-2 text-(--on-bg-high)">ИЗБРАННЫЕ РАБОТЫ</h2>
          <Button variant="text" size="medium" asChild>
            <Link href="https://dprofile.ru/rovno_dev">
              Все проекты
              <KeyboardArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First project – large */}
          <div className="md:col-span-2">
            <ProjectCard project={featuredProjects[0]} large />
          </div>
          {featuredProjects.slice(1).map((project, idx) => (
            <ProjectCard key={idx} project={project} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProjectCard({
  project,
  large = false,
}: {
  project: (typeof featuredProjects)[0];
  large?: boolean;
}) {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-4xl border border-(--outline) bg-card ring-0 transition-all active:scale-[0.99]",
          large ? "aspect-[1232/528]" : "aspect-[600/450]"
        )}
      >
        <Image
          fill
          src={project.image}
          alt={project.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags.map((tag) => (
              <Badge
                key={tag}
                variant="glass-static"
                size="chip-small"
                className="text-white border-white/20"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h3 className="text-display-3 md:text-display-2 text-white leading-tight max-w-[90%] transition-transform group-hover:-translate-y-1">
            {project.title}
          </h3>
        </div>
        {/* Arrow button */}
        <div className="absolute bottom-6 right-6 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            size="icon-small"
            shape="round"
            className="bg-white text-black hover:bg-white"
          >
            <KeyboardArrowRightIcon className="size-5!" />
          </Button>
        </div>
      </Card>
    </a>
  );
}

/* ---------- Services Section ---------- */
const services = [
  {
    number: "01",
    title: "АЙДЕНТИКА",
    description:
      "Логотипы, фирменные стили и брендбуки, которые работают вдолгую и формируют сильный образ.",
    icon: <StylusNoteIcon className="size-10 text-(--on-bg-low)" />,
  },
  {
    number: "02",
    title: "ВЕБ-ДИЗАЙН",
    description:
      "Сайты и интерфейсы — точные, быстрые, продуманные до мелочей для решения задач бизнеса.",
    icon: <PublicIcon className="size-10 text-(--on-bg-low)" />,
  },
  {
    number: "03",
    title: "UX/UI ДИЗАЙН",
    description:
      "Продуманные интерфейсы и сценарии, которые выдерживают тесты с пользователями и повышают конверсию.",
    icon: <DiamondIcon className="size-10 text-(--on-bg-low)" />,
  },
  {
    number: "04",
    title: "РАЗРАБОТКА",
    description:
      "От лендингов до сложных высоконагруженных систем — пишем чистый код, который масштабируется.",
    icon: <DeployedCodeIcon className="size-10 text-(--on-bg-low)" />,
  },
];

function ServicesSection() {
  return (
    <section className="py-20 md:py-28 bg-(--bg)">
      <Container>
        <h2 className="text-display-2 text-(--on-bg-high) mb-12">ЧТО МЫ ДЕЛАЕМ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card
              key={service.number}
              className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 transition-all hover:shadow-lg hover:shadow-(--primary)/5"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-(--primary-card) text-(--primary)">
                    {service.icon}
                  </div>
                  <span className="text-display-4 font-heading text-(--on-bg-low) opacity-40">
                    {service.number}
                  </span>
                </div>
              </div>
              <h3 className="text-display-4 text-(--on-bg-high) mb-3">{service.title}</h3>
              <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                {service.description}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- CTA Section ---------- */
function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-(--primary-card) to-(--card) border border-(--outline) p-8 md:p-16">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-(--primary)/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-[672px] text-center">
            <h2 className="text-display-2 text-(--on-bg-high) mb-4">НАЧАТЬ ПРОЕКТ</h2>
            <p className="text-body-2 text-(--on-bg-medium) mb-10">
              Оставьте заявку, и мы свяжемся с вами для обсуждения деталей, сроков и стоимости вашего будущего продукта.
            </p>

            <form className="flex flex-col gap-5 text-left">
              <Input placeholder="E-mail или Telegram" />
              <Input placeholder="Ваше имя" />
              <Textarea placeholder="Краткое описание задачи" rows={4} />
              <Button size="large" className="w-full">
                ОТПРАВИТЬ ЗАЯВКУ
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Main Page ---------- */
export default function Home() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <HeroSection />
      <SelectedWorksSection />
      <ServicesSection />
      <CTASection />
    </main>
  );
}
