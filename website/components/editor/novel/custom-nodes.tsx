import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView, VideoNodeView, GalleryNodeView } from "./node-views";
import { TiptapImage } from "novel";
import { renderGalleryHTML } from "./gallery-render";

export const CustomImage = TiptapImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView) as any;
  },
});

export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return { src: { default: null }, poster: { default: null } };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: true, class: "rounded-sm border border-(--outline) w-full my-4" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView) as any;
  },
});

export const GalleryNode = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  isolating: true,

  addAttributes() {
    return {
      images: { default: [] },
      // Parallel array of per-image titles/captions. Optional. Missing
      // entries render as empty alt text; the lightbox shows the index
      // as the title fallback.
      captions: { default: [] },
      // Break out of the article's max-width and span the viewport on
      // the public page.
      isFullWidth: { default: false },
      // "grid" (uniform 4:3 tiles) or "masonry" (natural heights in
      // CSS columns — irregular rhythm).
      layout: { default: "grid" },
      // Space between tiles: "none" (edge-to-edge), "sm", "md".
      gap: { default: "md" },
      // 2..6 columns for grid, or CSS multi-column count for masonry.
      columns: { default: 3 },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-gallery]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const out = renderGalleryHTML({
      images: node.attrs.images || [],
      captions: node.attrs.captions || [],
      isFullWidth: !!node.attrs.isFullWidth,
      layout: node.attrs.layout || "grid",
      gap: node.attrs.gap || "md",
      columns: node.attrs.columns || 3,
    });
    const [tag, attrs, ...children] = out;
    return [tag, mergeAttributes(HTMLAttributes, attrs), ...children];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView) as any;
  },
});
