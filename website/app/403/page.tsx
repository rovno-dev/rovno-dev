import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none grid-bg" />
      <div className="z-10 absolute inset-0 bg-gradient-to-t from-(--bg) to-(--bg)/0 to-20%" />
      <Container className="relative z-10 text-center">
        <h1 className="text-[10rem] font-heading font-bold text-(--on-bg-high) leading-none">403</h1>
        <h2 className="text-display-3 mb-4">Доступ запрещён</h2>
        <p className="text-body-1 text-(--on-bg-medium) max-w-md mx-auto mb-8">
          У вас нет прав для просмотра этой страницы. Если вы считаете, что это ошибка, свяжитесь с поддержкой.
        </p>
        <Button size="large" shape="round" asChild>
          <Link href="/">На главную</Link>
        </Button>
      </Container>
    </main>
  );
}
