"use client";
import { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import {
  CaretDown,
  FileTs,
  FileJs,
  FileJsx,
  FileCss,
  FileHtml,
  FilePy,
  FileRs,
  File,
  Terminal,
  Copy,
  Check,
  Database,
} from "@phosphor-icons/react";

/**
 * Filename + icon derived from the block's `language` attribute.
 *
 * Before: both were hard-coded to `index.tsx` + `FileTs`, so a block set
 * to "HTML" showed a TypeScript icon over the name `index.tsx`. Every
 * element of the header claimed something different from the actual
 * language.
 *
 * `null` (the editor's Plain Text) gets a generic file + `notes.txt`
 * rather than being forced to look like real source.
 */
const LANG_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string; weight?: any }>; tint: string }> = {
  typescript: { label: "TypeScript", icon: FileTs, tint: "text-[#3178c6]" },
  javascript: { label: "JavaScript", icon: FileJs, tint: "text-[#f7df1e]" },
  tsx: { label: "TSX", icon: FileTs, tint: "text-[#3178c6]" },
  jsx: { label: "JSX", icon: FileJsx, tint: "text-[#61dafb]" },
  html: { label: "HTML", icon: FileHtml, tint: "text-[#e34c26]" },
  css: { label: "CSS", icon: FileCss, tint: "text-[#264de4]" },
  scss: { label: "SCSS", icon: FileCss, tint: "text-[#cd6799]" },
  python: { label: "Python", icon: FilePy, tint: "text-[#3776ab]" },
  rust: { label: "Rust", icon: FileRs, tint: "text-[#dea584]" },
  go: { label: "Go", icon: File, tint: "text-[#00add8]" },
  bash: { label: "Bash", icon: Terminal, tint: "text-[#4eaa25]" },
  shell: { label: "Shell", icon: Terminal, tint: "text-[#4eaa25]" },
  json: { label: "JSON", icon: File, tint: "text-[#f7df1e]" },
  sql: { label: "SQL", icon: Database, tint: "text-[#e38c00]" },
  java: { label: "Java", icon: File, tint: "text-[#b07219]" },
  csharp: { label: "C#", icon: File, tint: "text-[#178600]" },
  cpp: { label: "C++", icon: File, tint: "text-[#f34b7d]" },
  c: { label: "C", icon: File, tint: "text-[#555555]" },
  php: { label: "PHP", icon: File, tint: "text-[#4F5D95]" },
  ruby: { label: "Ruby", icon: File, tint: "text-[#701516]" },
  swift: { label: "Swift", icon: File, tint: "text-[#F05138]" },
  kotlin: { label: "Kotlin", icon: File, tint: "text-[#A97BFF]" },
  yaml: { label: "YAML", icon: File, tint: "text-[#cb171e]" },
  markdown: { label: "Markdown", icon: File, tint: "text-[#083fa1]" },
  dockerfile: { label: "Dockerfile", icon: File, tint: "text-[#384d54]" },
  null: { label: "Plain Text", icon: File, tint: "text-[#8c8c9a]" },
};

export function CodeBlockNodeView(props: any) {
  const { node, updateAttributes } = props;
  const { language } = node.attrs;
  const [copied, setCopied] = useState(false);

  const meta = LANG_META[language] ?? LANG_META.null;
  const Icon = meta.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper
      className="relative my-8 rounded-xl border border-[#2a2a35] bg-[#111114] overflow-hidden group/code shadow-2xl"
      // spellCheck={false} on the wrapper is what kills the red
      // squiggle under the filename. The header is a plain <span>,
      // not an input, so this has to be set on the ancestor.
      spellCheck={false}
    >
      {/* contentEditable={false} on the header keeps the cursor out of
          it. Without this, the header was inside the editable region
          and the browser ran spellcheck on it, painting the filename
          with a red squiggly every time it saw "index.tsx". */}
      <div
        contentEditable={false}
        className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a35] bg-[#18181b]"
      >
        <div className="flex items-center gap-2 pl-1">
          <Icon className={`size-4 ${meta.tint}`} weight="fill" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center group/select">
            <select
              value={language || "null"}
              onChange={(e) =>
                updateAttributes({
                  language: e.target.value === "null" ? null : e.target.value,
                })
              }
              className="appearance-none bg-transparent border-none text-[13px] text-[#8c8c9a] outline-none cursor-pointer hover:text-white transition-colors pr-5 "
              style={{ WebkitAppearance: "none", MozAppearance: "none" }}
            >
              {Object.entries(LANG_META).map(([key, meta]) => (
                <option key={key} value={key} className="bg-[#1e1e24] text-white">
                  {meta.label}
                </option>
              ))}
            </select>
            <CaretDown
              className="size-3 absolute right-0 text-[#8c8c9a] pointer-events-none group-hover/select:text-white transition-colors"
              weight="bold"
            />
          </div>
          <div className="w-px h-4 bg-[#2a2a35]" />
          <button
            onClick={handleCopy}
            type="button"
            className="text-[#8c8c9a] hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="size-4 text-[#27c93f]" />
            ) : (
              <Copy className="size-4" />
            )}
          </button>
        </div>
      </div>
      <pre className="px-4 py-4 m-0 overflow-x-auto text-[13px] font-mono text-[#e2e2e6] bg-transparent focus:outline-none border-none leading-[1.7] hljs">
        <NodeViewContent
          as={"code" as any}
          className="bg-transparent border-none text-inherit p-0"
        />
      </pre>
    </NodeViewWrapper>
  );
}
