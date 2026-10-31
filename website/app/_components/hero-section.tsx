"use client";
import { useRef } from "react";
import { ParticleLogo } from "@/components/layout/logo/particle-logo";
import { Container } from "@/components/ui/container";
import { motion, useScroll, useTransform } from "motion/react";
import { useLanguage } from "@/providers/language-provider";

export default function HeroSection() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Scroll-driven dissolve. Plays forward as the hero scrolls out and
  // reverses on the way back, so the logo "reassembles" on up-scroll.
  const logoOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const logoBlur = useTransform(
    scrollYProgress,
    [0, 0.35],
    ["blur(0px)", "blur(32px)"]
  );
  const logoScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.86]);
  const logoY = useTransform(scrollYProgress, [0, 0.35], [0, -40]);

  return (
    <section
      ref={heroRef}
      className="relative bg-(--bg) text-(--on-bg-high) min-h-[40dvh] flex flex-col justify-between overflow-hidden selection:bg-(--primary) selection:text-(--on-primary)"
    >
      <Container className="relative z-10 flex flex-col justify-between h-full flex-1 pt-32 pb-16 md:pt-40 md:pb-20">
        {/* Mount blur → scroll dissolve → ambient float → particle hover.
            Each concern owns its own layer so they never overwrite each
            other's transform. */}
        <div className="w-full flex-1 flex items-center justify-center my-12 md:my-0 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: "blur(28px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="relative flex items-center justify-center w-full"
          >
            <motion.div
              style={{
                opacity: logoOpacity,
                filter: logoBlur,
                scale: logoScale,
                y: logoY,
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 1.9,
                }}
              >
                <ParticleLogo className="size-50 md:size-60" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom statement — reveals on section entry */}
        <div className="w-full flex justify-center md:justify-start">
          <div className="max-w-lg">
            <p className="text-(--on-bg-high) text-heading-2">
              <motion.span
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {t("hero.subtitle.part1")}
              </motion.span>{" "}
              <span className="text-(--on-bg-medium)">
                <motion.span
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 1.1,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15,
                  }}
                  className="inline-block"
                >
                  {t("hero.subtitle.part2")}
                </motion.span>
              </span>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
