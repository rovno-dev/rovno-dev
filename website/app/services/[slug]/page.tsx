import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import {
  ArrowLeft,
  ArrowUpRight,
  Palette,
  Code,
  Cube,
  FilmStrip,
  Megaphone,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toc } from "@/components/layout/toc/toc";
import { slugify } from "@/utils/slugify";
import {
  SERVICES_META,
  loadServiceDoc,
  findServiceMeta,
} from "@/app/_data/services";
import { MDXParagraph } from "@/components/mdx";

export function generateStaticParams() {
  return SERVICES_META.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadServiceDoc(slug);
  if (!doc) return { title: "Услуга не найдена · Rovno.dev" };
  return {
    title: `${doc.title} · Rovno.dev`,
    description: doc.description,
  };
}

const ICONS: Record<string, React.ComponentType<{ className?: string; weight?: "bold" | "fill" | "regular" }>> = {
  palette: Palette,
  code: Code,
  cube: Cube,
  film: FilmStrip,
  megaphone: Megaphone,
  sparkle: Sparkle,
};

/** Extract plain text from a React children tree (for heading slugs). */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return extractText(
      (node as { props: { children: React.ReactNode } }).props.children,
    );
  }
  return "";
}

/** Heading components — identical slugify() logic to the TOC extractor. */
const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h2
        id={id}
        className="text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight scroll-mt-28"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h3
        id={id}
        className="text-heading-3 text-(--on-bg-high) mt-8 mb-3 scroll-mt-28"
      >
        {children}
      </h3>
    );
  },
  p: MDXParagraph,
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-body-3 text-(--on-bg-medium) leading-[1.75]">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-body-3 text-(--on-bg-medium) leading-[1.75]">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="pl-1">{children}</li>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-(--on-bg-high)">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-(--primary) underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  ),
};

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadServiceDoc(slug);
  if (!doc) notFound();

  const { content } = await compileMDX({
    source: doc.body,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  const Icon = ICONS[doc.iconKey];
  const otherServices = SERVICES_META.filter((s) => s.slug !== slug);

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Hero */}
      <section className="relative border-b border-(--outline) pt-16 md:pt-24 pb-12 md:pb-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 60% 70% at 25% 0%, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 70% at 25% 0%, black 40%, transparent 90%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 45% 55% at 15% 10%, ${doc.accent}18, transparent 65%)`,
          }}
        />
        <Container className="relative">
          <div className="max-w-[900px]">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              Все услуги
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="flex size-14 items-center justify-center rounded-2xl"
                style={{
                  background: `${doc.accent}20`,
                  color: doc.accent,
                }}
              >
                {Icon && <Icon className="size-6" weight="bold" />}
              </div>
              <p
                className="text-body-5 uppercase tracking-[0.3em]"
                style={{ color: doc.accent }}
              >
                {doc.tagline}
              </p>
            </div>

            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.05] tracking-[-0.02em] mb-5">
              {doc.title}
            </h1>
            <p className="text-body-2 md:text-display-5 text-(--on-bg-medium) leading-relaxed max-w-[680px]">
              {doc.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                  Срок
                </p>
                <p className="text-body-3 text-(--on-bg-high) font-medium">
                  {doc.leadTime}
                </p>
              </div>
              <div className="w-px h-10 bg-(--outline)" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-(--on-bg-low) mb-1">
                  Стоимость
                </p>
                <p className="text-body-3 text-(--on-bg-high) font-medium">
                  {doc.startingAt}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Body + TOC */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-16">
            <article className="max-w-[760px] prose-case">{content}</article>

            <div className="space-y-8">
              {doc.headings.length > 0 && (
                <Toc
                  headings={doc.headings}
                  label="Содержание"
                  ariaLabel="Содержание услуги"
                />
              )}

              <div className="hidden lg:block pt-6 border-t border-(--outline)">
                <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">
                  Другие услуги
                </p>
                <ul className="space-y-2.5 text-body-4">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="text-(--on-bg-medium) hover:text-(--primary) transition-colors leading-snug block"
                      >
                        {s.shortTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <Container>
          <div className="max-w-[860px] mx-auto relative rounded-5xl border border-(--outline) bg-(--card) p-8 md:p-12 overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 70% 120% at 100% 0%, ${doc.accent}18, transparent 65%)`,
              }}
            />
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-display-4 md:text-display-3 text-(--on-bg-high) mb-2 tracking-tight">
                  Нужна {doc.shortTitle.toLowerCase()}?
                </h2>
                <p className="text-body-3 text-(--on-bg-medium) max-w-lg">
                  Опишите задачу — ответим в течение 3 часов и предложим план.
                </p>
              </div>
              <Button size="large" asChild className="shrink-0">
                <Link href="/order">
                  Оформить заказ
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
