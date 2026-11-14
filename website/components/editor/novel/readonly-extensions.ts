import {
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapImage,
  TiptapLink,
} from "novel";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ReadonlyCodeBlockNodeView } from "./code-block-view";
import { TableOfContents } from "@tiptap/extension-table-of-contents";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { renderGalleryHTML } from "./gallery-render";
import { slugify } from "@/utils/slugify";

const lowlight = createLowlight(common);

export const ReadonlyHeading = Node.create({
  name: "heading",
  group: "block",
  content: "inline*",
  defining: true,
  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    };
  },
  parseHTML() {
    return [
      { tag: "h1", attrs: { level: 1 } },
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
      { tag: "h5", attrs: { level: 5 } },
      { tag: "h6", attrs: { level: 6 } },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const text = node.textContent || "";
    const id = slugify(text);
    const level = node.attrs.level;
    let className = "";
    if (level === 1) className = "text-display-2 text-(--on-bg-high) mt-16 mb-6 tracking-tight scroll-mt-28";
    if (level === 2) className = "text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight scroll-mt-28";
    if (level === 3) className = "text-display-5 text-(--on-bg-high) mt-8 mb-3 scroll-mt-28";
    if (level === 4) className = "text-display-6 text-(--on-bg-high) mt-6 mb-2 scroll-mt-28";
    if (level === 5) className = "text-display-6 text-(--on-bg-high) mt-4 mb-2 scroll-mt-28";
    if (level === 6) className = "text-display-6 text-(--on-bg-high) mt-4 mb-2 scroll-mt-28";
    return [
      `h${level}`,
      mergeAttributes(HTMLAttributes, { id, class: className }),
      0,
    ];
  },
});

export const ReadonlyVideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null }, poster: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: true,
        class: "rounded-xl border border-(--outline) w-full my-8",
      }),
    ];
  },
});

export const ReadonlyGalleryNode = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
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
});

export const ReadonlyColumnNode = Node.create({
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

export const ReadonlyColumnsNode = Node.create({
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

const ReadonlyCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ReadonlyCodeBlockNodeView);
  },
}).configure({ lowlight });

export const readonlyExtensions = [
  StarterKit.configure({
    heading: false,
    bulletList: { HTMLAttributes: { class: "list-disc list-outside leading-relaxed" } },
    orderedList: { HTMLAttributes: { class: "list-decimal list-outside leading-relaxed" } },
    listItem: { HTMLAttributes: { class: "leading-normal" } },
    blockquote: { HTMLAttributes: { class: "border-l-2 border-(--outline) pl-4 italic" } },
    codeBlock: false,
    code: {
      HTMLAttributes: { class: "rounded-sm bg-(--bg-disabled) px-1.5 py-0.5 font-mono text-body-4 text-(--primary)", spellcheck: "false" },
    },
    horizontalRule: false,
    dropcursor: false,
    gapcursor: false,
  }),
  ReadonlyHeading,
  Placeholder.configure({
    placeholder: ({ node }) => node.type.name === "heading" ? "Заголовок…" : "Начните писать…",
  }),
  TiptapLink.configure({
    HTMLAttributes: { class: "text-(--primary) underline underline-offset-2" },
  }),
  TiptapImage.configure({
    HTMLAttributes: { class: "rounded-xl border border-(--outline)" },
  }),
  ReadonlyVideoNode,
  ReadonlyGalleryNode,
  ReadonlyColumnsNode,
  ReadonlyColumnNode,
  ReadonlyCodeBlock,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-8 mb-8 border-t border-(--outline)" },
  }),
  TableOfContents.configure({
    getText: (node: any) => node.textContent,
    getId: (node: any) => slugify(node.textContent || ""),
  } as any),
];
