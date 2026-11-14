import { ReactNodeViewRenderer } from "@tiptap/react";
import {
  HorizontalRule,
  Placeholder,
  StarterKit,
  TiptapLink,
  UploadImagesPlugin,
} from "novel";
import { CustomImage, VideoNode, GalleryNode, ColumnsNode, ColumnNode } from "./custom-nodes";
import { suggestionItems } from "./suggestion-items";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { CodeBlockNodeView } from "./code-block-view";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { SlashMenu } from "./slash-menu";
import { Extension } from "@tiptap/core";

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
}).configure({
  lowlight,
  HTMLAttributes: {
    class: "hljs",
  },
});

export const SlashCommand = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
}).configure({
  suggestion: {
    items: ({ query }: { query: string }) => {
      const q = query.toLowerCase();
      return suggestionItems
        .filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.searchTerms.some((term) => term.includes(q)),
        )
        .slice(0, 10);
    },
    render: () => {
      let component: ReactRenderer;
      let popup: any;

      return {
        onStart: (props: SuggestionProps) => {
          component = new ReactRenderer(SlashMenu, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as any,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },
        onUpdate(props: SuggestionProps) {
          component.updateProps(props);
          if (!props.clientRect) return;
          popup[0].setProps({
            getReferenceClientRect: props.clientRect as any,
          });
        },
        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === "Escape") {
            popup[0].hide();
            return true;
          }
          return (component.ref as any)?.onKeyDown(props);
        },
        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  },
});

export const extensions = [
  StarterKit.configure({
    bulletList: { HTMLAttributes: { class: "list-disc list-outside leading-relaxed" } },
    orderedList: { HTMLAttributes: { class: "list-decimal list-outside leading-relaxed" } },
    listItem: { HTMLAttributes: { class: "leading-normal" } },
    blockquote: { HTMLAttributes: { class: "border-l-2 border-(--outline) pl-4 italic" } },
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class: "rounded-sm bg-(--bg-disabled) px-1.5 py-0.5 font-mono text-sm text-(--primary)",
        spellcheck: "false",
      },
    },
    horizontalRule: false,
    dropcursor: { color: "#336DFF", width: 3 },
    gapcursor: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) =>
      node.type.name === "heading" ? "Заголовок…" : "Введите '/' для меню или начните писать…",
  }),
  SlashCommand,
  TiptapLink.configure({
    HTMLAttributes: { class: "text-(--primary) underline underline-offset-2" },
  }),
  tiptapImage,
  VideoNode,
  GalleryNode,
  ColumnsNode,
  ColumnNode,
  CustomCodeBlock,
  HorizontalRule.configure({
    HTMLAttributes: { class: "mt-8 mb-8 border-t border-(--outline)" },
  }),
];
