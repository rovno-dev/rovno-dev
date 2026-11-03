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
        class: `${wClass} grid grid-cols-2 md:grid-cols-3 gap-2 my-8`,
      }),
      ...images.map((url: string) => [
        "img",
        {
          src: url,
          class: "w-full aspect-[4/3] object-cover rounded-xl border border-(--outline) m-0",
        },
      ]),
    ];
  },
});

// Readonly Code Block matching the editor's premium look
const ReadonlyCodeBlock = CodeBlockLowlight.extend({
  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      { class: "my-8 rounded-xl border border-[#2a2a35] bg-[#111114] overflow-hidden shadow-2xl" },
      
      // Header Bar
      [
        "div",
        { class: "flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a35] bg-[#18181b]" },
        // Left: Icon + Filename
        [
          "div",
          { class: "flex items-center gap-2 text-[#e2e2e6]" },
          // SVG representing FileTs icon
          [
            "svg",
            { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 256 256", class: "size-4 fill-[#3178c6]" },
            ["path", { d: "M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" }]
          ],
          ["span", { class: "text-[13px] font-medium font-mono text-[#8c8c9a]" }, "index.tsx"]
        ],
        // Right: Language
        [
          "div",
          { class: "flex items-center gap-3" },
          ["span", { class: "text-[13px] text-[#8c8c9a] font-medium font-mono" }, node.attrs.language || "Plain Text"]
        ]
      ],
      
      // Code Content
      [
        "pre",
        mergeAttributes(HTMLAttributes, { class: "p-5 m-0 overflow-x-auto text-[14px] font-mono text-[#e2e2e6] bg-transparent border-none leading-[1.7] hljs" }),
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
    codeBlock: false, // Use ReadonlyCodeBlock instead
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
