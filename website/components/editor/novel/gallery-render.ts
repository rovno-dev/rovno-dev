// Shared renderer for the gallery node — used by both the editor's
// serialization (GalleryNode.renderHTML) and the readonly public page
// (ReadonlyGalleryNode.renderHTML). One source of truth so the two can
// never drift.
//
// Width behaviour:
//   - isFullWidth = false → `w-full`, i.e. inherits the article's column
//     width. Matches every other paragraph and image on the page.
//   - isFullWidth = true  → `w-screen` broken out of the article column
//     with `left-1/2 -translate-x-1/2`, edge-to-edge with zero paddings.
//
// Gap behaviour: ALWAYS zero. No `gap-*` classes, no borders, no per-image
// rounding. Adjacent tiles touch exactly — a 1px separator would read as a
// gap and reveal the page background.

export type GalleryLayout = "grid" | "masonry";

export interface GalleryAttrs {
  images?: string[];
  captions?: string[];
  isFullWidth?: boolean;
  layout?: GalleryLayout;
  columns?: number;
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
};

const MASONRY_COLS: Record<number, string> = {
  1: "columns-1",
  2: "columns-1 md:columns-2",
};

export function renderGalleryHTML(attrs: GalleryAttrs): any[] {
  const images = attrs.images ?? [];
  const captions = attrs.captions ?? [];
  const isFullWidth = attrs.isFullWidth ?? false;
  const layout: GalleryLayout = attrs.layout === "masonry" ? "masonry" : "grid";
  const cols = Math.max(1, Math.min(2, Number(attrs.columns) || 2));

  // Width: full-bleed when checked, article-width otherwise.
  // `overflow-hidden` clips anything the scale-hover on images might push
  // past the wrapper (masonry natural heights, zoomed tiles).
  const outerClass = isFullWidth
    ? "w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 my-6 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
    : "w-full my-6 overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-8 duration-700";

  const outerAttrs: Record<string, any> = {
    "data-gallery": "true",
    "data-gallery-layout": layout,
    "data-gallery-full-width": isFullWidth ? "true" : "false",
    class: outerClass,
  };

  // No border, no per-image rounding — anything that creates a 1px visual
  // seam between tiles is disabled so the grid reads as one continuous
  // surface. Hover scale stays as a subtle interaction cue.
  const imgClass =
    "w-full block transition-transform duration-500 ease-out hover:scale-[1.02]";
  const imgClassGrid = `${imgClass} aspect-[4/3] object-cover`;
  const imgClassMasonry = `${imgClass} h-auto`;

  if (layout === "masonry") {
    return [
      "div",
      outerAttrs,
      [
        "div",
        { class: ["w-full", MASONRY_COLS[cols]].join(" ") },
        ...images.map((src, i) => {
          const caption = captions[i] ?? "";
          const figureChildren: any[] = [
            [
              "img",
              {
                src,
                alt: caption,
                "data-gallery-image": "true",
                "data-gallery-index": String(i),
                "data-gallery-caption": caption,
                loading: "lazy",
                class: imgClassMasonry,
              },
            ],
          ];
          if (caption) {
            figureChildren.push([
              "figcaption",
              {
                class: "text-xs text-(--on-bg-low) mt-1 px-1 truncate",
              },
              caption,
            ]);
          }
          return [
            "figure",
            { class: "break-inside-avoid m-0" },
            ...figureChildren,
          ];
        }),
      ],
    ];
  }

  return [
    "div",
    outerAttrs,
    [
      "div",
      { class: ["w-full grid", GRID_COLS[cols]].join(" ") },
      ...images.map((src, i) => {
        const caption = captions[i] ?? "";
        const figureChildren: any[] = [
          [
            "img",
            {
              src,
              alt: caption,
              "data-gallery-image": "true",
              "data-gallery-index": String(i),
              "data-gallery-caption": caption,
              loading: "lazy",
              class: imgClassGrid,
            },
          ],
        ];
        if (caption) {
          figureChildren.push([
            "figcaption",
            {
              class: "text-xs text-(--on-bg-low) mt-1 px-1 truncate",
            },
            caption,
          ]);
        }
        return ["figure", { class: "m-0" }, ...figureChildren];
      }),
    ],
  ];
}
