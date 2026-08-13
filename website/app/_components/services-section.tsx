"use client"
import React from "react";
import { Container } from "@/components/ui/container";

// --- ICONS ---
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
const PaintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /></svg>
);
const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /><path d="M19 8h2M12 2v2M20 14h2" /></svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
);

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
    description: "От высоконагруженных систем до Telegram-ботов. Пишем чистый код на передовом стеке.",
    icon: <CodeIcon />,
    color: "#3b82f6",
    stack: ["React", "Next.js", "FastAPI", "PostgreSQL"]
  },
  {
    title: "UX/UI Дизайн",
    description: "Продуманные интерфейсы и сценарии, повышающие конверсию вашего продукта.",
    icon: <PaintIcon />,
    color: "#ec4899",
    stack: ["Figma", "Illustrator", "Photoshop"]
  },
  {
    title: "ИИ-Автоматизация",
    description: "Внедрение нейросетей в бизнес-процессы. Разработка умных агентов и автоматизаций.",
    icon: <SparklesIcon />,
    color: "#a855f7",
    stack: ["Claude", "Cursor", "Aider", "Aiogram"]
  },
  {
    title: "3D & Motion",
    description: "CGI, рекламные ролики и 3D-графика, которые выделяют вас на фоне конкурентов.",
    icon: <BoxIcon />,
    color: "#f59e0b",
    stack: ["Blender", "After Effects", "Premiere Pro"]
  },
];

function ICChip() {
  return (
    <div className="relative z-30 group mb-4">
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
        <div className="relative flex flex-col items-center">
          <span className="text-[8px] font-mono tracking-[0.5em] text-zinc-500 uppercase mb-2">System Architecture</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tighter uppercase bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent">
            Наши услуги
          </h2>
        </div>
      </div>
    </div>
  );
}


export default function ServicesSection() {
  return (
    <section className="relative py-24 bg-black overflow-hidden selection:bg-white/10">
      <style jsx global>{`
        @keyframes beam-flow {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-beam {
          animation: beam-flow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

      <Container className="relative">
        <div className="grid grid-cols-[1fr_clamp(40px,15vw,80px)] md:grid-cols-1 items-start">
          <div className="flex flex-col items-center md:items-center">
            <ICChip />

            <div className="absolute inset-0 z-10 pointer-events-none">
              <ResponsiveCircuitry />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 w-full relative z-20 mt-12 md:mt-24">
              {services.map((service, idx) => (
                <ServiceCard key={idx} service={service} />
              ))}
            </div>
          </div>
          <div className="md:hidden h-full pointer-events-none" />
        </div>
      </Container>
    </section>
  );
}

function ResponsiveCircuitry() {
  const r = 24;
  return (
    <>
      <svg className="hidden md:block w-full h-full" viewBox="0 0 1200 600" fill="none">
        <g stroke="white" strokeOpacity="0.08" strokeWidth="1.5">
          {services.map((_, i) => {
            const tx = 150 + i * 300;
            const dir = tx < 600 ? -1 : 1;
            return (
              <path key={i} d={`M 600 80 V ${160 - r} Q 600 160 ${600 + (r * dir)} 160 H ${tx - (r * dir)} Q ${tx} 160 ${tx} ${160 + r} V 320`} />
            );
          })}
        </g>
        <g strokeWidth="2" className="filter blur-[1px]">
          {services.map((s, i) => {
            const tx = 150 + i * 300;
            const dir = tx < 600 ? -1 : 1;
            return (
              <path key={i} d={`M 600 80 V ${160 - r} Q 600 160 ${600 + (r * dir)} 160 H ${tx - (r * dir)} Q ${tx} 160 ${tx} ${160 + r} V 320`}
                stroke={s.color} strokeOpacity="0.6" className="animate-beam" style={{ strokeDasharray: '80, 1120', animationDelay: `${i * 0.8}s` }} />
            );
          })}
        </g>
      </svg>

      <svg className="md:hidden w-full h-full" viewBox="0 0 400 1600" fill="none">
        <g stroke="white" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round">
          {services.map((_, i) => {
            const pinY = 40 + (i * 12);
            const spineX = 360 + (i * 6);
            const cardY = [310, 680, 1050, 1420][i];
            return (
              <g key={i}>
                <path d={`M 260 ${pinY} H ${spineX - r} Q ${spineX} ${pinY} ${spineX} ${pinY + r} V ${cardY} H 330`} />
                <path d={`M 260 ${pinY} H ${spineX - r} Q ${spineX} ${pinY} ${spineX} ${pinY + r} V ${cardY} H 330`}
                  stroke={services[i].color} strokeOpacity="0.5" className="animate-beam" style={{ strokeDasharray: '60, 1000', animationDelay: `${i * 1}s` }} />
              </g>
            );
          })}
        </g>
      </svg>
    </>
  );
}


function ServiceCard({ service }: { service: ServiceType }) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/50 bg-[#080809]/90 backdrop-blur-md p-7 md:p-8 transition-all duration-500 hover:border-zinc-700 hover:bg-zinc-900/40">
      <div className="absolute top-1/2 -right-px -translate-y-1/2 w-[3px] h-10 md:hidden block opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: service.color, boxShadow: `0 0 15px ${service.color}` }} />

      <div>
        <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/5 text-zinc-500 group-hover:text-white transition-all shadow-xl">
          {service.icon}
        </div>

        <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-3 tracking-tight">
          {service.title}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-3.5 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1">
            <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
          </svg>
        </h3>

        <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {service.description}
        </p>
      </div>

      <div className="mt-8 pt-5 border-t border-white/5 flex flex-wrap gap-1.5">
        {service.stack.map((tech: string) => (
          <span key={tech} className="px-2 py-0.5 rounded-md bg-zinc-900/50 border border-white/5 text-[9px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-zinc-300">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}