import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
  PlayCircleIcon,
  FilmStripIcon,
  PaletteIcon,
  CubeIcon,
  BreadIcon,
} from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/layout/animation/scroll-reveal";
import { CoverIframe } from "@/components/layout/media/cover-iframe";
import {
  ProjectTagChip,
  type ProjectTagKind,
} from "@/components/ui/project-tag-chip";

/** Warm, honey-toned accent set — reads as wheat, crust, and glaze. */
const ACCENT = "#F2B441"; // wheat gold
const ACCENT_WARM = "#C47840"; // baked crust
const ACCENT_CREAM = "#FBF3E2"; // crumb

export interface BreadProjectProps {
  title: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  coverVideo?: string;
  href?: string;
  period?: string;
  clientName?: string;
  platform?: string;
  techStack: string[];
  tags: {
    id: string;
    kind: ProjectTagKind;
    label: string;
    meta?: string | null;
  }[];
  media: {
    id: string;
    type: "image" | "video";
    url: string;
    caption?: string | null;
  }[];
}

const PROCESS = [
  {
    n: "01",
    title: "Стратегия",
    body: "Разобрали продуктовую линейку «Хлебная Страна» и определили, как каждый вкус должен звучать в кадре — от классики до новинок.",
    icon: PaletteIcon,
  },
  {
    n: "02",
    title: "Сценарий",
    body: "Написали раскадровку на 30 секунд: крупные планы, замедление, свет, пар. Всё, чтобы хлеб выглядел аппетитно, а не как на скучном баннере.",
    icon: FilmStripIcon,
  },
  {
    n: "03",
    title: "3D и съёмка",
    body: "Собрали 3D-сцены в Blender, отсняли продуктовые планы, наложили графику. Свет и материалы подбирали под упаковку — чтобы цвет совпадал в кадре.",
    icon: CubeIcon,
  },
  {
    n: "04",
    title: "Постпродакшн",
    body: "Монтаж, цвет, звук. Собрали версии под ТВ, диджитал и соцсети — один и тот же ролик работает в трёх форматах без потери смысла.",
    icon: PlayCircleIcon,
  },
];

