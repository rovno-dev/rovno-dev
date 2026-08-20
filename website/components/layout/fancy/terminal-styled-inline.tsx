"use client";

interface TerminalStyledInlineProps {
  command?: string;
  className?: string;
}

export function TerminalStyledInline({ 
  command = "npx create-rovno-app@latest", 
  className = "" 
}: TerminalStyledInlineProps) {
  return (
    <div className={`max-w-lg w-full mx-auto p-4 rounded-xl bg-white/5 border border-white/10 text-left animate-reveal delay-150 fill-mode-both ${className}`}>
      <code className="text-sm text-neutral-300 font-mono flex items-center gap-2">
        <span className="text-white">$</span>
        <span className="text-emerald-400">npx</span>
        <span className="text-white">{command}</span>
        <span className="text-neutral-500 animate-pulse">|</span>
      </code>
    </div>
  );
}
