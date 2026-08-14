"use client";
import { useState } from "react";
import Image from "next/image";

interface HeroMediaProps {
  imageSrc: string;
  title: string;
  videoSrc?: string;
  projectSlug: string;
  className?: string;
}

export function HeroMedia({ imageSrc, title, videoSrc, className = "" }: HeroMediaProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Hide the element completely if the image fails to load
  if (error) return null;

  return (
    <div className={`relative overflow-hidden transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} bg-transparent ${className}`}>
      <Image
        src={imageSrc}
        alt={title}
        fill
        className="object-cover"
        priority
        onLoadingComplete={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {videoSrc && loaded && (
        <iframe
          src={videoSrc + "?autoplay=1&mute=1"}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      )}
    </div>
  );
}
