"use client";

import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-(--brand-9) via-(--brand-6) to-(--brand-3) opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_60%)]" />
      <div className="absolute inset-0 grid-bg opacity-10" />

      <Container className="relative z-10">
        <div
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-5xl md:text-7xl font-heading font-bold leading-tight tracking-tight text-(--on-bg-high) mb-6">
            Готовы <span>начать проект</span>?
          </h2>
          <p className="text-xl md:text-2xl text-(--on-bg-medium) leading-relaxed mb-8 max-w-2xl mx-auto">
            Запишитесь на бесплатный аудит или опишите задачу прямо сейчас — ответим в течение 3 часов*
            <br />
            <span className="text-sm text-(--on-bg-low)">*с 8 до 23 по мск</span>
          </p>
          <div
          >
            <Button size="xlarge" shape="round" asChild className="shadow-2xl shadow-(--primary)/40">
              <Link href="https://max.ru/+79375803414">
                Написать в Max
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
