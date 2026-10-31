import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Toc } from "@/components/layout/toc/toc";
import { slugify } from "@/utils/slugify";
import { SERVICES_META, loadServiceDoc } from "@/app/_data/services";
import { MDXParagraph } from "@/components/mdx";
import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";

export function generateStaticParams() {
  return SERVICES_META.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = loadServiceDoc(slug) as any;
  if (!doc) return { title: "Услуга не найдена · Rovno.dev" };
  return {
    title: `${doc.title} · Rovno.dev`,
    description: doc.description,
  };
}

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

const mdxComponents = {
  h2: ({ children }: { children: React.ReactNode }) => {
    const id = slugify(extractText(children));
    return (
      <h2
        id={id}
        className="text-2xl md:text-3xl font-semibold text-(--on-bg-high) mt-12 mb-4 tracking-tight scroll-mt-28"
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
        className="text-lg md:text-xl font-medium text-(--on-bg-high) mt-8 mb-3 scroll-mt-28"
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
  const doc = loadServiceDoc(slug) as any;
  if (!doc) notFound();

  const { content } = await compileMDX({
    source: doc.body,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  const otherServices = SERVICES_META.filter((s) => s.slug !== slug);

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Fancy Left-Aligned Hero */}
      <section className="relative border-b border-(--outline) pt-24 pb-16 overflow-hidden">
        {/* Subtle blueprint grid background */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--on-bg-high) 1px, transparent 1px), linear-gradient(to bottom, var(--on-bg-high) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 60% 80% at 20% 20%, black 40%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 80% at 20% 20%, black 40%, transparent 90%)",
          }}
        />
        
        <Container className="relative z-10">
          <div className="max-w-[860px] animate-reveal">
            <Link
              href="/#services"
              className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--on-bg-high) transition-colors mb-10 group"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              Все услуги
            </Link>
            
            <h1 className="text-5xl md:text-7xl font-heading font-semibold text-(--on-bg-high) leading-[1.05] tracking-[-0.03em] mb-6">
              {doc.shortTitle}
            </h1>
            
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed max-w-[640px] mb-10">
              {doc.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <QuickOrderDialog serviceName={doc.shortTitle}>
                <Button size="large" className="h-14 px-8 text-lg w-full sm:w-auto">
                  Обсудить проект
                  <ArrowUpRight className="size-5 ml-2" />
                </Button>
              </QuickOrderDialog>
              
              <div className="flex gap-8 sm:pl-8 sm:border-l border-(--outline)">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1">Срок</p>
                  <p className="text-body-3 text-(--on-bg-high) font-medium">{doc.leadTime}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-(--on-bg-low) mb-1">Стоимость</p>
                  <p className="text-body-3 text-(--on-bg-high) font-medium">{doc.startingAt}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Content & TOC — Fixed layout using flex and min-w-0 to prevent overlap */}
      <section className="py-16 md:py-24 relative">
        <Container>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start relative">
            
            {/* Main Article */}
            <article className="flex-1 w-full min-w-0 max-w-[760px] prose-case">
              {content}
            </article>
            
            {/* Sidebar */}
            <aside className="hidden lg:block w-[260px] shrink-0 sticky top-32">
              {doc.headings.length > 0 && (
                <Toc
                  headings={doc.headings}
                  label="Содержание"
                  ariaLabel="Содержание услуги"
                />
              )}
              <div className="mt-12 pt-8 border-t border-(--outline)">
                <p className="text-[11px] uppercase tracking-[0.2em] text-(--on-bg-low) mb-4">
                  Другие услуги
                </p>
                <ul className="space-y-3">
                  {otherServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="text-body-4 text-(--on-bg-medium) hover:text-(--primary) transition-colors block"
                      >
                        {s.shortTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* CTA — Minimalist */}
      <section className="pb-24">
        <Container>
          <div className="max-w-[860px] rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl text-(--on-bg-high) mb-2 tracking-tight">
                  Нужна {doc.shortTitle.toLowerCase()}?
                </h2>
                <p className="text-body-3 text-(--on-bg-medium) max-w-lg">
                  Опишите задачу — ответим в течение 3 часов и предложим план.
                </p>
              </div>
              <QuickOrderDialog serviceName={doc.shortTitle}>
                <Button size="large" className="shrink-0">
                  Оставить заявку
                  <ArrowUpRight className="size-4" />
                </Button>
              </QuickOrderDialog>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
