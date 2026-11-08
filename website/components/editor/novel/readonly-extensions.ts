import {
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapImage,
  TiptapLink,
} from "novel";
import { Node, mergeAttributes } from "@tiptap/core";
import { TableOfContents } from "@tiptap/extension-table-of-contents";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { renderGalleryHTML } from "./gallery-render";
import { slugify } from "@/utils/slugify";

const lowlight = createLowlight(common);

// Custom Heading node built directly from @tiptap/core to avoid the
// missing @tiptap/extension-heading dependency. It injects the slugified
// text as the `id` attribute so the TOC can scroll to it, and adds the
// exact Tailwind classes used by the MDX renderer so they look identical.
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
    // node is a ProseMirror Node, not a JSON object. textContent is the
    // native getter for the plain text inside it.
    const text = node.textContent || "";
    const id = slugify(text);
    const level = node.attrs.level;

    let className = "";
    if (level === 1) className = "text-display-2 text-(--on-bg-high) mt-16 mb-6 tracking-tight scroll-mt-28";
    if (level === 2) className = "text-display-4 text-(--on-bg-high) mt-14 mb-4 tracking-tight scroll-mt-28";
    if (level === 3) className = "text-heading-3 text-(--on-bg-high) mt-8 mb-3 scroll-mt-28";
    if (level === 4) className = "text-heading-4 text-(--on-bg-high) mt-6 mb-2 scroll-mt-28";
    if (level === 5) className = "text-heading-5 text-(--on-bg-high) mt-4 mb-2 scroll-mt-28";
    if (level === 6) className = "text-heading-6 text-(--on-bg-high) mt-4 mb-2 scroll-mt-28";

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

// Readonly Code Block matching the editor's premium look.
const ReadonlyCodeBlock = CodeBlockLowlight.extend({
  renderHTML({ node, HTMLAttributes }) {
    const lang = node.attrs.language || "null";
    return [
      "div",
      { class: "my-8 rounded-xl border border-[#2a2a35] bg-[#111114] overflow-hidden shadow-2xl" },
      [
        "div",
        { class: "flex items-center justify-between px-4 py-2 border-b border-[#2a2a35] bg-[#18181b]" },
        [
          "div",
          { class: "flex items-center gap-2 pl-1" },
          [
            "svg",
            { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 256 256", class: "size-4 fill-[#8c8c9a]" },
            ["path", { d: "M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" }]
          ]
        ],
        [
          "div",
          { class: "flex items-center gap-3 pr-1" },
          ["span", { class: "text-[12px] text-[#8c8c9a] font-medium font-mono uppercase tracking-wider" }, lang === "null" ? "TEXT" : lang]
        ]
      ],
      [
        "pre",
        mergeAttributes(HTMLAttributes, { class: "px-4 py-4 m-0 overflow-x-auto text-[13px] font-mono text-[#e2e2e6] bg-transparent border-none leading-[1.7] hljs" }),
        ["code", 0]
      ]
    ];
  }
}).configure({ lowlight });

export const readonlyExtensions = [
  StarterKit.configure({
    heading: false, // Replaced by our custom ReadonlyHeading
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
  ReadonlyCodeBlock,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-8 mb-8 border-t border-(--outline)" },
  }),
  // TOC: walks the parsed document and stores every heading in
  // editor.storage.tableOfContents.content. getId must match the id
  // ReadonlyHeading.renderHTML writes so anchor links resolve.
  TableOfContents.configure({
    getText: (node: any) => node.textContent,
    getId: (node: any) => slugify(node.textContent || ""),
  } as any),
];
