"use client";
import React, { useState, useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import LettersPull from "@/components/animations/letters-pull";
import { useLanguage } from "@/providers/language-provider";

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

export default function NumbersSection() {
  const { t } = useLanguage();
  const { ref: sectionRef, inView } = useInView({ threshold: 0.1 });
  
  const stats = [
    { number: "42", labelKey: "home.stats.projects_label" },
    { number: "4.5", labelKey: "home.stats.experience_label" },
    { number: "18", labelKey: "home.stats.companies_label" },
    { number: "1", labelKey: "home.stats.specs_label" },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4 md:gap-x-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center group"
            >
              <div className="transition-transform duration-500 ease-out group-hover:scale-110">
                {inView ? (
                  <LettersPull 
                    text={stat.number} 
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter text-(--on-bg-high) leading-none"
                  />
                ) : (
                  <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tighter text-(--on-bg-high) leading-none opacity-0">
                    {stat.number}
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
