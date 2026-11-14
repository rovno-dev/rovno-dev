"use client";

// Full-page carousel viewer for galleries. Reused by the editor (via a
// per-tile button, local state) and by the readonly page (via a document
// click delegation, see gallery-lightbox.tsx).
//
// Features mirrored from the order page's attachment lightbox:
//   - Carousel with prev/next
//   - Keyboard ArrowLeft/ArrowRight
//   - Clicks outside the image close the modal
//   - Caption + index strip at the bottom (title for the current image)

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "@phosphor-icons/react";

export interface GalleryPreviewItem {
  src: string;
  caption?: string;
}

export function GalleryPreviewModal({
  open,
  onOpenChange,
  items,
  initialIndex = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GalleryPreviewItem[];
  initialIndex?: number;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Jump to the clicked image once the carousel is ready.
  useEffect(() => {
    if (!api || !open) return;
    const t = setTimeout(() => api.scrollTo(initialIndex, true), 50);
    return () => clearTimeout(t);
  }, [api, open, initialIndex]);

  // Keyboard navigation while the modal is open.
  useEffect(() => {
    if (!open || !api) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") api.scrollPrev();
      if (e.key === "ArrowRight") api.scrollNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, api]);

  if (items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!fixed !inset-0 !top-0 !left-0 !translate-none !max-w-none !max-h-none !w-screen !h-screen !p-0 !border-0 !rounded-none !bg-black/95 flex items-center justify-center duration-300 data-open:zoom-in-95 data-closed:zoom-out-95"
      >
        <DialogTitle className="sr-only">Просмотр галереи</DialogTitle>
        <Button
          variant="glass"
          size="icon-medium"
          className="absolute top-4 right-4 z-[60] rounded-full border-white/20 hover:bg-white/20 transition-all duration-200"
          onClick={() => onOpenChange(false)}
          aria-label="Закрыть"
        >
          <XIcon className="size-6! text-white" />
        </Button>
        <Carousel
          key={items.map((i) => i.src).join("|")}
          setApi={setApi}
          className="w-full h-full"
        >
          <CarouselContent className="h-[100dvh] ml-0">
            {items.map((item, i) => (
              <CarouselItem
                key={i}
                className="h-full flex items-center justify-center p-0"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.caption || ""}
                    className="max-w-[92vw] max-h-[88vh] object-contain select-none animate-in fade-in duration-500"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 1 && (
            <>
              <CarouselPrevious className="left-6 z-50 bg-white/10 hover:bg-white/20 text-white size-12! border-0 backdrop-blur-md transition-all duration-200" />
              <CarouselNext className="right-6 z-50 bg-white/10 hover:bg-white/20 text-white size-12! border-0 backdrop-blur-md transition-all duration-200" />
            </>
          )}
          <div className="absolute bottom-0 inset-x-0 z-50 px-6 py-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between gap-4 max-w-[1400px] mx-auto">
              <p className="text-body-4 text-white/90 truncate max-w-[60vw]">
                {items[current]?.caption || ""}
              </p>
              <span className="font-mono text-body-5 text-white/60 tabular-nums shrink-0 bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                {current + 1} / {items.length}
              </span>
            </div>
          </div>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
