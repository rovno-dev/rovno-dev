"use client";
import { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { CaretDown, FileTs, Copy, Check } from "@phosphor-icons/react";

export function CodeBlockNodeView(props: any) {
  const { node, updateAttributes } = props;
  const { language } = node.attrs;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="relative my-8 rounded-xl border border-[#2a2a35] bg-[#111114] overflow-hidden group/code shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a35] bg-[#18181b]">
        {/* Left Side: File Icon & Name */}
        <div className="flex items-center gap-2 text-[#e2e2e6]">
          <FileTs className="size-4 text-[#3178c6]" weight="fill" />
          <span className="text-[13px] font-medium font-mono text-[#8c8c9a]">
            index.tsx
          </span>
        </div>

        {/* Right Side: Language Select & Copy */}
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
            <CaretDown className="size-3 absolute right-0 text-[#8c8c9a] pointer-events-none group-hover/select:text-white transition-colors" weight="bold" />
          </div>
          
          <div className="w-px h-4 bg-[#2a2a35]" />
          
          <button
            onClick={handleCopy}
            type="button"
            className="text-[#8c8c9a] hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="size-4 text-[#27c93f]" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      {/* Code Content Area */}
      <pre className="p-5 m-0 overflow-x-auto text-[14px] font-mono text-[#e2e2e6] bg-transparent focus:outline-none border-none leading-[1.7] hljs">
        <NodeViewContent as={"code" as any} className="bg-transparent border-none text-inherit p-0" />
      </pre>
    </NodeViewWrapper>
  );
}
