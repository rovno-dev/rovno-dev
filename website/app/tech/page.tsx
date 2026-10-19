import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Code } from "@phosphor-icons/react/dist/ssr";
import { TECH_STACK } from "@/app/_data/tech";

export const metadata = {
  title: "Технологии, которые мы используем | Rovno.dev",
  description: "Стек технологий агентства Rovno.dev: 1С, Python, Next.js, React, PostgreSQL. Разработка надежных решений под ключ.",
};

export default function TechIndexPage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="relative py-20 md:py-28 border-b border-(--outline) overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 15% 10%, var(--primary-glass), transparent 65%)",
          }}
        />
        <Container className="relative text-center">
          <div className="max-w-[820px] mx-auto animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.34em] text-(--on-bg-low) mb-5">
              Stack
            </p>
            <h1 className="text-display-2 md:text-display-0 text-(--on-bg-high) mb-6 leading-[1] tracking-[-0.03em]">
              Технологии
            </h1>
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[640px] mx-auto">
              Мы создаем масштабируемые, быстрые и безопасные цифровые продукты, используя самый надежный стек технологий на рынке.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech, idx) => (
              <Link
                key={tech.slug}
                href={`/tech/${tech.slug}`}
                className="group block animate-reveal fill-mode-both"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <Card className="h-full rounded-3xl border border-(--outline) bg-(--card) ring-0 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-xl hover:shadow-(--primary)/5">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-(--bg) border border-(--outline) text-(--on-bg-high) mb-6 shadow-sm">
                    <Code className="size-5" weight="regular" />
                  </div>
                  <h2 className="text-display-4 text-(--on-bg-high) mb-3">
                    {tech.titleRu}
                  </h2>
                  <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-6 line-clamp-3">
                    {tech.descRu}
                  </p>
                  <div className="flex items-center gap-1.5 text-body-4 font-medium text-(--primary) transition-transform group-hover:translate-x-1">
                    Подробнее <ArrowUpRight className="size-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
