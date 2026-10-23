import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRight, ArrowLeft, FlowerLotus, Sparkle, Heart, ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import type { CustomPageContext } from "./custom-pages";

function GlassButton({ href, children, variant = "light" }: { href: string, children: React.ReactNode, variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all duration-300 overflow-hidden ${
        isDark 
          ? "bg-[#2C2A29]/90 text-white border border-white/10 shadow-[0_8px_32px_rgba(44,42,41,0.2)] hover:bg-[#2C2A29]"
          : "bg-white/40 backdrop-blur-md text-[#2C2A29] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:bg-white/60"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Link>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white/30 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[32px] p-8 md:p-10 relative overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      {children}
    </div>
  );
}

export function CveteyaProjectPage({ project, content }: { project: CustomPageContext, content: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#FCFAF8] text-[#2C2A29] font-sans selection:bg-[#F2C6D4] selection:text-[#2C2A29] overflow-x-clip relative">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#F2C6D4]/40 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#B2D8C6]/40 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[#E6DAC9]/50 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10">
        <section className="relative min-h-[95dvh] flex flex-col justify-center items-center pt-32 pb-20">
          <Container className="text-center relative z-10 flex flex-col items-center">
            <ScrollReveal threshold={0.01} className="flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-sm font-medium mb-8 text-[#2C2A29]">
                <Sparkle className="text-[#F2C6D4]" weight="fill" />
                <span>Case Study · 2026</span>
              </div>
              <h1 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-serif leading-[0.9] tracking-tight mb-6 text-[#2C2A29]">
                Cveteya
              </h1>
              <p className="text-lg md:text-2xl text-[#7A7571] max-w-2xl mx-auto leading-relaxed mb-12 font-light">
                {project.description || "Digital experience for a modern flower boutique. E-commerce, art direction, and liquid interactions."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {project.href && (
                  <GlassButton href={project.href}>
                    <span>Смотреть сайт</span>
                    <ArrowUpRight weight="bold" />
                  </GlassButton>
                )}
                <GlassButton href="#gallery" variant="dark">
                  <span>Смотреть галерею</span>
                </GlassButton>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200} threshold={0.01} className="w-full max-w-[1000px] mt-20">
              <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl border border-white/50">
                <Image
                  src={project.coverImage || "/static-images/projects/cveteya/cveteya-cover.png"}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-4 md:p-6 flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-[#F2C6D4] flex items-center justify-center">
                    <FlowerLotus className="w-6 h-6 text-[#2C2A29]" weight="fill" />
                  </div>
                  <div className="text-left">
                    <p className="font-serif text-lg md:text-xl font-medium text-[#2C2A29]">Bloom & Grow</p>
                    <p className="text-xs md:text-sm text-[#7A7571]">Brand Identity & Web</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </Container>
        </section>

        <section className="py-24">
          <Container>
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <p className="text-sm font-medium tracking-[0.2em] uppercase text-[#B2D8C6] mb-3">What we did</p>
                  <h2 className="text-4xl md:text-5xl font-serif text-[#2C2A29] leading-tight">
                    Design that breathes.
                  </h2>
                </div>
                <p className="max-w-md text-[#7A7571] leading-relaxed">
                  We replaced the traditional rigid grid with fluid, organic layouts that let the flowers be the hero.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScrollReveal delay={0}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#F2C6D4]/50 flex items-center justify-center mb-6 border border-white/50">
                    <ShoppingBag className="w-7 h-7 text-[#2C2A29]" weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-serif mb-3">E-commerce</h3>
                  <p className="text-[#7A7571] leading-relaxed flex-1">
                    A seamless checkout experience that feels like walking into a physical boutique. Soft onboarding, clear product pages, and a frictionless cart.
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#B2D8C6]/50 flex items-center justify-center mb-6 border border-white/50">
                    <Heart className="w-7 h-7 text-[#2C2A29]" weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-serif mb-3">Art Direction</h3>
                  <p className="text-[#7A7571] leading-relaxed flex-1">
                    A pastel color palette, editorial typography, and soft macro photography create an emotional connection with the user.
                  </p>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <GlassCard className="h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6DAC9]/50 flex items-center justify-center mb-6 border border-white/50">
                    <Sparkle className="w-7 h-7 text-[#2C2A29]" weight="duotone" />
                  </div>
                  <h3 className="text-2xl font-serif mb-3">Liquid UI</h3>
                  <p className="text-[#7A7571] leading-relaxed flex-1">
                    Micro-interactions, parallax scrolling, and glassmorphism elements make the interface feel tactile and alive.
                  </p>
                </GlassCard>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        <section id="gallery" className="py-24">
          <Container>
            <ScrollReveal>
              <h2 className="text-3xl md:text-5xl font-serif text-center mb-16">
                A closer look.
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <ScrollReveal delay={0}>
                <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-1.png"
                    alt="Cveteya Gallery 1"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100} className="flex flex-col gap-6 md:gap-8">
                <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-2.png"
                    alt="Cveteya Gallery 2"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/50 shadow-xl group">
                  <Image
                    src="/static-images/projects/cveteya/cveteya-3.png"
                    alt="Cveteya Gallery 3"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        <section className="py-24">
          <Container>
            <ScrollReveal>
              <GlassCard className="p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-white/40 to-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C6D4] rounded-full blur-[80px] opacity-40 mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B2D8C6] rounded-full blur-[80px] opacity-40 mix-blend-multiply" />
                
                <h2 className="text-3xl md:text-5xl font-serif mb-12 relative z-10">
                  Blooming results.
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-serif text-[#2C2A29] mb-2">+42%</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Conversion Rate</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-serif text-[#2C2A29] mb-2">2.4x</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Avg. Order Value</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-5xl md:text-7xl font-serif text-[#2C2A29] mb-2">-30%</span>
                    <span className="text-sm tracking-widest uppercase text-[#7A7571]">Bounce Rate</span>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </Container>
        </section>

        <section className="py-32 relative">
          <Container className="text-center relative z-10">
            <ScrollReveal>
              <h2 className="text-4xl md:text-6xl font-serif mb-8 text-[#2C2A29]">
                Ready to grow?
              </h2>
              <p className="text-lg text-[#7A7571] mb-12 max-w-lg mx-auto">
                Let's create something beautiful together. We're currently accepting new projects.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <GlassButton href="/order" variant="dark">
                  Оформить заказ
                  <ArrowUpRight weight="bold" />
                </GlassButton>
                <GlassButton href="/projects">
                  <ArrowLeft weight="bold" />
                  Все проекты
                </GlassButton>
              </div>
            </ScrollReveal>
          </Container>
        </section>
      </div>
    </main>
  );
}
