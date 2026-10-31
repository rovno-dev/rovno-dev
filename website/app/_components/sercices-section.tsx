"use client";
import { Container } from "@/components/ui/container";
import { motion } from "motion/react";
import Link from "next/link";
import { Code, Palette, ChartLine, Rocket, Sparkle } from "@phosphor-icons/react";

export default function ServicesSection() {
  return (
    <section id="services" className="bg-(--bg) text-(--on-bg-high) py-16 md:py-24">
      <Container>
        <div className="flex flex-col gap-12 md:gap-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-sans font-medium tracking-[-0.02em] uppercase text-center w-full break-words"
          >
            Услуги
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Audit */}
            <Link href="/services/audit" className="group relative md:col-span-2 flex flex-col justify-between p-8 md:p-10 min-h-[340px] md:min-h-[480px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:border-(--on-bg-low)/40 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="absolute top-0 right-0 w-[80%] h-[150%] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 via-blue-500/5 to-transparent transform translate-x-1/4 -translate-y-1/4 rotate-12 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-end gap-3 pointer-events-none w-full max-w-[320px]">
                {[
                  { icon: <Code weight="bold" size={16} />, text: "Backend", delay: "delay-[100ms]" },
                  { icon: <ChartLine weight="bold" size={16} />, text: "Analytics", delay: "delay-[200ms]", class: "mr-12" },
                  { icon: <Palette weight="bold" size={16} />, text: "Design", delay: "delay-[300ms]" }
                ].map((item, i) => (
                  <div 
                    key={i}
                    className={`flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium shadow-lg transition-all duration-500 ease-out md:opacity-0 md:translate-y-4 md:scale-95 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:scale-100 opacity-100 translate-y-0 scale-100 ${item.class || ""} ${item.delay}`}
                  >
                    {item.icon} {item.text}
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-auto max-w-md">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight group-hover:text-blue-400 transition-colors">Аудит</h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
                  Детально проверим инфраструктуру, найдём слабые места и подскажем как действовать дальше. Подготовим план и ТЗ под подходящую технологию.
                </p>
              </div>
            </Link>

            {/* 2. Digitalization */}
            <Link href="/services/digitalization" className="group relative md:col-span-1 flex flex-col justify-end p-8 md:p-10 min-h-[280px] md:min-h-[480px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:border-(--on-bg-low)/40 hover:shadow-2xl hover:shadow-violet-500/5">
              
              {/* Chat UI - Hidden on mobile, visible on desktop */}
              <div className="absolute top-0 left-0 right-0 h-[60%] px-6 pt-6 hidden md:flex flex-col gap-3 pointer-events-none opacity-60 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500 z-0">
                <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="self-end max-w-[85%] bg-(--bg) border border-(--outline) rounded-2xl rounded-tr-sm p-3.5 text-[13px] leading-relaxed text-(--on-bg-medium) shadow-sm">
                  @ai-agent Как оптимизировать процесс онбординга?
                </motion.div>
                <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="self-start max-w-[90%] bg-(--card) border border-(--outline) rounded-2xl rounded-tl-sm p-3.5 text-[13px] leading-relaxed text-(--on-bg-high) shadow-xl ring-1 ring-white/5">
                  Я проанализировал 4 этапа. Предлагаю автоматизировать выдачу доступов и создать единый портал.
                  <span className="text-violet-400 mt-2 block font-medium flex items-center gap-1"><Sparkle weight="fill" /> Сгенерировать ТЗ?</span>
                </motion.div>
              </div>

              {/* Gradient mask - Hidden on mobile, protects text on desktop */}
              <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-(--card) via-(--card) to-transparent z-[5] pointer-events-none hidden md:block" />

              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight group-hover:text-violet-400 transition-colors">Цифровизация</h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm">
                  Автоматизируем процессы, разработаем цифровые продукты под задачи и будем следить за стабильностью.
                </p>
              </div>
            </Link>

            {/* 3. Startup */}
            <Link href="/services/startup" className="group relative md:col-span-3 flex flex-col justify-end md:flex-row md:items-end md:justify-between p-8 md:p-10 min-h-[280px] md:min-h-[300px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:border-(--on-bg-low)/40">
               
               {/* Windows UI - Hidden on mobile, visible on desktop */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:flex justify-end z-0">
                 <div className="relative w-full md:max-w-[600px] h-full transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:-translate-y-3">
                    {[0,1,2,3,4].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="absolute right-0 bottom-[-40px] w-[500px] h-[280px] bg-(--bg) border border-(--outline) rounded-xl shadow-2xl"
                        style={{
                          transform: `translate(${i * 25}px, -${i * 25}px) scale(${1 - i * 0.05})`,
                          zIndex: 10 - i,
                          opacity: 1 - i * 0.15
                        }}
                      >
                        <div className="h-10 border-b border-(--outline) flex items-center px-4 gap-2 bg-(--card)">
                          <div className="size-3 rounded-full bg-(--on-bg-low)/20" />
                          <div className="size-3 rounded-full bg-(--on-bg-low)/20" />
                          <div className="size-3 rounded-full bg-(--on-bg-low)/20" />
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                          <div className="w-1/3 h-2.5 bg-(--on-bg-low)/20 rounded-full" />
                          <div className="w-1/2 h-2.5 bg-(--on-bg-low)/20 rounded-full" />
                          <div className="w-full h-24 bg-(--on-bg-low)/5 rounded-lg mt-3 border border-(--outline) flex items-center justify-center">
                            <Rocket weight="duotone" className="size-10 text-(--on-bg-low)/30" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                 </div>
               </div>

               {/* Gradient mask - Hidden on mobile, protects text on desktop */}
               <div className="absolute inset-0 bg-gradient-to-r from-(--card) via-(--card)/90 to-transparent pointer-events-none w-full z-[5] hidden md:block" />

               <div className="relative z-10 max-w-md mt-auto md:mt-0">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight group-hover:text-emerald-400 transition-colors">Стартап</h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
                  Реализуем цифровой продукт, поможем выйграть инвестиционные раунды или просто протестируем идею для вашего стартапа.
                </p>
               </div>
            </Link>

          </div>
        </div>
      </Container>
    </section>
  );
}
