"use client";
import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

export function CodeCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="text-[#8c8c9a] hover:text-white transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="size-3.5 text-[#27c93f]" /> : <Copy className="size-3.5" />}
    </button>
  );
}
