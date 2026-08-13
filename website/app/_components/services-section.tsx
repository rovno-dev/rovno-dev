"use client";

import React from "react";
import { Container } from "@/components/ui/container";
import { DeployedCodeIcon, DesignServicesIcon, DiamondIcon, StylusNoteIcon } from "@/components/icons";

type ServiceType = {
  title: string;
  description: string;
  icon: React.JSX.Element;
  color: string;
  stack: string[];
}

const services: ServiceType[] = [
  {
    title: "Разработка",
    description: "От Telegram-ботов до высоконагруженных систем с внедрением ИИ в бизнес-процессы и разработкой умных агентов и автоматизаций.",
    icon: <DeployedCodeIcon />,
    color: "#3b82f6",
    stack: ["React", "Next.js", "FastAPI", "PSQL", "Redis", "Aiogram", "NemoClaw", "Hermes", "Python", "Go", "Docker", "Kubernetes"]
  },
  {
    title: "3D & Motion",
    description: "CGI, рекламные ролики и 3D-графика, которые выделяют вас на фоне конкурентов.",
    icon: <DiamondIcon />,
    color: "#f59e0b",
    stack: ["Blender", "After Effects", "Premiere Pro", "Hyperframes", "3ds Max", "Kling AI", "DaVinci Resolve", "Auto-subs"]
  },
  {
    title: "UX/UI Дизайн",
    description: "Продуманные интерфейсы и сценарии, повышающие конверсию вашего продукта.",
    icon: <DesignServicesIcon />,
    color: "#ec4899",
    stack: ["Figma", "Photoshop", "Nano Banana Pro"]
  },
  {
    title: "Айдентика",
    description: "Логотипы, фирменные стили и брендбуки, которые работают вдолгую и формируют сильный образ.",
    icon: <StylusNoteIcon />,
    color: "#a855f7",
    stack: ["Illustrator", "Photoshop", "Nano Banana Pro"]
  },

];

function ICChip() {
  return (
    <div className="relative z-30 group mb-16 w-[80%] sm:w-[300px] mx-auto">
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="w-4 h-2 bg-gradient-to-r from-zinc-600 to-zinc-800 rounded-l-sm border-y border-white/10" />)}
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="w-4 h-2 bg-gradient-to-l from-zinc-600 to-zinc-800 rounded-r-sm border-y border-white/10" />)}
      </div>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-5">
        {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-4 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded-t-sm border-x border-white/10" />)}
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-5">
        {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-4 bg-gradient-to-t from-zinc-600 to-zinc-800 rounded-b-sm border-x border-white/10" />)}
      </div>

      <div className="relative bg-[#0e0e10] border-2 border-[#1c1c1f] rounded-xl px-12 py-8 shadow-[0_20px_60px_rgba(0,0,0,1)] ring-1 ring-white/10">
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-black/50 border border-white/5 shadow-inner" />
        <h2 className="text-display-2 text-center">
          Наши услуги
        </h2>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section className="pt-2 sm:pt-4 pb-8 sm:pb-18">
      <Container className="pt-6 sm:pt-14">
        {/* Header: Next.js Foundation Style */}
        <ICChip></ICChip>

        {/* The Grid: 1px border logic with flush edges */}
        <div className="grid grid-cols-1 border border-(--outline) md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group relative border-b border-white/10 p-8 transition-colors hover:bg-zinc-900/50 md:border-r lg:p-10"
            >
              {/* Subtle background glow effect on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10"
                style={{
                  background: `radial-gradient(circle at center, ${service.color} 0%, transparent 70%)`
                }}
              />

              <div className="relative z-10">
                {/* Icon Box */}
                <div
                  className="mb-8 flex size-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-400 transition-colors group-hover:text-white"
                  style={{ color: service.color }}
                >
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="mb-3 text-lg font-semibold tracking-tight text-white">
                  {service.title}
                </h3>
                <p className="mb-8 text-sm leading-relaxed text-zinc-400">
                  {service.description}
                </p>

                {/* Tech Stack Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {service.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded bg-zinc-800/50 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-zinc-500 uppercase transition-colors group-hover:text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}