"use client";

import React from "react";
import Image from "next/image";
import { CveteyaLogo } from "../projects/[slug]/_components/cveteya/cveteya-logo";

type LogoItem = {
  id: string;
  icon?: React.ReactNode;
  src?: string;
};

// Minimalist geometric SVGs to represent generic premium tech brands
const LOGOS: LogoItem[] = [
  { id: "bkk", src: '/images/logos/bkk-logo.png' },
];

export default function LogoMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-10 md:py-14 bg-(--bg) group">
      {/* Edge Fade Masks */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-(--bg) to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-(--bg) to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] items-center">
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <div
            key={`${logo.id}-${i}`}
            className="flex shrink-0 items-center justify-center px-8 md:px-16"
          >
            {/* Uniform Container for all logos */}
            <div
              className="flex items-center justify-center size-12 md:size-16 text-(--on-bg-high) opacity-20 hover:opacity-100 transition-all duration-500 hover:scale-110 cursor-pointer relative"
              aria-label={`Partner logo ${logo.id}`}
            >
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.id}
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {logo.icon}
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}