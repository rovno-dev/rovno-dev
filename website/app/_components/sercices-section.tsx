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
          {/* Smaller, cleaner heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl leading-[1] font-sans font-medium tracking-[-0.03em] uppercase text-center w-full break-words"
          >
            Услуги
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Audit -> Unfold animation */}
            <Link href="/services/audit" className="group relative md:col-span-2 flex flex-col justify-between p-8 md:p-10 min-h-[380px] md:min-h-[480px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:border-(--on-bg-low)/40 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="absolute top-0 right-0 w-[80%] h-[150%] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 via-blue-500/5 to-transparent transform translate-x-1/4 -translate-y-1/4 rotate-12 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Unfold animation sequence */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-end gap-3 pointer-events-none w-full max-w-[320px]">
                {[
                  { icon: <Code weight="bold" size={16} />, text: "Backend", delay: 0.1 },
                  { icon: <ChartLine weight="bold" size={16} />, text: "Analytics", delay: 0.2, class: "mr-12" },
                  { icon: <Palette weight="bold" size={16} />, text: "Design", delay: 0.3 }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.8, transformOrigin: "right center" }} 
                    whileInView={{ opacity: 1, y: 0, scale: 1 }} 
                    viewport={{ once: true, margin: "-50px" }} 
                    transition={{ delay: item.delay, type: "spring", stiffness: 200, damping: 20 }} 
                    className={`flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium shadow-lg ${item.class || ""}`}
                  >
                    {item.icon} {item.text}
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 mt-auto max-w-md">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight group-hover:text-blue-400 transition-colors">Аудит</h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm md:text-base">
                  Детально проверим инфраструктуру, найдём слабые места и подскажем как действовать дальше. Подготовим план и ТЗ под подходящую технологию.
                </p>
              </div>
            </Link>

            {/* 2. Digitalization -> Lower opacity + hover slide */}
            <Link href="/services/digitalization" className="group relative md:col-span-1 flex flex-col justify-between p-8 md:p-10 min-h-[380px] md:min-h-[480px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:border-(--on-bg-low)/40 hover:shadow-2xl hover:shadow-violet-500/5">
              
              {/* Chat UI that fades in and slides on hover */}
              <div className="absolute top-6 left-0 right-0 px-6 flex flex-col gap-3 pointer-events-none opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500">
                <motion.div initial={{ x: 20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="self-end max-w-[85%] bg-(--bg) border border-(--outline) rounded-2xl rounded-tr-sm p-3.5 text-[13px] leading-relaxed text-(--on-bg-medium) shadow-sm">
                  @ai-agent Как оптимизировать процесс онбординга?
                </motion.div>
                <motion.div initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="self-start max-w-[90%] bg-(--card) border border-(--outline) rounded-2xl rounded-tl-sm p-3.5 text-[13px] leading-relaxed text-(--on-bg-high) shadow-xl ring-1 ring-white/5">
                  Я проанализировал 4 этапа. Предлагаю автоматизировать выдачу доступов и создать единый портал.
                  <span className="text-violet-400 mt-2 block font-medium flex items-center gap-1"><Sparkle weight="fill" /> Сгенерировать ТЗ?</span>
                </motion.div>
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-tight group-hover:text-violet-400 transition-colors">Цифровизация</h3>
                <p className="text-(--on-bg-medium) leading-relaxed text-sm">
                  Автоматизируем процессы, разработаем цифровые продукты под задачи и будем следить за стабильностью.
                </p>
              </div>
            </Link>

            {/* 3. Startup -> Cascading windows hover animation */}
            <Link href="/services/startup" className="group relative md:col-span-3 flex flex-col md:flex-row md:items-end justify-between p-8 md:p-10 min-h-[300px] rounded-3xl border border-(--outline) bg-(--card) overflow-hidden transition-all duration-300 hover:border-(--on-bg-low)/40">
               
               {/* Cascading windows container with hover group effect */}
               <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-end">
                 <div className="relative w-full max-w-[600px] h-full transition-transform duration-500 ease-out group-hover:scale-[1.02] group-hover:-translate-y-3">
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

               <div className="absolute inset-0 bg-gradient-to-r from-(--card) via-(--card)/80 to-transparent pointer-events-none w-full md:w-2/3 z-[5]" />

               <div className="relative z-10 max-w-md bg-gradient-to-r from-(--card) to-transparent p-2 rounded-2xl">
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
