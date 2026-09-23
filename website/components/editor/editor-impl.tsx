"use client";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  tablePlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
interface EditorImplProps {
  markdown: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
}
// LLM context: MDXEditor is CodeMirror-based and cannot run on the server.
// This file is client-only and loaded via dynamic(() => import(...), { ssr: false })
// in article-editor.tsx. The CSS import must live here, not in globals.css —
// pulling MDXEditor styles into the global stylesheet slows every route.
export default function EditorImpl({ markdown, onChange, placeholder }: EditorImplProps) {
  const codeBlockLanguages: Record<string, string> = {
    js: "JavaScript",
    ts: "TypeScript",
    tsx: "TSX",
    jsx: "JSX",
    css: "CSS",
    bash: "Bash",
    json: "JSON",
    md: "Markdown",
    text: "Plain text",
  };
  return (
    <div className="mdx-editor-wrapper rounded-xl border border-(--outline) overflow-hidden bg-(--card)">
      <MDXEditor
        markdown={markdown}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose-mdx px-5 py-4 min-h-[420px] text-body-3 text-(--on-bg-high) focus:outline-none"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "ts" }),
          codeMirrorPlugin({ codeBlockLanguages }),
          frontmatterPlugin(),
          markdownShortcutPlugin(),
          diffSourcePlugin({ viewMode: "rich-text" }),
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <ListsToggle />
                <Separator />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />
    </div>
  );
}
