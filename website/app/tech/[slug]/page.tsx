import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowUpRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { TECH_STACK, findTech } from "@/app/_data/tech";

export function generateStaticParams() {
  return TECH_STACK.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tech = findTech(slug);
  if (!tech) return { title: "Not found" };
  return {
    title: tech.seoTitleRu,
    description: tech.seoDescRu,
  };
}

export default async function TechPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tech = findTech(slug);
  if (!tech) notFound();

  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="relative py-16 md:py-24 border-b border-(--outline) overflow-hidden">
        <Container>
          <Link href="/tech" className="inline-flex items-center gap-1.5 text-body-4 text-(--on-bg-low) hover:text-(--primary) transition-colors mb-10">
            <ArrowLeft className="size-4" />
            Все технологии
          </Link>
          <div className="max-w-[800px] animate-reveal">
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-6 tracking-tight">
              {tech.titleRu}
            </h1>
            <p className="text-body-1 md:text-display-5 text-(--on-bg-medium) leading-relaxed mb-10">
              {tech.descRu}
            </p>
            <Button size="large" asChild>
              <Link href="/order">
                Заказать разработку
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-[800px]">
            <h2 className="text-display-3 text-(--on-bg-high) mb-8">
              Почему мы используем {tech.titleRu.replace("Разработка на ", "")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tech.featuresRu.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="size-5 text-(--primary) shrink-0 mt-0.5" weight="fill" />
                  <p className="text-body-3 text-(--on-bg-medium) leading-relaxed">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
