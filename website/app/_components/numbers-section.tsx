"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";

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
    }, 50);
    return () => clearInterval(interval);
  }, [value, active]);

  return (
    <h3
      ref={ref}
      className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tighter text-(--on-bg-high) leading-none"
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

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect && ref.current) {
      ref.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      ref.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    }
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-3xl border border-(--outline) bg-(--card) transition-colors hover:border-(--outline)/80 flex flex-col justify-between ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--primary-glass), transparent 40%)`,
        }}
      />
      <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full gap-8">
        {children}
      </div>
    </div>
  );
}

export default function NumbersSection() {
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });

  const stats = [
    { label: "Проекты", number: "42", desc: "завершено", link: "/projects" },
    { label: "Опыт", number: "4.5", desc: "года средний стаж" },
    { label: "Клиенты", number: "18", desc: "компаний" },
    { label: "Скорость", number: "1", desc: "день на ТЗ" },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden">
      <Container>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-sans font-medium tracking-[-0.02em] uppercase text-(--on-bg-high) text-center mb-12 md:mb-16"
        >
          Ровные цифры
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlowCard className="min-h-[160px] md:min-h-[200px]">
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-(--on-bg-low)">
                    {stat.label}
                  </span>
                  {stat.link && (
                    <Link href={stat.link} className="text-[11px] font-mono uppercase tracking-[0.2em] text-(--primary) hover:opacity-80 transition-opacity">
                      <ArrowUpRight className="size-4" />
                    </Link>
                  )}
                </div>
                <div className="mt-4">
                  <NumberDisplay value={stat.number} active={inView} />
                  <p className="mt-2 text-body-4 text-(--on-bg-medium) leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
