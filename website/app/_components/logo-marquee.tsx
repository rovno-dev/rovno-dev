"use client";

const LOGOS = [
  { name: "Vercel", icon: "▲" },
  { name: "Linear", icon: "◩" },
  { name: "Stripe", icon: "⏣" },
  { name: "Raycast", icon: "⌘" },
  { name: "Framer", icon: "◫" },
  { name: "Supabase", icon: "⚡" },
  { name: "Resend", icon: "✉" },
  { name: "Clerk", icon: "🔒" },
];

export default function LogoMarquee() {
  return (
    <div className="relative w-full overflow-hidden py-10 bg-(--bg) group">
      {/* Edge Fade Masks */}
      <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-(--bg) to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-(--bg) to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-8 md:px-14 text-(--on-bg-high) opacity-30 hover:opacity-100 transition-opacity duration-300 cursor-default"
          >
            <span className="text-2xl md:text-3xl">{logo.icon}</span>
            <span className="text-xl md:text-2xl font-heading font-semibold tracking-tight">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
