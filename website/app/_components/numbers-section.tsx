"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/providers/language-provider";

// Optimized hacker number: uses direct DOM updates (textContent) 
// instead of React state to avoid re-rendering the entire component tree
// 16 times per second.
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
        // Preserve spaces, punctuation, and Cyrillic characters
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
      className="text-white text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 mix-blend-difference"
    >
      {value}
    </h3>
  );
}

// Optimized in-view hook
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

// Optimized SpotlightCard: uses direct style property updates 
// instead of React state to track mouse position.
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
      className="group relative p-0 sm:p-8 lg:p-6 flex flex-col h-full border-(--outline) border-b last:border-b-0 md:border-b-0 md:last:border-b-0 lg:border-r lg:last:border-r-0 md:[&:nth-child(odd)]:border-r md:[&:nth-child(-n+2)]:border-b lg:border-b-0! transition-colors hover:bg-(--primary-glass) isolation-isolate"
      style={{ "--spot-color": color } as React.CSSProperties}
    >
      {/* Spotlight effect (Optimized with will-change) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 will-change-[opacity]"
        style={{
          background: `radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), var(--spot-color) 0%, transparent 40%)`,
          mixBlendMode: "overlay",
        }}
      />
      {/* Existing colorized radial hover effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 will-change-[opacity]"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 90%)`
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
    {
      number: t("home.stats_spec_number"),
      description: t("home.stats_spec_prep"),
      buttonText: t("home.stats_spec_btn"),
      href: "/order",
      color: "var(--primary)",
    },
  ];

  return (
    <section ref={sectionRef} className="pt-12 sm:pt-18 pb-8 sm:pb-18">
      <Container>
        <h2 className="text-display-2 text-[2rem] sm:text-[3.5rem] mb-8 sm:mb-16 text-left sm:text-center">
          {t("home.numbers_title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 [&>*:not(:first-child)]:pt-8 [&>*:not(:last-child)]:pb-8">
          {stats.map((stat, idx) => (
            <SpotlightCard key={idx} color={stat.color}>
              <NumberDisplay value={stat.number} active={inView} />
              <p className="text-white text-body-2 leading-relaxed mb-8 flex-1 mix-blend-difference">
                {stat.description}
              </p>
              <Button
                variant="outlined"
                size="medium"
                className="w-full mt-auto mix-blend-normal"
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
