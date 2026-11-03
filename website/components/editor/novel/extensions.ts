import {
  Command,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapLink,
  UploadImagesPlugin,
} from "novel";
import { CustomImage, VideoNode, GalleryNode } from "./custom-nodes";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeBlockNodeView } from "./code-block-view";

// Initialize lowlight with common languages (js, ts, html, css, python, etc.)
const lowlight = createLowlight(common);

const tiptapImage = CustomImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: "opacity-40 rounded-sm border border-(--outline)",
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: { class: "rounded-sm border border-(--outline)" },
});

const CustomCodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          if (!attributes.language) return {}
          return { 'data-language': attributes.language }
        },
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
}).configure({
  lowlight,
  HTMLAttributes: {
    class: "hljs",
  },
});

export const extensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc list-outside leading-relaxed" } },
    orderedList: { HTMLAttributes: { class: "list-decimal list-outside leading-relaxed" } },
    listItem: { HTMLAttributes: { class: "leading-normal" } },
    blockquote: { HTMLAttributes: { class: "border-l-2 border-(--outline) pl-4 italic" } },
    codeBlock: false, // Disabled in favor of CustomCodeBlock
    code: {
      HTMLAttributes: { class: "rounded-sm bg-(--bg-disabled) px-1.5 py-0.5 font-mono text-sm text-(--primary)", spellcheck: "false" },
    },
    horizontalRule: false,
    dropcursor: { color: "#336DFF", width: 3 },
    gapcursor: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === "heading" ? "Заголовок…" : "Введите '/' для меню или начните писать…",
  }),
  Command.configure({
    suggestion: {
      char: "/",
    },
  }),
  TiptapLink.configure({
    HTMLAttributes: { class: "text-(--primary) underline underline-offset-2" },
  }),
  tiptapImage,
  VideoNode,
  GalleryNode,
  CustomCodeBlock,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-8 mb-8 border-t border-(--outline)" },
  }),
];
