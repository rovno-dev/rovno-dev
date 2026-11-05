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
const LANG_META: Record<string, { filename: string; icon: React.ComponentType<{ className?: string; weight?: any }>; tint: string }> = {
  typescript: { filename: "index.tsx", icon: FileTs, tint: "text-[#3178c6]" },
  javascript: { filename: "index.js", icon: FileJs, tint: "text-[#f7df1e]" },
  jsx: { filename: "index.jsx", icon: FileJsx, tint: "text-[#61dafb]" },
  tsx: { filename: "index.tsx", icon: FileTs, tint: "text-[#3178c6]" },
  html: { filename: "index.html", icon: FileHtml, tint: "text-[#e34c26]" },
  css: { filename: "styles.css", icon: FileCss, tint: "text-[#264de4]" },
  python: { filename: "main.py", icon: FilePy, tint: "text-[#3776ab]" },
  rust: { filename: "main.rs", icon: FileRs, tint: "text-[#dea584]" },
  go: { filename: "main.go", icon: File, tint: "text-[#00add8]" },
  bash: { filename: "script.sh", icon: Terminal, tint: "text-[#4eaa25]" },
  json: { filename: "data.json", icon: File, tint: "text-[#f7df1e]" },
  null: { filename: "notes.txt", icon: File, tint: "text-[#8c8c9a]" },
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
        className="flex items-center justify-between px-6 py-3 border-b border-[#2a2a35] bg-[#18181b]"
      >
        <div className="flex items-center gap-2 text-[#e2e2e6]">
          <Icon className={`size-4 ${meta.tint}`} weight="fill" />
          <span className="text-[13px] font-medium font-mono text-[#8c8c9a]">
            {meta.filename}
          </span>
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
              className="appearance-none bg-transparent border-none text-[13px] text-[#8c8c9a] outline-none cursor-pointer hover:text-white transition-colors pr-5 font-medium"
              style={{ WebkitAppearance: "none", MozAppearance: "none" }}
            >
              <option value="null" className="bg-[#1e1e24] text-white">Plain Text</option>
              <option value="typescript" className="bg-[#1e1e24] text-white">TypeScript</option>
              <option value="javascript" className="bg-[#1e1e24] text-white">JavaScript</option>
              <option value="html" className="bg-[#1e1e24] text-white">HTML</option>
              <option value="css" className="bg-[#1e1e24] text-white">CSS</option>
              <option value="python" className="bg-[#1e1e24] text-white">Python</option>
              <option value="rust" className="bg-[#1e1e24] text-white">Rust</option>
              <option value="go" className="bg-[#1e1e24] text-white">Go</option>
              <option value="bash" className="bg-[#1e1e24] text-white">Bash</option>
              <option value="json" className="bg-[#1e1e24] text-white">JSON</option>
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
      <pre className="px-6 py-5 m-0 overflow-x-auto text-[14px] font-mono text-[#e2e2e6] bg-transparent focus:outline-none border-none leading-[1.8] hljs">
        <NodeViewContent
          as={"code" as any}
          className="bg-transparent border-none text-inherit p-0"
        />
      </pre>
    </NodeViewWrapper>
  );
}
