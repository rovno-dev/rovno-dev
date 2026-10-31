"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface PixelTransitionProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 8,
  pixelColor = "#C76575",
  animationStepDuration = 0.4,
  once = false,
  className,
  style,
}: PixelTransitionProps) {
  const [isActive, setIsActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 1. Generate pixels array once
  const [pixels] = useState(() => {
    const arr = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      arr.push({
        id: i,
        // Random delay for a chaotic, organic pixel reveal
        delay: Math.random() * (animationStepDuration * 0.6), 
      });
    }
    return arr;
  });

  const handleEnter = () => {
    if (isActive || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsActive(true);
      setIsAnimating(false);
    }, animationStepDuration * 1000);
  };

  const handleLeave = () => {
    if (!isActive || once || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsActive(false);
      setIsAnimating(false);
    }, animationStepDuration * 1000);
  };

  // Grid style helper
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
  };

  return (
    <div
      className={cn("relative size-full overflow-hidden group/transition", className)}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* First Content */}
      <div className="absolute inset-0 size-full z-0" aria-hidden={isActive}>
        {firstContent}
      </div>

      {/* Second Content */}
      <div
        className={cn(
          "absolute inset-0 size-full z-[2] transition-opacity duration-0",
          isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!isActive}
      >
        {secondContent}
      </div>

      {/* Pixel Grid Overlay */}
      <div className="absolute inset-0 z-[3] pointer-events-none" style={gridStyle}>
        {pixels.map((pixel) => (
          <motion.div
            key={pixel.id}
            className="w-full h-full"
            style={{ backgroundColor: pixelColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isAnimating || isActive ? 1 : 0 }}
            transition={{
              duration: 0.15,
              delay: pixel.delay,
              // Reverse the delay when hiding to make the exit feel different
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PixelTransition;
