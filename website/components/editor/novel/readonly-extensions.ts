import {
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapImage,
  TiptapLink,
} from "novel";
import { Node, mergeAttributes } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { renderGalleryHTML } from "./gallery-render";

const lowlight = createLowlight(common);

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

// Readonly Code Block matching the editor's premium look.
const ReadonlyCodeBlock = CodeBlockLowlight.extend({
  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      { class: "my-8 rounded-xl border border-[#2a2a35] bg-[#111114] overflow-hidden shadow-2xl" },
      [
        "div",
        { class: "flex items-center justify-between px-6 py-3 border-b border-[#2a2a35] bg-[#18181b]" },
        [
          "div",
          { class: "flex items-center gap-2 text-[#e2e2e6]" },
          [
            "svg",
            { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 256 256", class: "size-4 fill-[#3178c6]" },
            ["path", { d: "M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" }]
          ],
          ["span", { class: "text-[13px] font-medium font-mono text-[#8c8c9a]" }, "index.tsx"]
        ],
        [
          "div",
          { class: "flex items-center gap-3" },
          ["span", { class: "text-[13px] text-[#8c8c9a] font-medium font-mono" }, node.attrs.language || "Plain Text"]
        ]
      ],
      [
        "pre",
        mergeAttributes(HTMLAttributes, { class: "px-6 py-5 m-0 overflow-x-auto text-[14px] font-mono text-[#e2e2e6] bg-transparent border-none leading-[1.8] hljs" }),
        ["code", 0]
      ]
    ];
  }
}).configure({ lowlight });

export const readonlyExtensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc list-outside leading-relaxed" } },
    orderedList: { HTMLAttributes: { class: "list-decimal list-outside leading-relaxed" } },
    listItem: { HTMLAttributes: { class: "leading-normal" } },
    blockquote: { HTMLAttributes: { class: "border-l-2 border-(--outline) pl-4 italic" } },
    codeBlock: false,
    code: {
      HTMLAttributes: { class: "rounded-sm bg-(--bg-disabled) px-1.5 py-0.5 font-mono text-sm text-(--primary)", spellcheck: "false" },
    },
    horizontalRule: false,
    dropcursor: false,
    gapcursor: false,
  }),
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
  ReadonlyCodeBlock,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-8 mb-8 border-t border-(--outline)" },
  }),
];
