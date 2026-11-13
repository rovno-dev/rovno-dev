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
      captions: { default: [] },
      isFullWidth: { default: false },
      layout: { default: "grid" },
      columns: { default: 2 },
      gap: { default: "none", rendered: false },
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
      columns: node.attrs.columns || 2,
    });
    const [tag, attrs, ...children] = out;
    return [tag, mergeAttributes(HTMLAttributes, attrs), ...children];
  },
  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView) as any;
  },
});

export const ColumnNode = Node.create({
  name: "column",
  content: "block+",
  isolating: true,
  parseHTML() {
    return [{ tag: "div[data-column]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-column": true, class: "min-w-0" }), 0];
  },
});

export const ColumnsNode = Node.create({
  name: "columns",
  group: "block",
  content: "column column",
  defining: true,
  addAttributes() {
    return {
      layout: {
        default: "1-1",
        parseHTML: (element) => element.getAttribute("data-layout") || "1-1",
        renderHTML: (attributes) => ({ "data-layout": attributes.layout }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-columns]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const layout = node.attrs.layout;
    const colsClass = layout === "1-2" ? "md:grid-cols-[1fr_2fr]" : "md:grid-cols-2";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-columns": true,
        class: `my-8 grid grid-cols-1 ${colsClass} gap-6 md:gap-8`,
      }),
      0,
    ];
  },
});
