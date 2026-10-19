"use client";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Code,
  Cube,
  FilmStrip,
  Megaphone,
  Sparkle,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { SERVICES_META } from "@/app/_data/services/meta";

const ICONS: Record<string, React.ComponentType<{ className?: string; weight?: "bold" | "fill" | "regular" }>> = {
  palette: Palette,
  code: Code,
  cube: Cube,
  film: FilmStrip,
  megaphone: Megaphone,
  sparkle: Sparkle,
};

export default function ServicesIndexPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero */}
      <section className="relative py-20 md:py-28 border-b border-(--outline) overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 60% 70% at 25% 0%, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 70% at 25% 0%, black 40%, transparent 90%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 15% 10%, var(--primary-glass), transparent 65%)",
          }}
        />
        <Container className="relative">
          <div className="max-w-[820px] animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.34em] text-(--on-bg-low) mb-5">
              {t("services.page.title")}
            </p>
            <h1 className="text-display-2 md:text-display-0 text-(--on-bg-high) mb-6 leading-[1] tracking-[-0.03em]">
              {t("services.page.hero1")} <span className="text-(--primary)">{t("services.page.hero2")}</span> {t("services.page.hero3")}
            </h1>
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[640px]">
              {t("services.page.subtitle")}
            </p>
          </div>
        </Container>
      </section>

      {/* Services grid */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES_META.map((service, idx) => {
              const Icon = ICONS[service.iconKey];
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group block animate-reveal fill-mode-both"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <Card className="relative h-full overflow-hidden rounded-4xl border border-(--outline) bg-(--card) ring-0 p-7 md:p-9 transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-xl hover:shadow-(--primary)/5">
                    <div
                      aria-hidden
                      className="absolute top-0 right-0 size-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 100% 0%, var(--primary-glass), transparent 70%)`,
                      }}
                    />
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-(--bg) border border-(--outline) text-(--on-bg-high) shadow-sm">
                          {Icon && <Icon className="size-6" weight="regular" />}
                        </div>
                        <ArrowUpRight
                          className="size-5 text-(--on-bg-low) transition-all duration-300 group-hover:text-(--primary) group-hover:translate-x-1 group-hover:-translate-y-1"
                        />
                      </div>
                      <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) mb-2 tracking-tight">
                        {t(`services.${service.slug}.title`)}
                      </h2>
                      <p className="text-body-5 uppercase tracking-[0.18em] mb-4 text-(--on-bg-low)">
                        {t(`services.${service.slug}.tagline`)}
                      </p>
                      <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-8 flex-1">
                        {t(`services.${service.slug}.desc`)}
                      </p>
                      <div className="flex items-center gap-4 pt-5 border-t border-(--outline)">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-(--on-bg-low) mb-0.5">
                            {t("services.time")}
                          </p>
                          <p className="text-body-4 text-(--on-bg-high) font-medium">
                            {t(`services.${service.slug}.time`)}
                          </p>
                        </div>
                        <div className="w-px h-8 bg-(--outline)" />
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-(--on-bg-low) mb-0.5">
                            {t("services.price")}
                          </p>
                          <p className="text-body-4 text-(--on-bg-high) font-medium">
                            {t(`services.${service.slug}.price`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <Container>
          <div className="relative rounded-5xl border border-(--outline) bg-(--card) p-8 md:p-14 overflow-hidden text-center">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 90% at 50% 0%, var(--primary-glass), transparent 70%)",
              }}
            />
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-display-3 md:text-display-2 text-(--on-bg-high) tracking-tight mb-4">
                {t("services.cta.title")}
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-8">
                {t("services.cta.subtitle")}
              </p>
              <Button size="xlarge" asChild>
                <Link href="/order">
                  {t("services.cta.button")}
                  <ArrowUpRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
