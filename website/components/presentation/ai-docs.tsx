"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "@phosphor-icons/react";
import { useState } from "react";

const AI_DOCS = `# Creating Custom Presentation Slides

To add a new slide type, follow these steps:

1. Create a new file in \`website/components/presentation/slides/MySlide.tsx\`
2. Implement the component. It receives:
   - \`content\`: object (from the database JSON)
   - \`isEditing\`: boolean (true when in the admin panel)
   - \`update\`: function (key, value) to update content
   - \`theme\`: object { mode: 'dark' | 'light', brand: string }

3. Use the \`<Editable>\` component for text so it can be edited inline:

\`\`\`tsx
import { Editable } from "../editable";
import { SlideProps } from "./types";

export function MySlide({ content, isEditing, update, theme }: SlideProps) {
  const brand = theme?.brand || "#CCFF00";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-10">
      <h1 className="text-6xl font-bold" style={{ color: brand }}>
        <Editable 
          value={content.title || ""} 
          onChange={(v) => update?.("title", v)} 
          isEditing={isEditing} 
          placeholder="My Awesome Slide" 
        />
      </h1>
    </div>
  );
}
\`\`\`

4. Register it in \`website/components/presentation/registry.ts\`:

\`\`\`tsx
import { MySlide } from "./slides/MySlide";

export const SLIDE_COMPONENTS = {
  // ... existing
  MySlide,
};

export const SLIDE_META = [
  // ... existing
  { type: "MySlide", label: "My Custom Slide" },
];
\`\`\`

The AI can now use this component in the admin panel.
`;

export function AiDocsModal() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(AI_DOCS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="text" size="small">
          <Code className="size-4 mr-2" /> AI Docs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Инструкция для AI (TSX Slides)</DialogTitle>
          <Button size="small" variant="outlined" onClick={handleCopy}>
            {copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}
            {copied ? "Скопировано" : "Скопировать Markdown"}
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-(--bg) p-6 rounded-xl border border-(--outline) font-mono text-sm whitespace-pre-wrap mt-4">
          {AI_DOCS}
        </div>
      </DialogContent>
    </Dialog>
  );
}
