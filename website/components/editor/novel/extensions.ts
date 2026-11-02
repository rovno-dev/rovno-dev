import {
  Command,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapImage,
  TiptapLink,
  UploadImagesPlugin,
} from "novel";
import { Node, mergeAttributes } from "@tiptap/core";

// ── Custom Video Node (Local uploads only) ──────────────────────────────
export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: true,
        class: "rounded-lg border border-(--outline) w-full my-4",
      }),
    ];
  },
});

// ── Custom Grid Gallery Node ────────────────────────────────────────────
export const GalleryNode = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      images: { default: [] },
    };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-gallery]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const imgs = element.querySelectorAll("img");
          const images = Array.from(imgs)
            .map((img) => img.getAttribute("src"))
            .filter(Boolean);
          return { images };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes, node }) {
    const images = node.attrs.images || [];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-gallery": "true",
        class: "grid grid-cols-2 md:grid-cols-3 gap-2 my-6",
      }),
      ...images.map((url: string) => [
        "img",
        {
          src: url,
          class:
            "rounded-lg border border-(--outline) object-cover w-full h-full aspect-video",
        },
      ]),
    ];
  },
});

// ── Base Extensions ─────────────────────────────────────────────────────
const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: "opacity-40 rounded-lg border border-(--outline)",
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: { class: "rounded-lg border border-(--outline)" },
});

export const extensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: { class: "list-disc list-outside leading-relaxed" },
    },
    orderedList: {
      HTMLAttributes: { class: "list-decimal list-outside leading-relaxed" },
    },
    listItem: {
      HTMLAttributes: { class: "leading-normal" },
    },
    blockquote: {
      HTMLAttributes: { class: "border-l-2 border-(--outline) pl-4 italic" },
    },
    codeBlock: {
      HTMLAttributes: {
        class:
          "rounded-lg bg-(--bg-disabled) border border-(--outline) p-4 font-mono text-sm",
      },
    },
    code: {
      HTMLAttributes: {
        class: "rounded bg-(--bg-disabled) px-1.5 py-0.5 font-mono text-sm",
        spellcheck: "false",
      },
    },
    horizontalRule: false,
    dropcursor: { color: "#336DFF", width: 3 },
    gapcursor: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === "heading"
        ? "Заголовок…"
        : "Введите '/' для меню или начните писать…",
  }),
  Command.configure({
    suggestion: {
      char: "/",
    },
  }),
  TiptapLink.configure({
    HTMLAttributes: {
      class: "text-(--primary) underline underline-offset-2",
    },
  }),
  tiptapImage,
  VideoNode,
  GalleryNode,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-4 mb-6 border-t border-(--outline)" },
  }),
];
