"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ArticleEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function ArticleEditor({
  value,
  onChange,
  placeholder,
  className,
}: ArticleEditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "min-h-[320px] font-mono text-sm leading-relaxed",
        className,
      )}
    />
  );
}
