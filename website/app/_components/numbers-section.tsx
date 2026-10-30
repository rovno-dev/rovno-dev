"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

function NumberDisplay({ value, active }: { value: string; active: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    let iteration = 0;
    const chars = "0123456789";
    const original = value;
    const interval = setInterval(() => {
      if (!ref.current) return;
      const scrambled = original.split("").map((char, idx) => {
        if (char === " " || char === "." || char === "," || char === "-" || /[а-яА-Я]/.test(char)) return char;
        if (idx < iteration) return original[idx];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
      ref.current.textContent = scrambled;
      iteration += 1;
      if (iteration > original.length) {
        clearInterval(interval);
        ref.current.textContent = original;
      }
    }, 60);
    return () => clearInterval(interval);
  }, [value, active]);

  return (
    <h3
      ref={ref}
      className="text-(--on-bg-high) text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3"
    >
      {value}
    </h3>
  );
}

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return { ref, inView };
}

function SpotlightCard({ children, color }: { children: React.ReactNode; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect && ref.current) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ref.current.style.setProperty("--spot-x", `${x}px`);
      ref.current.style.setProperty("--spot-y", `${y}px`);
    }
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="group relative p-6 sm:p-8 flex flex-col h-full bg-(--card) border border-(--outline) rounded-3xl transition-colors hover:bg-(--state-hover) isolation-isolate overflow-hidden"
      style={{ "--spot-color": color } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 will-change-[opacity] mix-blend-overlay dark:mix-blend-screen"
        style={{
          background: `radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--spot-color) 0%, transparent 40%)`,
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}

export default function NumbersSection() {
  const { t } = useLanguage();
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });

  const stats = [
    {
      number: t("home.stats_team_number"),
      description: t("home.stats_team_experience"),
      buttonText: t("home.stats_team_btn"),
      href: "/team",
      color: "var(--primary)",
    },
    {
      number: t("home.stats_spec_number"),
      description: t("home.stats_spec_prep"),
      buttonText: t("home.stats_spec_btn"),
      href: "/order",
      color: "var(--primary)",
    },
    {
      number: t("home.stats_projects_number"),
      description: t("home.stats_projects_done"),
      buttonText: t("home.stats_projects_btn"),
      href: "/projects",
      color: "var(--primary)",
    },
    {
      number: t("home.stats_clients_number"),
      description: t("home.stats_happy_clients"),
      buttonText: t("home.stats_clients_btn"),
      href: "/reviews",
      color: "var(--primary)",
    },
  ];

  return (
    <section ref={sectionRef} className="pt-12 sm:pt-18 pb-8 sm:pb-18">
      <Container>
        <h2 className="text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-sans font-medium tracking-[-0.03em] uppercase text-center w-full break-words mb-8 sm:mb-16 text-(--on-bg-high)">
          {t("home.numbers_title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {stats.map((stat, idx) => (
            <SpotlightCard key={idx} color={stat.color}>
              <NumberDisplay value={stat.number} active={inView} />
              <p className="text-(--on-bg-medium) text-body-2 leading-relaxed mb-8 flex-1">
                {stat.description}
              </p>
              <Button
                variant="outlined"
                size="medium"
                className="w-full mt-auto"
                asChild
              >
                <Link href={stat.href}>
                  {stat.buttonText}
                  <ArrowUpRightIcon className="size-4" />
                </Link>
              </Button>
            </SpotlightCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
