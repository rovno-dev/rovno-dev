import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Star,
  Users,
  Code,
  Palette,
  FilmStrip,
} from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import {
  fetchPublicTeamServer,
  type PublicTeamMember,
} from "@/utils/api/team";

export const revalidate = 60;

/* ═══════════════════════ HERO ═══════════════════════ */
function AboutHero() {
  return (
    <section className="relative py-20 md:py-32 border-b border-(--outline) overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 60% 80% at 20% 20%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 80% at 20% 20%, black 40%, transparent 90%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 15% 10%, var(--primary-glass), transparent 65%)",
        }}
      />
      <Container className="relative">
        <div className="max-w-[900px] animate-reveal">
          <p className="text-body-5 uppercase tracking-[0.34em] text-(--on-bg-low) mb-5">
            Rovno.dev · О нас
          </p>
          <h1 className="text-display-2 md:text-display-0 text-(--on-bg-high) mb-8 leading-[0.98] tracking-[-0.03em]">
            Создаём цифровые продукты, <br />
            <span className="text-(--primary)">которые меняют правила.</span>
          </h1>
          <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[720px]">
            Rovno.dev — агентство полного цикла, где дизайн встречается с
            передовыми технологиями. Мы не просто рисуем интерфейсы, мы
            проектируем опыт, который помогает брендам расти в мире больших
            языковых моделей и цифровой трансформации.
          </p>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════════════ VALUES ═══════════════════════ */
const VALUES = [
  {
    icon: Code,
    title: "Инженерный подход",
    body: "Всё, что мы делаем, можно измерить. Скорость, конверсия, стоимость поддержки. Не «красиво», а измеримо полезно.",
  },
  {
    icon: Palette,
    title: "Визуальная дисциплина",
    body: "Не гоняемся за трендами. Ищем кадр, который до нас никто не снимал, и доводим его до совершенства.",
  },
  {
    icon: Users,
    title: "Партнёрство",
    body: "Работаем как внутренняя команда клиента, а не как подрядчик на час. Остаёмся после релиза — там, где начинается самое интересное.",
  },
  {
    icon: FilmStrip,
    title: "Скорость без спешки",
    body: "Спринты по две недели, демо в конце каждого. Быстро — потому что процесс отлажен, а не потому что режем углы.",
  },
];

function ValuesSection() {
  return (
    <ScrollReveal threshold={0.05}>
      <section className="py-20 md:py-28">
        <Container>
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-(--primary)" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                Принципы
              </span>
            </div>
            <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight max-w-[700px]">
              Четыре вещи, которые мы не готовы менять.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Card
                  key={i}
                  className="rounded-3xl border border-(--outline) bg-(--card) ring-0 p-7 md:p-9 relative overflow-hidden group hover:border-(--primary)/30 transition-all"
                >
                  <div
                    aria-hidden
                    className="absolute top-0 right-0 size-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 100% 0%, var(--primary-glass), transparent 70%)",
                    }}
                  />
                  <div className="relative">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-6">
                      <Icon className="size-5" weight="bold" />
                    </div>
                    <h3 className="text-heading-3 text-(--on-bg-high) mb-3">
                      {v.title}
                    </h3>
                    <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </ScrollReveal>
  );
}

