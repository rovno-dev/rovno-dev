"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AsciiHeroAnimation({ className }: { className?: string }) {
  const particles = useMemo(() => {
    const arr = [];
    // Ring particles forming the main circular shape
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      // Add slight noise to radius to make it look organic, like the original
      const r = 30 + Math.sin(i * 5) * 5 + Math.random() * 8;
      arr.push({
        id: `ring-${i}`,
        x: 50 + Math.cos(angle) * r,
        y: 50 + Math.sin(angle) * r,
        char: Math.random() > 0.5 ? "1" : "0",
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 3,
        baseOpacity: 0.5 + Math.random() * 0.5,
      });
    }
    // Scatter particles for depth and matrix effect
    for (let i = 0; i < 80; i++) {
      arr.push({
        id: `scatter-${i}`,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70,
        char: Math.random() > 0.5 ? "1" : "0",
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 4,
        baseOpacity: 0.1 + Math.random() * 0.4,
      });
    }
    return arr;
  }, []);

  return (
    <div className={cn("relative flex items-center justify-center select-none", className)}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute font-mono text-[10px] md:text-[12px] lg:text-[14px] text-(--primary) mix-blend-screen"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            opacity: [p.baseOpacity * 0.2, p.baseOpacity, p.baseOpacity * 0.2],
            scale: [1, 1.3, 1],
            y: [`${p.y}%`, `${p.y - 2}%`, `${p.y}%`] // slight floating up
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.char}
        </motion.span>
      ))}
      {/* Subtle glowing core behind the ASCII */}
      <motion.div 
        className="absolute size-32 md:size-40 rounded-full bg-(--primary)/10 blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
