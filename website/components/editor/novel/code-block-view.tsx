"use client";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export function CodeBlockNodeView(props: any) {
  const { node, updateAttributes } = props;
  const { language } = node.attrs;

  return (
    <NodeViewWrapper className="relative my-6 rounded-md border border-[#2a2a35] bg-[#1e1e24] overflow-hidden group/code">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a35] bg-[#18181d]">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f56]" />
          <div className="size-3 rounded-full bg-[#ffbd2e]" />
          <div className="size-3 rounded-full bg-[#27c93f]" />
        </div>
        <select
          value={language || "null"}
          onChange={(e) => updateAttributes({ language: e.target.value === "null" ? null : e.target.value })}
          className="bg-transparent border-none text-xs text-[#8c8c9a] outline-none cursor-pointer hover:text-white transition-colors"
        >
          <option value="null" className="bg-[#1e1e24]">Auto</option>
          <option value="javascript" className="bg-[#1e1e24]">JavaScript</option>
          <option value="typescript" className="bg-[#1e1e24]">TypeScript</option>
          <option value="html" className="bg-[#1e1e24]">HTML</option>
          <option value="css" className="bg-[#1e1e24]">CSS</option>
          <option value="python" className="bg-[#1e1e24]">Python</option>
          <option value="rust" className="bg-[#1e1e24]">Rust</option>
          <option value="go" className="bg-[#1e1e24]">Go</option>
          <option value="bash" className="bg-[#1e1e24]">Bash</option>
          <option value="json" className="bg-[#1e1e24]">JSON</option>
        </select>
      </div>
      <pre className="p-4 m-0 overflow-x-auto text-sm font-mono text-[#e2e2e6] bg-transparent focus:outline-none">
        <NodeViewContent as={"code" as any} />
      </pre>
    </NodeViewWrapper>
  );
}
