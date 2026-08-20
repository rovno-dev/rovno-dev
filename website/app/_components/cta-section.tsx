"use client";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SpeedIllustration from "@/components/layout/fancy/rocket-blueprint";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-[rgba(29,77,122)]/50">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(29,77,122,0.4) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(29,77,122,0.4) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f2b46]/80" />
      </div>

      {/* Blueprint Rocket SVG */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none w-full px-4 aspect-[400/500] blur-[1px]">
        {/* <SpeedIllustration /> */}
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tight text-white mb-6">
            Найдём решение<br />
          </h2>
          <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Напишите <span><Link href={"/niyazgim"}>техническому директору</Link></span> в личку — он ответит в течение 3х часов*
            <br />
            <span className="text-sm text-white/50">*с 8 до 23 по мск</span>
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 mx-auto sm:max-w-md">
            <Button size="xlarge" variant={'filled'} asChild>
              <Link href="https://max.ru/+79375803414">Написать в Max</Link>
            </Button>
            <Button size="xlarge" variant={'filled'} asChild>
              <Link href="https://t.me/niyazgim">Написать в ТГ</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