export function BreadProjectPage({
  project,
  content,
}: {
  project: BreadProjectProps;
  content: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-(--bg) text-(--on-bg-high)">
      {/* ────────────────  HERO  ──────────────── */}
      <section className="relative min-h-[92dvh] flex flex-col justify-between overflow-hidden border-b border-(--outline)">
        <div className="absolute inset-0 z-0">
          {project.coverVideo ? (
            <CoverIframe
              src={`${project.coverVideo}?autoplay=1&muted=1&loop=1&background=1`}
              title={project.title}
            />
          ) : (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          {/* Tonal overlays — bottom fade for legibility, warm radial from
              the corner to key the project's baked-in palette. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-(--bg)" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 65% 70% at 80% 15%, ${ACCENT}1f 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Top status strip. */}
        <Container variant="full-width" className="relative z-10 pt-8">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-white/55">
            <div className="flex items-center gap-3">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: ACCENT }}
              />
              <span>Rovno.dev</span>
              <span className="text-white/20">/</span>
              <span>Case 07</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span>Promo</span>
              <span className="text-white/20">/</span>
              <span>{project.period || "2026"}</span>
            </div>
          </div>
        </Container>

        {/* Hero content. */}
        <Container variant="full-width" className="relative z-10 py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.3em] text-white/60 mb-6">
              <span className="h-px w-12" style={{ background: ACCENT }} />
              <span>Хлебная Страна · Промо-ролик</span>
            </div>

            <h1 className="text-[clamp(2.5rem,8vw,8rem)] font-heading font-bold leading-[0.92] tracking-[-0.04em] text-white max-w-[1100px]">
              Хлебная
              <br />
              <span style={{ color: ACCENT }}>Страна.</span>
            </h1>

            {project.shortDescription && (
              <p className="mt-8 text-body-2 md:text-display-5 text-white/80 leading-relaxed max-w-2xl">
                {project.shortDescription}
              </p>
            )}

            {/* From-chief tag + metadata grid. */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {project.tags
                .filter((t) => t.kind === "from_chief")
                .map((t) => (
                  <ProjectTagChip
                    key={t.id}
                    kind={t.kind}
                    label={t.label}
                    meta={t.meta ?? null}
                    size="md"
                    icon={<BreadIcon weight="fill" />}
                  />
                ))}
              {project.tags
                .filter((t) => t.kind !== "from_chief")
                .map((t) => (
                  <ProjectTagChip
                    key={t.id}
                    kind={t.kind}
                    label={t.label}
                    size="md"
                  />
                ))}
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              <MetaCol label="Client" value={project.clientName || "БКК"} />
              <MetaCol label="Year" value={project.period || "2026"} />
              <MetaCol label="Scope" value="Идея · 3D · Продакшн" />
              <MetaCol
                label="Stack"
                value={(project.techStack || []).slice(0, 3).join(" · ") || "Figma · Blender"}
              />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {project.href && (
                <Button
                  size="large"
                  asChild
                  className="!font-mono !uppercase !tracking-wider"
                  style={{ background: ACCENT, color: "#0a0a0a" }}
                >
                  <Link
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Смотреть на Dprofile
                    <ArrowUpRight className="size-5" />
                  </Link>
                </Button>
              )}
              <Button
                size="large"
                variant="outlined"
                asChild
                className="!border-white/25 !text-white hover:!bg-white/5 !font-mono !uppercase !tracking-wider"
              >
                <Link href="#film">
                  <PlayCircleIcon className="size-4" />
                  Смотреть ролик
                </Link>
              </Button>
            </div>
          </div>
        </Container>

        {/* Bottom scroll cue. */}
        <Container variant="full-width" className="relative z-10 pb-8">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.28em] text-white/40">
            <span>Scroll</span>
            <span className="flex items-center gap-2">
              <ArrowDown className="size-3.5" />
              02 / 06
            </span>
          </div>
        </Container>
      </section>

      {/* ────────────────  MARQUEE  ──────────────── */}
      <div className="relative border-b border-(--outline) py-5 overflow-hidden select-none bg-(--bg)">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center gap-8 pr-8">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="font-mono uppercase text-2xl md:text-4xl tracking-tight text-(--on-bg-high)/65"
                >
                  Хлебная Страна
                  <span className="mx-3" style={{ color: ACCENT }}>·</span>
                  Промо-ролик
                  <span className="mx-3" style={{ color: ACCENT_WARM }}>·</span>
                  2026
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────  FILM (embedded)  ──────────────── */}
      {project.coverVideo && (
        <ScrollReveal threshold={0.02}>
          <section id="film" className="py-24 md:py-32 border-b border-(--outline)">
            <Container variant="full-width">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-12 flex items-end justify-between gap-4">
                  <SectionLabel number="01" title="The film" accent={ACCENT} />
                  <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.24em] text-(--on-bg-low)">
                    30 sec · 16:9 · TV + digital
                  </span>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-(--outline) bg-black">
                  <iframe
                    src={`${project.coverVideo}?autoplay=0&muted=1&loop=1`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    title={`${project.title} — film`}
                  />
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-body-4 text-(--on-bg-medium)">
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 size-1.5 rounded-full shrink-0" style={{ background: ACCENT }} />
                    <p>Один мастер-ролик, три перемонтированные версии под площадки.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 size-1.5 rounded-full shrink-0" style={{ background: ACCENT_WARM }} />
                    <p>Продуктовые 3D-сцены смонтированы в реальные кадры с натуры.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1.5 size-1.5 rounded-full shrink-0" style={{ background: ACCENT }} />
                    <p>Цвет и свет подобраны под упаковку — хлеб выглядит так же, как на полке.</p>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </ScrollReveal>
      )}

      {/* ────────────────  MANIFESTO  ──────────────── */}
      {project.description && (
        <ScrollReveal threshold={0.05}>
          <section className="py-24 md:py-36 border-b border-(--outline)">
            <Container variant="full-width">
              <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                <div className="lg:col-span-3">
                  <SectionLabel number="02" title="Manifesto" accent={ACCENT} />
                </div>
                <div className="lg:col-span-9">
                  <p className="text-3xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-[-0.02em] leading-[1.05] text-(--on-bg-high)">
                    {project.description}
                  </p>
                </div>
              </div>
            </Container>
          </section>
        </ScrollReveal>
      )}

      {/* ────────────────  PROCESS  ──────────────── */}
      <ScrollReveal threshold={0.02}>
        <section className="py-24 md:py-32 border-b border-(--outline)">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto">
              <div className="mb-14">
                <SectionLabel number="03" title="Process" accent={ACCENT} />
                <h2 className="mt-5 text-3xl md:text-5xl font-heading font-semibold tracking-[-0.02em] leading-[1.05] text-(--on-bg-high) max-w-[820px]">
                  От раскадровки до финального грейда.
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-(--outline) border border-(--outline) rounded-3xl overflow-hidden">
                {PROCESS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.n}
                      className="group relative bg-(--bg) p-8 md:p-10 min-h-[300px] flex flex-col justify-between transition-colors hover:bg-(--card)"
                    >
                      <div className="flex items-start justify-between mb-12">
                        <span
                          className="font-mono text-5xl md:text-6xl font-black leading-none tabular-nums"
                          style={{ color: ACCENT }}
                        >
                          {step.n}
                        </span>
                        <Icon
                          className="size-6 shrink-0"
                          style={{ color: ACCENT_WARM }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-heading font-semibold mb-3 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-body-4 text-(--on-bg-medium) leading-relaxed">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ────────────────  CASE BODY (MDX)  ──────────────── */}
      <ScrollReveal threshold={0.02}>
        <section
          id="case"
          className="py-24 md:py-32 border-b border-(--outline)"
        >
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-3">
                <SectionLabel number="04" title="Case" accent={ACCENT} />
              </div>
              <div className="lg:col-span-9 max-w-[860px] prose-case">
                {content}
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ────────────────  MEDIA GALLERY  ──────────────── */}
      {project.media.length > 0 && (
        <ScrollReveal threshold={0.02}>
          <section className="py-24 md:py-32 border-b border-(--outline)">
            <Container variant="full-width">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-12 flex items-end justify-between gap-4">
                  <SectionLabel number="05" title="Gallery" accent={ACCENT} />
                  <span className="hidden md:block font-mono text-[10px] uppercase tracking-[0.24em] text-(--on-bg-low)">
                    {project.media.length} items
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4">
                  {project.media.map((m, idx) => {
                    // Asymmetric rhythm — matches the collage feel of the
                    // Dprofile case, where widescreen stills and vertical
                    // clips alternate.
                    const span =
                      idx % 5 === 0 ? "md:col-span-4" :
                      idx % 5 === 1 ? "md:col-span-2" :
                      idx % 5 === 2 ? "md:col-span-2" :
                      idx % 5 === 3 ? "md:col-span-4" :
                                      "md:col-span-6";
                    const aspect =
                      idx % 5 === 0 || idx % 5 === 3 ? "aspect-[16/10]" :
                      idx % 5 === 1 || idx % 5 === 2 ? "aspect-[3/4]" :
                                                       "aspect-[21/9]";
                    return (
                      <figure
                        key={m.id}
                        className={`${span} relative rounded-3xl overflow-hidden border border-(--outline) bg-(--card) group`}
                      >
                        {m.type === "video" ? (
                          <video
                            src={m.url}
                            controls
                            playsInline
                            preload="metadata"
                            className={`w-full ${aspect} bg-black object-cover`}
                          />
                        ) : (
                          <div className={`relative w-full ${aspect}`}>
                            <Image
                              src={m.url}
                              alt={m.caption || ""}
                              fill
                              sizes="(max-width: 768px) 100vw, 66vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                          </div>
                        )}
                        {m.caption && (
                          <figcaption className="absolute bottom-3 left-3 right-3 text-[11px] font-mono uppercase tracking-[0.2em] text-white/70 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 inline-block max-w-max">
                            {m.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </div>
            </Container>
          </section>
        </ScrollReveal>
      )}

      {/* ────────────────  IMPACT  ──────────────── */}
      <ScrollReveal threshold={0.02}>
        <section className="py-24 md:py-32 border-b border-(--outline)">
          <Container variant="full-width">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-3">
                <SectionLabel number="06" title="Impact" accent={ACCENT} />
              </div>
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImpactMetric
                  value="+34%"
                  label="рост узнаваемости"
                  sub="после запуска кампании"
                  accent={ACCENT}
                />
                <ImpactMetric
                  value="3×"
                  label="форматов из одного ролика"
                  sub="ТВ · digital · соцсети"
                  accent={ACCENT}
                />
                <ImpactMetric
                  value="2 нед."
                  label="от брифа до эфира"
                  sub="включая 3D-продакшн"
                  accent={ACCENT}
                />
              </div>
            </div>
          </Container>
        </section>
      </ScrollReveal>

      {/* ────────────────  CLOSING CTA  ──────────────── */}
      <section className="py-32 md:py-44 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${ACCENT}17 0%, transparent 60%)`,
          }}
        />
        <Container variant="full-width" className="relative z-10">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-(--on-bg-low) mb-6">
              End of case
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-heading font-semibold tracking-[-0.03em] leading-[1.02] mb-10">
              Хотите такой же{" "}
              <span style={{ color: ACCENT }}>ролик?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="xlarge" asChild>
                <Link href="/order">
                  Оформить заказ
                  <ArrowUpRight className="size-5" />
                </Link>
              </Button>
              <Button size="xlarge" variant="outlined" asChild>
                <Link href="/projects">
                  <ArrowLeft className="size-5" />
                  Все проекты
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function MetaCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/20 pt-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45 mb-1.5">
        {label}
      </div>
      <div className="text-body-4 text-white/90 truncate">{value}</div>
    </div>
  );
}

function SectionLabel({
  number,
  title,
  accent,
}: {
  number: string;
  title: string;
  accent: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-(--on-bg-low)">
          {number}
        </span>
        <span className="h-px w-8" style={{ background: accent }} />
      </div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-(--on-bg-low)">
        {title}
      </h2>
    </div>
  );
}

function ImpactMetric({
  value,
  label,
  sub,
  accent,
}: {
  value: string;
  label: string;
  sub: string;
  accent: string;
}) {
  return (
    <Card className="rounded-3xl border-(--outline) bg-(--card) p-6 ring-0">
      <div
        className="text-4xl md:text-5xl font-heading font-semibold tracking-[-0.02em] leading-none mb-3 tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
      <p className="text-body-3 text-(--on-bg-high) font-medium mb-1">{label}</p>
      <p className="text-body-5 text-(--on-bg-low) uppercase tracking-[0.18em]">
        {sub}
      </p>
    </Card>
  );
}

/** Marker to make sure the accent constants are exported for reuse. */
export { ACCENT as BREAD_ACCENT, ACCENT_WARM as BREAD_ACCENT_WARM, ACCENT_CREAM as BREAD_ACCENT_CREAM };
