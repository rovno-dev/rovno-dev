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
        { class: "flex items-center justify-between px-6 py-3 border-b border-[#2a2a35] bg-[#18181b]" },
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
        mergeAttributes(HTMLAttributes, { class: "px-6 py-5 m-0 overflow-x-auto text-[14px] font-mono text-[#e2e2e6] bg-transparent border-none leading-[1.8] hljs" }),
        ["code", 0]
      ]
    ];
  }
}).configure({ lowlight });

// filename + icon per language, mirroring code-block-view.tsx so a code
// block looks identical in the editor and on the published page.
const READONLY_LANG_META: Record<string, { filename: string; iconSvg: string; tint: string }> = {
  typescript: { filename: "index.tsx", iconSvg: "M40 200h176V40H40v160Z M72 128h80v12H96v24h48v12H96v24h56v12H72v-84Z M172 128h40v12h-14v60h-14v-60h-14v-12Z", tint: "#3178c6" },
  javascript: { filename: "index.js", iconSvg: "M40 200h176V40H40v160Z M100 100v64c0 16-10 22-24 22-8 0-14-2-20-6l6-14c4 2 8 4 12 4 6 0 10-3 10-10v-60h16Z M180 96c-10 0-16 4-16 12 0 6 4 10 14 14l6 2c18 6 26 16 26 30 0 20-16 30-38 30-14 0-26-4-34-12l10-14c8 6 16 10 24 10 10 0 14-4 14-10 0-6-4-10-14-14l-6-2c-16-6-24-16-24-30 0-16 14-28 34-28 12 0 22 4 30 10l-10 14c-6-4-12-6-16-6Z", tint: "#f7df1e" },
  html: { filename: "index.html", iconSvg: "M40 200l16-176h144l16 176-88 24-88-24Z M80 56h96l-2 24H82l-2 24h92l-4 64-40 10-40-10-2-24", tint: "#e34c26" },
  css: { filename: "styles.css", iconSvg: "M40 200l16-176h144l16 176-88 24-88-24Z M80 56h96l-6 68H96l2 24h70l-6 68-40 10-36-10", tint: "#264de4" },
  python: { filename: "main.py", iconSvg: "M130 0c-30 0-50 12-50 34v26h52v8H56c-28 0-44 20-44 50 0 30 16 50 44 50h24v-30c0-28 20-42 48-42h52c20 0 34-14 34-34V34c0-20-18-34-50-34h-34Zm-24 16c6 0 10 4 10 10s-4 10-10 10-10-4-10-10 4-10 10-10Z M126 256c30 0 50-12 50-34v-26h-52v-8h74c28 0 44-20 44-50 0-30-16-50-44-50h-24v30c0 28-20 42-48 42H74c-20 0-34 14-34 34v56c0 20 18 34 50 34h36Zm24-16c-6 0-10-4-10-10s4-10 10-10 10 4 10 10-4 10-10 10Z", tint: "#3776ab" },
  null: { filename: "notes.txt", iconSvg: "M56 40h96l48 48v128H56V40Z M152 40v48h48", tint: "#8c9c9a" },
};

function metaFor(lang: string | null | undefined) {
  const key = lang || "null";
  return READONLY_LANG_META[key] ?? READONLY_LANG_META.null;
}

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
