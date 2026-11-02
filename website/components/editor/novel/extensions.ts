import {
  Command,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapLink,
  UploadImagesPlugin,
  renderItems,
} from "novel";
import { CustomImage, VideoNode, GalleryNode } from "./custom-nodes";
import { suggestionItems } from "./suggestion-items";
import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CodeBlockNodeView } from "./code-block-view";

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

const CustomCodeBlock = CodeBlock.extend({
  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-language"),
        renderHTML: (attributes) => {
          if (!attributes.language) return {};
          return { "data-language": attributes.language };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
});

export const extensions = [
  StarterKit.configure({
    bulletList: {
      HTMLAttributes: { class: "list-disc list-outside leading-relaxed" },
    },
    orderedList: {
      HTMLAttributes: { class: "list-decimal list-outside leading-relaxed" },
    },
    listItem: { HTMLAttributes: { class: "leading-normal" } },
    blockquote: {
      HTMLAttributes: { class: "border-l-2 border-(--outline) pl-4 italic" },
    },
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class:
          "rounded-sm bg-(--bg-disabled) px-1.5 py-0.5 font-mono text-sm text-(--primary)",
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
      startOfLine: false,
      items: () => suggestionItems,
      render: renderItems,
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
  CustomCodeBlock,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-8 mb-8 border-t border-(--outline)" },
  }),
];
