import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView, VideoNodeView, GalleryNodeView } from "./node-views";
import { TiptapImage } from "novel";

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
    return { images: { default: [] }, isFullWidth: { default: false } };
  },
  parseHTML() {
    return [{ tag: "div[data-gallery]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const images = node.attrs.images || [];
    const wClass = node.attrs.isFullWidth ? "w-full" : "w-full max-w-3xl mx-auto";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-gallery": "true",
        class: `${wClass} grid grid-cols-2 md:grid-cols-3 gap-2 my-6`,
      }),
      ...images.map((url: string) => [
        "img",
        { src: url, class: "w-full aspect-[4/3] object-cover rounded-sm border border-(--outline) m-0" },
      ]),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(GalleryNodeView) as any;
  },
});
