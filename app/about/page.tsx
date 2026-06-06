/* LLM context: Implementing Apple-grade staggered entry animations for the About page experts grid */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { KeyboardArrowRightIcon } from "@/components/icons";

const experts = [
  {
    name: "Нияз Гимадиев",
    role: "Со-основатель и Технический директор",
    description: "Архитектор сложных систем, поэт кода и создатель Unideka UI. Отвечает за технологический стек и инновации.",
    image: "/images/experts/niyazgim.png",
    slug: "niyazgim"
  },
  {
    name: "Михаил Лапаев",
    role: "Со-основатель и Директор по работе с клиентами и продукту",
    description: "Мастер визуальных интерфейсов и продуктовой логики. Превращает хаос в эстетику и удобство пользователя.",
    image: "/images/experts/RovnoMikhail.jpg",
    slug: "RovnoMikhail"
  },
  {
    name: "Данил Киткин",
    role: "Со-основатель и Арт-директор",
    description: "Вдыхает жизнь в статичные объекты. Специализируется на высокотехнологичном моушн-дизайне, CGI и 3D",
    image: "/images/experts/RovnoDanil.jpg",
    slug: "RovnoDanil"
  }
];

function AboutHero() {
  return (
    <section className="py-16 md:py-24 border-b border-(--outline) overflow-hidden">
      <Container>
        <div className="max-w-[800px] animate-reveal">
          <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-8">
            Создаем цифровые продукты, <br />
            <span className="text-(--primary)">которые меняют правила.</span>
          </h1>
          <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed animate-reveal delay-100 fill-mode-both">
            Rovno.dev — это агентство полного цикла, где дизайн встречается с передовыми технологиями.
            Мы не просто рисуем интерфейсы, мы проектируем опыт, который помогает брендам расти
            в мире больших языковых моделей и цифровой трансформации.
          </p>
        </div>
      </Container>
    </section>
  );
}

function ExpertCard({ expert, index }: { expert: typeof experts[0], index: number }) {
  return (
    <Link
      href={`/${expert.slug}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <Card className="border-none bg-transparent shadow-none ring-0 p-0 overflow-visible">
        <div className="relative mb-6 overflow-hidden rounded-5xl border border-(--outline) bg-(--card) transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-(--primary)/10 group-hover:-translate-y-1">
          <AspectRatio ratio={4 / 5}>
            <Image
              src={expert.image}
              alt={expert.name}
              fill
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            />
          </AspectRatio>

          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button size="icon-small" shape="round" className="bg-white text-black hover:bg-white">
              <KeyboardArrowRightIcon className="size-5!" />
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-display-2 text-(--on-bg-high) mb-1">{expert.name}</h3>
          <p className="text-heading-3 font-medium text-(--primary) mb-3 uppercase tracking-wider">{expert.role}</p>
          <p className="text-body-3 text-(--on-bg-medium) leading-snug line-clamp-2 md:line-clamp-none">
            {expert.description}
          </p>
        </div>
      </Card>
    </Link>
  );
}

function ExpertsSection() {
  return (
    <section className="py-20 md:py-32">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 md:mb-16 animate-reveal">
          <div className="max-w-[600px]">
            <h2 className="text-display-3 md:text-display-2 mb-4">Наши эксперты</h2>
            <p className="text-body-2 text-(--on-bg-medium)">
              Команда специалистов, объединивших свои усилия для создания исключительных решений.
            </p>
          </div>
          <Button variant="glass" size="large" shape="round" asChild className="animate-in fade-in slide-in-from-right-4 duration-700">
            <Link href="https://forms.yandex.com/u/69975d0849af47b15b4c80df">Присоединиться к нам</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {experts.map((expert, idx) => (
            <ExpertCard key={idx} expert={expert} index={idx} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <AboutHero />
      <ExpertsSection />

      <section className="py-20 overflow-hidden opacity-30 pointer-events-none">
        <Container>
          <div className="text-[12vw] font-heading font-bold whitespace-nowrap text-(--outline) select-none animate-in slide-in-from-left duration-[10000ms] infinite alternate linear">
            DESIGN • CODE • INNOVATE • 3D • DESIGN • CODE
          </div>
        </Container>
      </section>
    </main>
  );
}