/* ═══════════════════════ TEAM ═══════════════════════ */
function ExpertCard({
  member,
  index,
}: {
  member: PublicTeamMember;
  index: number;
}) {
  const displayName =
    [member.name, member.surname].filter(Boolean).join(" ") ||
    member.username ||
    "Участник";
  const avatar = member.avatar_url || member.cover_url || "";
  const bio = member.bio || member.short_bio || "";
  const projectsWord =
    member.project_count === 1
      ? "проект"
      : member.project_count < 5
      ? "проекта"
      : "проектов";

  return (
    <Link
      href={`/${member.username}`}
      className="group block animate-reveal fill-mode-both"
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <Card className="border-none bg-transparent shadow-none ring-0 p-0 overflow-visible">
        <div className="relative mb-6 overflow-hidden rounded-4xl border border-(--outline) bg-(--card) transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-(--primary)/10 group-hover:-translate-y-1">
          <AspectRatio ratio={4 / 5}>
            {avatar ? (
              <Image
                src={avatar}
                alt={displayName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-(--primary-glass) to-(--card) flex items-center justify-center">
                <span className="text-display-1 font-heading font-semibold tracking-tighter text-(--on-bg-high) opacity-30">
                  {displayName.slice(0, 1)}
                </span>
              </div>
            )}
          </AspectRatio>

          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            {member.project_count > 0 && (
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/60 mb-1.5 tabular-nums">
                {member.project_count} {projectsWord}
              </p>
            )}
            <p className="text-body-4 text-white/95 leading-tight">
              {member.role}
            </p>
          </div>

          <div className="absolute top-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-black shadow-lg">
              <ArrowUpRight className="size-5" />
            </span>
          </div>
        </div>

        <div className="px-1">
          <h3 className="text-display-4 text-(--on-bg-high) mb-1">
            {displayName}
          </h3>
          {bio && (
            <p className="text-body-4 text-(--on-bg-medium) line-clamp-2 leading-relaxed">
              {bio}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

function ExpertsSection({ members }: { members: PublicTeamMember[] }) {
  return (
    <section className="py-20 md:py-28 bg-(--card)/40 border-y border-(--outline)">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-[640px]">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-(--primary)" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                Команда
              </span>
            </div>
            <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight mb-4">
              Наши эксперты
            </h2>
            <p className="text-body-2 text-(--on-bg-medium) leading-relaxed">
              {members.length > 0
                ? "Команда специалистов, объединивших свои усилия для создания исключительных решений."
                : "Команда скоро появится здесь."}
            </p>
          </div>
          <Button
            variant="glass"
            size="large"
            shape="round"
            asChild
            className="shrink-0"
          >
            <Link
              href="https://forms.yandex.com/u/69975d0849af47b15b4c80df"
              target="_blank"
              rel="noopener noreferrer"
            >
              Присоединиться к нам
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>

        {members.length === 0 ? (
          <Card className="rounded-3xl border-(--outline) bg-(--card) ring-0 p-10 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary) mb-4">
              <Users className="size-6" />
            </div>
            <p className="text-body-3 text-(--on-bg-medium)">
              Экспертов пока нет. Они появятся здесь, как только будут
              добавлены в команду через админ-панель.
            </p>
          </Card>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 ${
              members.length >= 4
                ? "lg:grid-cols-4"
                : members.length === 3
                ? "lg:grid-cols-3"
                : "lg:grid-cols-2"
            } gap-6 md:gap-8`}
          >
            {members.map((m, idx) => (
              <ExpertCard key={m.id} member={m} index={idx} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/* ═══════════════════════ NUMBERS ═══════════════════════ */
const NUMBERS = [
  { value: "4+", label: "года на рынке" },
  { value: "42", label: "проекта" },
  { value: "18", label: "клиентов" },
  { value: "6", label: "направлений" },
];

function NumbersStrip() {
  return (
    <ScrollReveal threshold={0.05}>
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
            {NUMBERS.map((n, i) => (
              <div key={i} className="bg-(--bg) p-6 md:p-8">
                <div className="text-display-2 md:text-display-1 font-heading font-semibold tracking-tight text-(--on-bg-high) leading-none mb-2 tabular-nums">
                  {n.value}
                </div>
                <p className="text-body-5 uppercase tracking-[0.16em] text-(--on-bg-low)">
                  {n.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </ScrollReveal>
  );
}

/* ═══════════════════════ PROCESS ═══════════════════════ */
const PROCESS = [
  {
    n: "01",
    title: "Бриф",
    body: "Разбираем задачу, цели, ограничения. Отвечаем на вопрос «зачем» прежде чем «как».",
  },
  {
    n: "02",
    title: "Концепт",
    body: "Показываем 2–3 направления. Выбираем одно, финализируем сценарий и структуру.",
  },
  {
    n: "03",
    title: "Продакшн",
    body: "Итерации по спринтам. Демо каждые 3–5 дней. Никаких «покажем в конце».",
  },
  {
    n: "04",
    title: "Запуск",
    body: "Релиз, аналитика, первые две недели сопровождения включены.",
  },
];

function ProcessSection() {
  return (
    <ScrollReveal threshold={0.05}>
      <section className="py-20 md:py-28">
        <Container>
          <div className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-(--primary)" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                Как мы работаем
              </span>
            </div>
            <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight max-w-[700px]">
              Четыре шага от идеи до релиза.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
            {PROCESS.map((step) => (
              <div
                key={step.n}
                className="group relative bg-(--bg) p-8 md:p-10 min-h-[280px] flex flex-col justify-between transition-colors hover:bg-(--card)"
              >
                <span className="font-mono text-5xl md:text-6xl font-black leading-none text-(--primary) tabular-nums">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-xl md:text-2xl font-heading font-semibold mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </ScrollReveal>
  );
}

/* ═══════════════════════ CTA ═══════════════════════ */
function AboutCTA() {
  return (
    <ScrollReveal threshold={0.05}>
      <section className="pb-24 md:pb-32">
        <Container>
          <div className="relative rounded-5xl border border-(--outline) bg-(--card) p-8 md:p-16 overflow-hidden text-center">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 90% at 50% 0%, var(--primary-glass), transparent 70%)",
              }}
            />
            <div className="relative max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 mb-6">
                <Star className="size-4 text-(--primary)" weight="fill" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
                  Начнём?
                </span>
              </div>
              <h2 className="text-display-2 md:text-display-1 text-(--on-bg-high) tracking-tight mb-6 leading-[1.05]">
                Есть задача, <br />
                с которой мы справимся?
              </h2>
              <p className="text-body-2 text-(--on-bg-medium) leading-relaxed mb-10 max-w-lg mx-auto">
                Расскажите о проекте — ответим в течение 3 часов. Даже если это
                только идея на салфетке.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="xlarge" asChild>
                  <Link href="/order">
                    Оформить заказ
                    <ArrowUpRight className="size-5" />
                  </Link>
                </Button>
                <Button size="xlarge" variant="outlined" asChild>
                  <Link href="/projects">Смотреть проекты</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </ScrollReveal>
  );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default async function AboutPage() {
  const members = await fetchPublicTeamServer();

  return (
    <main className="min-h-screen bg-(--bg)">
      <AboutHero />
      <ValuesSection />
      <ExpertsSection members={members} />
      <NumbersStrip />
      <ProcessSection />
      <AboutCTA />
    </main>
  );
}
