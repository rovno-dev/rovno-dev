// Shared renderer for the gallery node — used by both the editor's
// serialization (GalleryNode.renderHTML) and the readonly public page
// (ReadonlyGalleryNode.renderHTML). One source of truth so the two can
// never drift.
//
// Layouts:
//   - grid    : uniform aspect-[4/3] tiles in a CSS grid
//   - masonry : natural-height tiles in CSS columns (irregular rhythm)
//
// Gap control (`none` / `sm` / `md`) turns the grid padding off entirely
// so the gallery can tile edge-to-edge with no gaps between images.
//
// `isFullWidth` breaks the gallery out of the article's max-width so it
// spans the viewport. The formula `width:100vw; margin-inline: calc(50% - 50vw)`
// works in every parent that is itself centered. Any overhang beyond the
// visible viewport (scrollbar width) is clipped by `overflow-x: clip` on
// the <main> element in client-layout.tsx.

export type GalleryLayout = "grid" | "masonry";
export type GalleryGap = "none" | "sm" | "md";

export interface GalleryAttrs {
  images?: string[];
  captions?: string[];
  isFullWidth?: boolean;
  layout?: GalleryLayout;
  gap?: GalleryGap;
  columns?: number;
}

// Tailwind class maps. Kept in sync with the editor's local class maps in
// node-views.tsx — the visual output must match the published page.
const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-6",
};

const MASONRY_COLS: Record<number, string> = {
  1: "columns-1",
  2: "columns-1 md:columns-2",
  3: "columns-2 md:columns-3",
  4: "columns-2 md:columns-4",
  5: "columns-2 md:columns-5",
  6: "columns-2 md:columns-6",
};

function styleToString(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export function renderGalleryHTML(attrs: GalleryAttrs): any[] {
  const images = attrs.images ?? [];
  const captions = attrs.captions ?? [];
  const isFullWidth = attrs.isFullWidth ?? false;
  const layout: GalleryLayout = attrs.layout === "masonry" ? "masonry" : "grid";
  const gap: GalleryGap =
    attrs.gap === "none" ? "none" : attrs.gap === "sm" ? "sm" : "md";
  const cols = Math.max(1, Math.min(6, Number(attrs.columns) || 3));

  const gapClass = gap === "none" ? "gap-0" : gap === "sm" ? "gap-1" : "gap-3";
  const colGapClass =
    gap === "none" ? "gap-x-0" : gap === "sm" ? "gap-x-1" : "gap-x-3";
  const masonryMbClass =
    gap === "none" ? "mb-0" : gap === "sm" ? "mb-1" : "mb-3";

  const outerAttrs: Record<string, any> = {
    "data-gallery": "true",
    "data-gallery-layout": layout,
    "data-gallery-gap": gap,
    "data-gallery-full-width": isFullWidth ? "true" : "false",
    class: "my-6",
  };

  if (isFullWidth) {
    outerAttrs.style = styleToString({
      width: "100vw",
      maxWidth: "100vw",
      marginLeft: "calc(50% - 50vw)",
      marginRight: "calc(50% - 50vw)",
    });
  }

  if (layout === "masonry") {
    return [
      "div",
      outerAttrs,
      [
        "div",
        { class: ["w-full", MASONRY_COLS[cols], colGapClass].join(" ") },
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
                class:
                  "w-full h-auto block rounded-sm border border-(--outline) m-0",
              },
            ],
          ];
          if (caption) {
            figureChildren.push([
              "figcaption",
              {
                class:
                  "text-xs text-(--on-bg-low) mt-1 px-1 truncate",
              },
              caption,
            ]);
          }
          return [
            "figure",
            {
              class: cnMasonryItem(masonryMbClass),
            },
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
      { class: ["w-full grid", GRID_COLS[cols], gapClass].join(" ") },
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
              class:
                "w-full aspect-[4/3] object-cover rounded-sm border border-(--outline) m-0",
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

function cnMasonryItem(mbClass: string): string {
  return `${mbClass} break-inside-avoid m-0`;
}
