"use client";

// Document-level click delegation for readonly galleries. Renders a
// GalleryPreviewModal that opens whenever the user clicks any element
// carrying `[data-gallery-image]`. Groups the clicked image with its
// siblings inside the nearest `[data-gallery]` container so the modal
// shows the whole gallery.
//
// Editor galleries are NOT wired to this — they use a per-tile preview
// button with local state (see node-views.tsx) so image clicks keep
// their normal ProseMirror selection behaviour.

import { useEffect, useState } from "react";
import {
  GalleryPreviewModal,
  type GalleryPreviewItem,
} from "./gallery-preview-modal";

export function GalleryLightbox() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<GalleryPreviewItem[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Skip interactive controls (editor mode markers) so a button
      // inside a gallery doesn't accidentally open the lightbox.
      if (target.closest("[data-gallery-control]")) return;
      const img = target.closest("[data-gallery-image]") as HTMLElement | null;
      if (!img) return;
      const gallery = img.closest("[data-gallery]") as HTMLElement | null;
      if (!gallery) return;
      const nodes = Array.from(
        gallery.querySelectorAll<HTMLElement>("[data-gallery-image]"),
      );
      if (nodes.length === 0) return;
      const galleryItems: GalleryPreviewItem[] = nodes.map((n) => ({
        src: n.getAttribute("src") || "",
        caption:
          n.getAttribute("data-gallery-caption") ||
          n.getAttribute("alt") ||
          "",
      }));
      const idx = nodes.indexOf(img);
      e.preventDefault();
      setItems(galleryItems);
      setStartIndex(Math.max(0, idx));
      setOpen(true);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <GalleryPreviewModal
      open={open}
      onOpenChange={setOpen}
      items={items}
      initialIndex={startIndex}
    />
  );
}
