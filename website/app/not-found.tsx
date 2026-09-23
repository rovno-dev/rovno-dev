import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, House } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-(--bg)">
      {/* Grid is intentionally subtle — it should read as texture, not as
          the message. */}\
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-[0.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-(--bg) via-transparent to-(--bg)/0" />

      <Container className="relative z-10 text-center">
        <p className="text-body-5 uppercase tracking-[0.35em] text-(--on-bg-low) mb-6">
          404
        </p>
        <h1 className="text-display-1 md:text-[7rem] font-heading font-semibold leading-none tracking-tighter text-(--on-bg-high) mb-6">
          Страница не найдена
        </h1>
        <p className="text-body-2 text-(--on-bg-medium) max-w-md mx-auto mb-10 leading-relaxed">
          Возможно, ссылка устарела, была удалена, или вы опечатались в адресе.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="large" asChild>
            <Link href="/">
              <House className="size-4" />
              На главную
            </Link>
          </Button>
          <Button variant="outlined" size="large" asChild>
            <Link href="/blog">
              <ArrowLeft className="size-4" />
              В журнал
            </Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
