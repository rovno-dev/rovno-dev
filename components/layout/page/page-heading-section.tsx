/* LLM context: Enhancing PageHeadingSection to support an optional illustration slot. 
   Uses a responsive grid (2 columns on desktop) to balance text and graphics. 
   Maintains Apple-grade staggered entry animations. */

"use client";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import React from "react";

interface PageHeadingSectionProps {
  title: string;
  description: string;
  illustration?: React.ReactNode; // Слот для любого компонента (Image, Lottie, SVG и т.д.)
  className?: string;
}

export default function PageHeadingSection({
  title,
  description,
  illustration,
  className,
}: PageHeadingSectionProps) {
  return (
    <section className={cn("py-10 md:py-16 overflow-hidden", className)}>
      <Container>
        <div
          className={cn(
            "grid grid-cols-1 items-center gap-10 md:gap-16",
            illustration ? "lg:grid-cols-2" : "lg:grid-cols-1"
          )}
        >
          {/* Контентная часть */}
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-1 md:text-display-0 text-(--on-bg-high) mb-6 leading-tight uppercase tracking-tighter">
              {title}
            </h1>
            <p className="text-body-1 md:text-body-0 text-(--on-bg-medium) leading-relaxed max-w-[600px]">
              {description}
            </p>
          </div>

          {/* Иллюстрационная часть */}
          {illustration && (
            <div className="relative flex justify-center lg:justify-end animate-reveal [animation-delay:200ms] fill-mode-both">
              <div className="w-full max-w-[500px] lg:max-w-none">
                {illustration}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
