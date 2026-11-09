"use client";

import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import { useLanguage } from "@/providers/language-provider";

// Ultra-detailed hand-drawn sketch icons.
// Multiple overlapping paths, irregular stroke weights, and action lines
// create a "rough.js" aesthetic without the dependency.
const SketchIcon = ({ type }: { type: string }) => {
  const props = {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-16 md:size-20 mb-6 text-(--on-bg-high) transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3",
  };

  switch (type) {
    case "reviews":
      return (
        <svg {...props}>
          {/* Main Star Outline */}
          <path d="M32 6 L39 23 L57 24 L44 36 L48 54 L32 45 L16 54 L20 36 L7 24 L25 23 Z" strokeWidth={2.5} />
          {/* Inner Sketch Shadow */}
          <path d="M32 12 L36 24 L48 25 L39 34 L41 46 L32 40 L23 46 L25 34 L16 25 L28 24 Z" opacity="0.3" strokeWidth={1.5} />
          {/* Clean, symmetrical sparkles (outside the star) */}
          <path d="M8 8 L12 12 M56 8 L52 12 M8 56 L12 52 M56 56 L52 52" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
      );
    case "process": // Heart for Clients
      return (
        <svg {...props}>
          {/* Main Heart Outline */}
          <path d="M32 56 C14 40 8 26 8 18 C8 8 20 4 32 16 C44 4 56 8 56 18 C56 26 50 40 32 56 Z" strokeWidth={2.5} strokeLinejoin="round" />
          
          {/* Inner Sketch Shadow for depth */}
          <path d="M32 48 C18 36 14 26 14 20 C14 12 22 10 32 20 C42 10 50 12 50 20 C50 26 46 36 32 48 Z" opacity="0.3" strokeWidth={1.5} strokeLinejoin="round" />
          
          {/* Clean Sparkles around the heart */}
          <path d="M10 10 L14 14 M54 10 L50 14 M10 50 L14 46 M54 50 L50 46" strokeWidth={2} strokeLinecap="round" opacity="0.6" />
          <circle cx="32" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="30" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="60" cy="30" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "3d": // Reverted to the 250% cool version you liked
      return (
        <svg {...props}>
          {/* Main Pencil Body */}
          <path d="M18 46 L44 12 L52 20 L26 54 L14 58 Z" strokeWidth={2.5} />
          {/* Pencil Tip Split */}
          <path d="M44 12 L46 8 L54 16 L52 20" strokeWidth={2.5} />
          <path d="M18 46 L26 54" strokeWidth={2.5} />
          {/* Wood grain / Texture lines */}
          <path d="M24 40 L36 28 M28 44 L38 34 M32 48 L40 40" strokeWidth={1.5} opacity="0.4" />
          {/* Dynamic sketch lines / Motion */}
          <path d="M8 60 Q18 56 28 60" strokeWidth={2} opacity="0.6" />
          <path d="M6 14 L10 18 M16 8 L20 12" strokeWidth={1.5} opacity="0.5" />
          <circle cx="8" cy="46" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="26" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "global": // Kept exactly as requested
      return (
        <svg {...props}>
          {/* Globe Frame */}
          <circle cx="32" cy="32" r="18" />
          {/* Lat/Long lines */}
          <path d="M32 14 C20 20 20 44 32 50" />
          <path d="M32 14 C44 20 44 44 32 50" />
          <path d="M14 32 H50" />
          <path d="M18 22 Q32 28 46 22" strokeWidth={1.5} />
          <path d="M18 42 Q32 36 46 42" strokeWidth={1.5} />
          {/* Sketchy orbit */}
          <path d="M8 26 Q4 32 8 38" strokeWidth={1.5} opacity="0.6" />
          <path d="M56 26 Q60 32 56 38" strokeWidth={1.5} opacity="0.6" />
          <path d="M28 52 Q32 56 36 52" strokeWidth={1.5} opacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
};

const ITEMS = [
  { value: "45", labelKey: "home.stats.projects_label", type: "reviews" },
  { value: "18", labelKey: "home.stats.companies_label", type: "process" },
  { value: "4.5", labelKey: "home.stats.experience_label", type: "3d" },
  { value: "99.9%", labelKey: "home.stats.uptime_label", type: "global" },
] as const;

export default function NumbersSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-y-24">
          {ITEMS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col group"
            >
              <div className="transition-transform duration-500 group-hover:scale-110 origin-bottom-left">
                <SketchIcon type={stat.type} />
              </div>
              <div className="text-5xl md:text-6xl font-heading  tracking-[-0.04em] leading-none text-(--on-bg-high) mb-4 tabular-nums">
                {stat.value}
              </div>
              <div className="text-base md:text-lg text-(--on-bg-medium) leading-snug max-w-[200px]">
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
