import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import {
  LEGAL_DOCS,
  LEGAL_DOC_ORDER,
  type LegalSection,
  type LegalDocSlug,
} from "@/app/_data/legal";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return LEGAL_DOC_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return { title: "Документ не найден · Rovno.dev" };
  return {
    title: `${doc.shortTitle} · Rovno.dev`,
    description: doc.description,
  };
}

/**
 * Minimal inline markdown: **bold** → <strong>. Anything else stays plain text.
 * Legal docs don't need a full markdown parser.
 */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-(--on-bg-high)">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function Section({ section, depth = 0 }: { section: LegalSection; depth?: number }) {
  const HeadingTag = depth === 0 ? "h2" : "h3";
  const headingClass =
    depth === 0
      ? "text-display-4 text-(--on-bg-high) mt-12 mb-4 tracking-tight"
      : "text-heading-3 text-(--on-bg-high) mt-8 mb-3";
  return (
    <section id={section.id} className="scroll-mt-32">
      <HeadingTag className={headingClass}>{section.title}</HeadingTag>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-body-3 text-(--on-bg-medium) leading-[1.75] mb-4">
          {renderInline(p)}
        </p>
      ))}
      {section.list && (
        <ul className="list-disc pl-6 mb-4 space-y-2 text-body-3 text-(--on-bg-medium) leading-[1.75]">
          {section.list.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      )}
      {section.subsections?.map((sub) => (
        <Section key={sub.id} section={sub} depth={depth + 1} />
      ))}
    </section>
  );
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) notFound();

  const otherDocs = LEGAL_DOC_ORDER.filter((s) => s !== slug);

  return (
    <main className="min-h-screen bg-(--bg)">
      {/* Header */}
      <section className="border-b border-(--outline) pt-12 md:pt-20 pb-10">
        <Container>
          <div className="max-w-[900px]">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              Все документы
            </Link>
            <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-3">
              Правовая информация
            </p>
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) leading-[1.15] mb-4">
              {doc.title}
            </h1>
            <p className="text-body-4 text-(--on-bg-medium)">
              Дата публикации и вступления в силу:{" "}
              <time dateTime={doc.publishedAt}>{doc.publishedAtLabel}</time>
              {" · "}Место публикации: rovno.dev
            </p>
          </div>
        </Container>
      </section>

      {/* Body */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 lg:gap-16">
            <article className="max-w-[760px]">
              {doc.sections.map((section) => (
                <Section key={section.id} section={section} />
              ))}

              <div className="mt-16 pt-8 border-t border-(--outline)">
                <p className="text-body-5 text-(--on-bg-low)">
                  Если у вас есть вопросы по этому документу, напишите на{" "}
                  <a
                    href="mailto:rovno.dev@mail.ru"
                    className="text-(--primary) underline underline-offset-2"
                  >
                    rovno.dev@mail.ru
                  </a>
                  .
                </p>
              </div>
            </article>

            {/* Sidebar: TOC + cross-links to other docs */}
            <aside className="lg:sticky lg:top-32 h-fit space-y-8">
              <nav aria-label="Содержание документа">
                <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">
                  Содержание
                </p>
                <ul className="space-y-2 text-body-4">
                  {doc.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-(--on-bg-medium) hover:text-(--primary) transition-colors leading-snug block"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Другие документы" className="pt-6 border-t border-(--outline)">
                <p className="text-body-5 uppercase tracking-[0.25em] text-(--on-bg-low) mb-3">
                  Другие документы
                </p>
                <ul className="space-y-2 text-body-4">
                  {otherDocs.map((s) => {
                    const d = LEGAL_DOCS[s as LegalDocSlug];
                    if (!d) return null;
                    return (
                      <li key={s}>
                        <Link
                          href={`/docs/${s}`}
                          className={cn(
                            "text-(--on-bg-medium) hover:text-(--primary) transition-colors leading-snug block"
                          )}
                        >
                          {d.shortTitle}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
