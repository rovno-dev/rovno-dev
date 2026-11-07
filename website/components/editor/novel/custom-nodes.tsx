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
      // Kept only so old JSON with a `gap` value stays parseable; it is
      // ignored by the renderer (gap is always zero).
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
