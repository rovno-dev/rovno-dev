import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <main className="min-h-screen bg-(--bg) pb-24">
      <Container className="pt-4 md:pt-8">
        <div className="max-w-[860px] mx-auto">
          <Skeleton className="w-full aspect-[4/3] md:aspect-[21/9] rounded-4xl" />
        </div>
      </Container>
      
      <Container className="pt-4">
        <div className="max-w-[860px] mx-auto">
          <Skeleton className="h-[88px] w-full rounded-2xl" />
        </div>
      </Container>
      
      <Container className="py-12 md:py-16">
        <article className="max-w-[720px] mx-auto space-y-6">
          <Skeleton className="h-10 w-3/4 mb-10" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="pt-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        </article>
      </Container>
    </main>
  );
}
