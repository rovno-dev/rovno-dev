"use client";

import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import LettersPull from "@/components/animations/letters-pull";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";

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

/**
 * Static counters for the "Ровные цифры" section.
 *
 * These were previously derived from /api/v1/stats, which read real
 * rows - and on a young site "0 projects / 0 articles" reads worse than
 * a considered claim. They are also not the same thing: the marketing
 * number and the row count diverge on purpose. Rendering them from
 * constants here, in one obvious place, makes an update a single edit
 * and removes the API round-trip from the home route entirely.
 *
 * `longer` decides sizing: "99.9%" is five characters and needs to
 * drop one size step so it still fits inside a half-width mobile grid
 * cell without overflowing. "45" and "18" keep the largest size.
 */
const ITEMS = [
  { value: "45", labelKey: "home.stats.projects_label", longer: false },
  { value: "18", labelKey: "home.stats.companies_label", longer: false },
  { value: "4.5", labelKey: "home.stats.experience_label", longer: false },
  { value: "99.9%", labelKey: "home.stats.uptime_label", longer: true },
] as const;

export default function NumbersSection() {
  const { t } = useLanguage();
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });

  const sizeClass = (longer: boolean) =>
    longer
      ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
      : "text-5xl sm:text-6xl md:text-7xl lg:text-8xl";

  return (
    <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 md:gap-x-8">
          {ITEMS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col items-center text-center group"
            >
              <div className="transition-transform duration-500 ease-out group-hover:scale-110 min-h-[80px] md:min-h-[96px] flex items-center justify-center">
                {inView ? (
                  <LettersPull
                    text={stat.value}
                    className={cn(
                      "font-heading font-bold tracking-tighter text-(--on-bg-high) leading-none",
                      sizeClass(stat.longer),
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "font-heading font-bold tracking-tighter text-(--on-bg-high) leading-none opacity-0",
                      sizeClass(stat.longer),
                    )}
                  >
                    {stat.value}
                  </div>
                )}
              </div>
              <p className="mt-3 text-body-4 md:text-body-3 text-(--on-bg-medium) leading-snug max-w-[140px] md:max-w-none">
                {t(stat.labelKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
