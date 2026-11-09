"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function AsciiLogo({ className }: { className?: string }) {
  const particles = useMemo(() => {
    const arr = [];
    
    // All printable ASCII characters to create the dense "noise" texture
    const chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    // Grid resolution (100x100)
    for (let x = 0; x < 100; x += 1.2) {
      for (let y = 0; y < 100; y += 1.2) {
        
        // Add a little random jitter to make the lines feel hand-drawn / noisy
        const jx = x + (Math.random() * 4 - 2);
        const jy = y + (Math.random() * 4 - 2);

        // ── Left Bracket [ ──
        const isLeftStem = jx >= 22 && jx <= 30 && jy >= 15 && jy <= 85;
        const isLeftTopArm = jx >= 22 && jx <= 42 && jy >= 15 && jy <= 22;
        const isLeftBottomArm = jx >= 22 && jx <= 42 && jy >= 78 && jy <= 85;
        const isLeft = isLeftStem || isLeftTopArm || isLeftBottomArm;

        // ── Right Bracket ] ──
        const isRightStem = jx >= 70 && jx <= 78 && jy >= 15 && jy <= 85;
        const isRightTopArm = jx >= 58 && jx <= 78 && jy >= 15 && jy <= 22;
        const isRightBottomArm = jx >= 58 && jx <= 78 && jy >= 78 && jy <= 85;
        const isRight = isRightStem || isRightTopArm || isRightBottomArm;

        // Scatter noise around the edges of the brackets
        const inLeftZone = jx >= 15 && jx <= 50 && jy >= 10 && jy <= 90;
        const inRightZone = jx >= 50 && jx <= 85 && jy >= 10 && jy <= 90;
        
        const isLeftScatter = inLeftZone && !isLeft && Math.random() < 0.15;
        const isRightScatter = inRightZone && !isRight && Math.random() < 0.15;

        if (isLeft || isRight || isLeftScatter || isRightScatter) {
          // Main body is dense, scatter is lighter/sparser
          const isMain = isLeft || isRight;
          
          arr.push({
            id: `${x}-${y}`,
            x,
            y,
            char: chars[Math.floor(Math.random() * chars.length)],
            delay: (Math.random() * 4).toFixed(2),
            duration: (1.5 + Math.random() * 3).toFixed(2),
            opacity: isMain ? (0.6 + Math.random() * 0.4).toFixed(2) : (0.1 + Math.random() * 0.3).toFixed(2),
            size: isMain ? "text-[10px] md:text-[12px] lg:text-[14px]" : "text-[8px] md:text-[9px]",
          });
        }
      }
    }
    return arr;
  }, []);

  return (
    <div className={cn("relative flex items-center justify-center select-none overflow-visible", className)}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn(
            "absolute font-mono text-(--primary) mix-blend-screen ascii-particle",
            p.size
          )}
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y}%`,
            "--delay": `${p.delay}s`,
            "--duration": `${p.duration}s`,
            "--target-opacity": p.opacity
          } as React.CSSProperties}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
