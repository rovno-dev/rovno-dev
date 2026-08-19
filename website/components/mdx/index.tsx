"use client";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// -------- Heading --------
export function MDXHeading({
  level,
  children,
  className,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classes = {
    1: "text-display-2 md:text-display-1 mb-6 mt-12",
    2: "text-display-3 md:text-display-2 mb-4 mt-8",
    3: "text-display-4 mb-3 mt-6",
    4: "text-display-5 mb-2 mt-4",
    5: "text-display-6 mb-2 mt-4",
    6: "text-body-1 font-semibold mb-2 mt-4",
  };
  return <Tag className={cn(classes[level], className)}>{children}</Tag>;
}

// -------- Image --------
export function MDXImage({ src, alt, ...props }: { src: string; alt?: string }) {
  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-(--outline) bg-(--card)">
      <Image
        src={src}
        alt={alt || ""}
        width={1200}
        height={800}
        className="w-full h-auto object-cover"
        {...props}
      />
    </div>
  );
}

// -------- Blockquote --------
export function MDXBlockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-6 border-l-4 border-(--primary) pl-4 italic text-(--on-bg-medium)">
      {children}
    </blockquote>
  );
}

// -------- Code (inline) --------
export function MDXCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-(--bg-disabled) px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  );
}

// -------- Pre (code block) --------
export function MDXPre({ children }: { children: ReactNode }) {
  return (
    <pre className="my-6 rounded-xl bg-(--bg-disabled) p-4 overflow-x-auto text-sm">
      {children}
    </pre>
  );
}

// -------- List (ul / ol) --------
export function MDXList({
  children,
  ordered,
}: {
  children: ReactNode;
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={cn("my-4 ml-6 space-y-1", ordered ? "list-decimal" : "list-disc")}>
      {children}
    </Tag>
  );
}

export function MDXListItem({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>;
}

// -------- Paragraph --------
export function MDXParagraph({ children }: { children: ReactNode }) {
  return <p className="my-4 leading-relaxed text-(--on-bg-medium)">{children}</p>;
}

// -------- Horizontal Rule --------
export function MDXHr() {
  return <hr className="my-8 border-(--outline)" />;
}

// -------- Link --------
export function MDXLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-(--primary) underline underline-offset-2 hover:opacity-80">
      {children}
    </a>
  );
}

// -------- Table --------
export function MDXTable({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-(--outline)">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function MDXThead({ children }: { children: ReactNode }) {
  return <thead className="bg-(--bg-disabled)">{children}</thead>;
}

export function MDXTh({ children }: { children: ReactNode }) {
  return <th className="px-4 py-2 text-left font-medium">{children}</th>;
}

export function MDXTd({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2 border-t border-(--outline)">{children}</td>;
}

// -------- Card (generic) --------
export function MDXCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      {children}
    </Card>
  );
}

// -------- Gallery (image/video carousel) --------
export function Gallery({ media }: { media: Array<{ type: 'image' | 'video'; src: string }> }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<any>(null);

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((item, idx) => (
          <div
            key={idx}
            className="relative aspect-video rounded-2xl overflow-hidden border border-(--outline) bg-(--card) cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => {
              setActiveIndex(idx);
              setLightboxOpen(true);
            }}
          >
            {item.type === 'image' ? (
              <Image src={item.src} alt={`Media ${idx + 1}`} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-body-2 text-(--on-bg-medium)">▶ Видео</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="!fixed !inset-0 !z-50 !max-w-none !max-h-none !p-0 !border-0 !bg-black/98 !rounded-none !translate-none !top-0 !left-0"
        >
          <Button
            variant="glass"
            className="absolute top-4 right-4 z-[999]! rounded-full border-white/20"
            size="icon-medium"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="size-10! [&>path]:fill-white" />
          </Button>
          <Carousel setApi={setCarouselApi} className="w-full h-full">
            <CarouselContent className="h-[100dvh] ml-0">
              {media.map((item, idx) => (
                <CarouselItem key={idx} className="h-full flex items-center justify-center p-0">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {item.type === 'image' ? (
                      <Image
                        src={item.src}
                        alt={`Media ${idx + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={idx === activeIndex}
                      />
                    ) : (
                      <iframe
                        src={item.src + "?autoplay=1&mute=1"}
                        className="m-0 p-0 border-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        allowFullScreen
                        title={`Video ${idx + 1}`}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {media.length > 1 && (
              <>
                <CarouselPrevious className="left-6 z-50 bg-white/5 text-white size-12!" />
                <CarouselNext className="right-6 z-50 bg-white/5 text-white size-12!" />
              </>
            )}
            <div className="flex justify-center gap-2 mt-4 absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
              {media.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => carouselApi?.scrollTo(idx)}
                  className={`h-2 rounded-full transition-all ${carouselApi?.selectedScrollSnap() === idx ? "w-6 bg-white" : "w-2 bg-white/30"
                    }`}
                />
              ))}
            </div>
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}

// -------- Metric Card --------
export function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0">
      <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-2">{label}</p>
      <p className="text-display-1 text-(--on-bg-high) mb-2">{value}</p>
      <p className="text-body-3 text-(--on-bg-medium)">{description}</p>
    </div>
  );
}

// -------- Default export for mapping --------
export const defaultMDXComponents = {
  h1: (props: any) => <MDXHeading level={1} {...props} />,
  h2: (props: any) => <MDXHeading level={2} {...props} />,
  h3: (props: any) => <MDXHeading level={3} {...props} />,
  h4: (props: any) => <MDXHeading level={4} {...props} />,
  h5: (props: any) => <MDXHeading level={5} {...props} />,
  h6: (props: any) => <MDXHeading level={6} {...props} />,
  img: MDXImage,
  blockquote: MDXBlockquote,
  code: MDXCode,
  pre: MDXPre,
  ul: (props: any) => <MDXList ordered={false} {...props} />,
  ol: (props: any) => <MDXList ordered={true} {...props} />,
  li: MDXListItem,
  p: MDXParagraph,
  hr: MDXHr,
  a: MDXLink,
  table: MDXTable,
  thead: MDXThead,
  th: MDXTh,
  td: MDXTd,
  Card: MDXCard,
  Gallery,
  MetricCard,
};
